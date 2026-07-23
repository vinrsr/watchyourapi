import { eq, and } from 'drizzle-orm'
import { db } from '../index'
import { monitors } from '../schema'

export async function createMonitor(
    userId: string,
    data: {
        name: string
        url: string
        intervalSeconds: number
        timeoutSeconds: number
    }
) {
    const result = await db.insert(monitors).values({ userId, ...data, method: 'GET' }).returning()
    return result[0]
}

export async function findMonitorsByUserId(userId: string) {
    return db.query.monitors.findMany({
        where: (m, { eq }) => eq(m.userId, userId),
        orderBy: (m, { desc }) => [desc(m.createdAt)],
        with: { monitorAlertChannels: true },
    })
}

export async function findMonitorById(id: string, userId: string) {
    const result = await db.select().from(monitors)
        .where(and(eq(monitors.id, id), eq(monitors.userId, userId)))
    return result[0] || null
}

export async function updateMonitor(
    id: string,
    userId: string,
    data: Partial<{
        name: string
        url: string
        intervalSeconds: number
        timeoutSeconds: number
        status: 'active' | 'paused' | 'down'
    }>
) {
    const result = await db.update(monitors)
        .set(data)
        .where(and(eq(monitors.id, id), eq(monitors.userId, userId)))
        .returning()
    return result[0] || null
}

export async function deleteMonitor(id: string, userId: string) {
    const result = await db.delete(monitors)
        .where(and(eq(monitors.id, id), eq(monitors.userId, userId)))
        .returning()
    return result[0] || null
}

export async function findAllActiveMonitors() {
    return db.select().from(monitors).where(eq(monitors.status, 'active'))
}

export async function updateMonitorStatus(id: string, status: 'active' | 'paused' | 'down') {
    await db.update(monitors)
        .set({ status, lastCheckedAt: new Date() })
        .where(eq(monitors.id, id))
}