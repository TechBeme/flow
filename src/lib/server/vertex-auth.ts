import * as crypto from "crypto"
import path from "path"
import { readFile } from "fs/promises"

interface ServiceAccountKey {
    client_email: string
    private_key: string
    token_uri: string
    project_id: string
}

export const API_NOT_CONFIGURED_ERROR = "API_NOT_CONFIGURED"

export class VertexConfigurationError extends Error {
    constructor() {
        super(API_NOT_CONFIGURED_ERROR)
        this.name = "VertexConfigurationError"
    }
}

export function isVertexConfigurationError(error: unknown): boolean {
    return error instanceof VertexConfigurationError
}

export interface VertexConfig {
    projectId: string
    globalLocation: string
    videoLocation: string
}

let cachedCredentials: ServiceAccountKey | null = null
let cachedCredentialsSource: string | null = null
let cachedToken: { token: string; expiresAt: number } | null = null

function base64url(input: Buffer | string): string {
    const buffer = typeof input === "string" ? Buffer.from(input) : input
    return buffer.toString("base64url")
}

function sourceFingerprint(prefix: string, value: string): string {
    return `${prefix}:${crypto.createHash("sha256").update(value).digest("hex")}`
}

function validateCredentials(parsed: Partial<ServiceAccountKey>): ServiceAccountKey {
    if (!parsed.client_email || !parsed.private_key || !parsed.token_uri || !parsed.project_id) {
        throw new VertexConfigurationError()
    }

    return parsed as ServiceAccountKey
}

async function loadCredentials(): Promise<{ credentials: ServiceAccountKey; source: string }> {
    const inlineJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    if (inlineJson) {
        return {
            credentials: validateCredentials(JSON.parse(inlineJson) as Partial<ServiceAccountKey>),
            source: sourceFingerprint("json", inlineJson),
        }
    }

    const base64Json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64
    if (base64Json) {
        const decoded = Buffer.from(base64Json, "base64").toString("utf-8")
        return {
            credentials: validateCredentials(JSON.parse(decoded) as Partial<ServiceAccountKey>),
            source: sourceFingerprint("base64", base64Json),
        }
    }

    const configuredPath =
        process.env.GOOGLE_APPLICATION_CREDENTIALS ??
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY

    if (!configuredPath) {
        throw new VertexConfigurationError()
    }

    const credentialsPath = path.isAbsolute(configuredPath)
        ? configuredPath
        : path.resolve(process.cwd(), configuredPath)

    const parsed = JSON.parse(await readFile(credentialsPath, "utf-8")) as Partial<ServiceAccountKey>
    return {
        credentials: validateCredentials(parsed),
        source: `file:${credentialsPath}`,
    }
}

async function getCredentials(): Promise<ServiceAccountKey> {
    const loaded = await loadCredentials()
    if (cachedCredentials && cachedCredentialsSource === loaded.source) {
        return cachedCredentials
    }

    cachedCredentials = loaded.credentials
    cachedCredentialsSource = loaded.source
    cachedToken = null
    return cachedCredentials
}

export async function getVertexConfig(): Promise<VertexConfig> {
    const credentials = await getCredentials()
    return {
        projectId: process.env.GOOGLE_CLOUD_PROJECT ?? credentials.project_id,
        globalLocation: process.env.GOOGLE_CLOUD_LOCATION ?? "global",
        videoLocation: process.env.GOOGLE_CLOUD_VIDEO_LOCATION ?? "us-central1",
    }
}

export async function getVertexAccessToken(): Promise<string> {
    if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
        return cachedToken.token
    }

    const credentials = await getCredentials()
    const now = Math.floor(Date.now() / 1000)
    const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
    const payload = base64url(JSON.stringify({
        iss: credentials.client_email,
        scope: "https://www.googleapis.com/auth/cloud-platform",
        aud: credentials.token_uri,
        iat: now,
        exp: now + 3600,
    }))
    const message = `${header}.${payload}`
    const signer = crypto.createSign("RSA-SHA256")
    signer.update(message)
    const assertion = `${message}.${base64url(signer.sign(credentials.private_key))}`

    const response = await fetch(credentials.token_uri, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion,
        }),
    })

    if (!response.ok) {
        const details = await response.text()
        console.error("[vertex-auth] OAuth error:", response.status, details)
        throw new Error("Nao foi possivel autenticar a conta de servico no Vertex AI.")
    }

    const data = await response.json() as { access_token?: string; expires_in?: number }
    if (!data.access_token) {
        throw new Error("O Google OAuth nao retornou um token de acesso.")
    }

    cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    }
    return cachedToken.token
}

export function vertexBaseUrl(location: string): string {
    return location === "global"
        ? "https://aiplatform.googleapis.com"
        : `https://${location}-aiplatform.googleapis.com`
}

export function vertexHeaders(accessToken: string): Record<string, string> {
    return {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
    }
}
