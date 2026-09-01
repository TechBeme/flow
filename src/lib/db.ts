import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

export async function ensureSchema() {
    await sql`
        CREATE TABLE IF NOT EXISTS projects (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name        TEXT NOT NULL,
            thumbnail   TEXT,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `
    await sql`
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS grid_size INTEGER NOT NULL DEFAULT 140
    `
    await sql`
        CREATE TABLE IF NOT EXISTS media_items (
            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            type            TEXT NOT NULL DEFAULT 'image',
            url             TEXT NOT NULL DEFAULT '',
            thumbnail       TEXT NOT NULL DEFAULT '',
            prompt          TEXT,
            model           TEXT,
            aspect_ratio    TEXT NOT NULL DEFAULT '1:1',
            status          TEXT NOT NULL DEFAULT 'idle',
            reference_image TEXT,
            created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `
    await sql`ALTER TABLE media_items ADD COLUMN IF NOT EXISTS reference_image TEXT`
}
