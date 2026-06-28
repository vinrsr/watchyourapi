import { eq, desc, and, gte, lte } from 'drizzle-orm'
import { db } from '../index'
import { checks } from '../schema'

export async function createCheck(data: {
    monitorId: string
    statusCode: number | null
    responseTimeMs: number | null
    result: 'success' | 'timeout' | 'error'
    errorMessage?: string | null
}) {
    const result = await db.insert(checks).values(data).returning()
    return result[0]
}

export async function findChecksByMonitorId(
    monitorId: string,
    limit = 50,
    offset = 0
) {
    return db.select().from(checks)
        .where(eq(checks.monitorId, monitorId))
        .orderBy(desc(checks.checkedAt))
        .limit(limit)
        .offset(offset)
}

export async function getMonitorStats(monitorId: string, from: Date, to: Date) {
    const result = await db.select().from(checks)
        .where(
            and(
                eq(checks.monitorId, monitorId),
                gte(checks.checkedAt, from),
                lte(checks.checkedAt, to)
            )
        )

    const total = result.length
    if (total === 0) return { uptimePercent: 100, avgResponseTimeMs: 0, totalChecks: 0 }

    const successful = result.filter(c => c.result === 'success').length
    const responseTimes = result
        .filter(c => c.responseTimeMs !== null)
        .map(c => c.responseTimeMs as number)

    const avgResponseTimeMs = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0

    return {
        uptimePercent: Math.round((successful / total) * 100 * 100) / 100,
        avgResponseTimeMs,
        totalChecks: total,
    }
}