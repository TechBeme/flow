import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const body = await request.json()
    const { name, thumbnail, gridSize } = body

    if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json({ error: "Invalid name" }, { status: 400 })
        }
        await sql`
            UPDATE projects
            SET name = ${name.trim()}, updated_at = NOW()
            WHERE id = ${id}
        `
    }

    if (thumbnail !== undefined) {
        await sql`
            UPDATE projects
            SET thumbnail = ${thumbnail}, updated_at = NOW()
            WHERE id = ${id}
        `
    }

    if (gridSize !== undefined) {
        if (typeof gridSize !== "number" || gridSize < 100 || gridSize > 400) {
            return NextResponse.json({ error: "Invalid gridSize" }, { status: 400 })
        }
        await sql`
            UPDATE projects
            SET grid_size = ${gridSize}, updated_at = NOW()
            WHERE id = ${id}
        `
    }

    const [row] = await sql`
        SELECT id, name, thumbnail, grid_size AS "gridSize",
               created_at AS "createdAt", updated_at AS "updatedAt"
        FROM projects WHERE id = ${id}
    `
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(row)
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    await sql`DELETE FROM projects WHERE id = ${id}`
    return NextResponse.json({ ok: true })
}
