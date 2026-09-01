import { NextRequest, NextResponse } from "next/server"
import { sql, ensureSchema } from "@/lib/db"

export async function GET() {
    await ensureSchema()
    const rows = await sql`
        SELECT id, name, thumbnail, grid_size AS "gridSize",
               created_at AS "createdAt", updated_at AS "updatedAt"
        FROM projects
        ORDER BY created_at DESC
    `
    return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
    await ensureSchema()
    const { name } = await request.json()
    if (!name || typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Invalid name" }, { status: 400 })
    }
    const [row] = await sql`
        INSERT INTO projects (name)
        VALUES (${name.trim()})
        RETURNING id, name, thumbnail, grid_size AS "gridSize",
                  created_at AS "createdAt", updated_at AS "updatedAt"
    `
    return NextResponse.json(row, { status: 201 })
}
