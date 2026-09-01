import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const { url, thumbnail, status } = await request.json()

    await sql`
        UPDATE media_items
        SET
            url       = COALESCE(${url ?? null}, url),
            thumbnail = COALESCE(${thumbnail ?? null}, thumbnail),
            status    = COALESCE(${status ?? null}, status)
        WHERE id = ${id}
    `

    const [row] = await sql`
        SELECT id, project_id AS "projectId", type, url, thumbnail,
               prompt, model, aspect_ratio AS "aspectRatio",
               status, reference_image AS "referenceImage", created_at AS "createdAt"
        FROM media_items WHERE id = ${id}
    `
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(row)
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    await sql`DELETE FROM media_items WHERE id = ${id}`
    return NextResponse.json({ ok: true })
}
