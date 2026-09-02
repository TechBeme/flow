import { NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const sql = getSql()
    const { id } = await params
    const MAX_ITEMS = 24
    const MAX_RESPONSE_BYTES = 58 * 1024 * 1024 // stay below Neon 64MB hard limit
    const MAX_ITEM_BYTES = 12 * 1024 * 1024

    const rows = await sql`
        WITH filtered AS (
            SELECT id,
                   project_id AS "projectId",
                   type,
                   CASE WHEN type = 'video' THEN url ELSE thumbnail END AS url,
                   thumbnail,
                   prompt,
                   model,
                   aspect_ratio AS "aspectRatio",
                   status,
                   created_at AS "createdAt",
                   (
                       octet_length(COALESCE(thumbnail, ''))
                       + octet_length(COALESCE(CASE WHEN type = 'video' THEN url ELSE thumbnail END, ''))
                   )::BIGINT AS payload_bytes
            FROM media_items
            WHERE project_id = ${id}
              AND (
                  octet_length(COALESCE(thumbnail, ''))
                  + octet_length(COALESCE(CASE WHEN type = 'video' THEN url ELSE thumbnail END, ''))
              )::BIGINT <= ${MAX_ITEM_BYTES}
        ), bounded AS (
            SELECT *,
                   sum(payload_bytes) OVER (
                       ORDER BY "createdAt" DESC
                       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                   ) AS running_bytes,
                   row_number() OVER (ORDER BY "createdAt" DESC) AS rn
            FROM filtered
        )
        SELECT id,
               "projectId",
               type,
               url,
               thumbnail,
               prompt,
               model,
               "aspectRatio",
               status,
               "createdAt"
        FROM bounded
        WHERE rn = 1 OR running_bytes <= ${MAX_RESPONSE_BYTES}
        ORDER BY "createdAt" DESC
        LIMIT ${MAX_ITEMS}
    `
    return NextResponse.json(rows)
}
