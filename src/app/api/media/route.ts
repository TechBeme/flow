import { NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function POST(request: NextRequest) {
    const sql = getSql()
    const body = await request.json()
    const { projectId, type, url, thumbnail, prompt, model, aspectRatio, status, referenceImage } = body

    if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 })

    const [row] = await sql`
        INSERT INTO media_items (project_id, type, url, thumbnail, prompt, model, aspect_ratio, status, reference_image)
        VALUES (
            ${projectId}, ${type ?? "image"}, ${url ?? ""}, ${thumbnail ?? ""},
            ${prompt ?? null}, ${model ?? null}, ${aspectRatio ?? "1:1"}, ${status ?? "idle"},
            ${referenceImage ?? null}
        )
        RETURNING id, project_id AS "projectId", type, url, thumbnail,
                  prompt, model, aspect_ratio AS "aspectRatio",
                  status, reference_image AS "referenceImage", created_at AS "createdAt"
    `
    return NextResponse.json(row, { status: 201 })
}
