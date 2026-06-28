import { eq, desc, isNull, and } from 'drizzle-orm'
import { db } from '../index'
import { incidents } from '../schema'

export async function createIncident(monitorId: string, cause: string) {
    const result = await db.insert(incidents)
        .values({ monitorId, cause })
        .returning()
    return result[0]
}

export async function resolveIncident(monitorId: string) {
    const open = await db.select().from(incidents)
        .where(and(eq(incidents.monitorId, monitorId), isNull(incidents.resolvedAt)))

    if (!open[0]) return null

    const startedAt = open[0].startedAt!
    const now = new Date()
    const durationSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000)

    const result = await db.update(incidents)
        .set({ resolvedAt: now, durationSeconds })
        .where(eq(incidents.id, open[0].id))
        .returning()

    return result[0]
}

export async function findOpenIncident(monitorId: string) {
    const result = await db.select().from(incidents)
        .where(and(eq(incidents.monitorId, monitorId), isNull(incidents.resolvedAt)))
    return result[0] || null
}

export async function findIncidentsByMonitorId(monitorId: string) {
    return db.select().from(incidents)
        .where(eq(incidents.monitorId, monitorId))
        .orderBy(desc(incidents.startedAt))
}

export async function findAllIncidentsByUserId(userId: string) {
    return db.query.incidents.findMany({
        with: {
            monitor: {
                columns: { userId: true, name: true, url: true }
            }
        },
        where: (incidents, { isNull }) => isNull(incidents.resolvedAt),
        orderBy: (incidents, { desc }) => desc(incidents.startedAt)
    })
}