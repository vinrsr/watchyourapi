import { eq, and, sql } from 'drizzle-orm'
import { db } from '../index'
import { alertChannels, monitorAlertChannels } from '../schema'

export async function findAlertChannelsByUserId(userId: string) {
    return db.select().from(alertChannels).where(eq(alertChannels.userId, userId))
}

export async function findEmailAlertChannelByAddress(userId: string, email: string) {
    const result = await db.select().from(alertChannels)
        .where(and(
            eq(alertChannels.userId, userId),
            eq(alertChannels.type, 'email'),
            sql`${alertChannels.config}->>'email' = ${email}`
        ))
    return result[0] || null
}

export async function createAlertChannel(
    userId: string,
    data: { type: 'email' | 'slack'; name: string; config: Record<string, string> }
) {
    const result = await db.insert(alertChannels).values({ userId, ...data }).returning()
    return result[0]
}

export async function deleteAlertChannel(id: string, userId: string) {
    const result = await db.delete(alertChannels)
        .where(and(eq(alertChannels.id, id), eq(alertChannels.userId, userId)))
        .returning()
    return result[0] || null
}

export async function attachAlertChannel(monitorId: string, alertChannelId: string) {
    const result = await db.insert(monitorAlertChannels)
        .values({ monitorId, alertChannelId })
        .onConflictDoNothing()
        .returning()
    return result[0]
}

export async function findAttachedChannelIdsByMonitorId(monitorId: string) {
    const rows = await db.select({ alertChannelId: monitorAlertChannels.alertChannelId })
        .from(monitorAlertChannels)
        .where(eq(monitorAlertChannels.monitorId, monitorId))
    return rows.map(r => r.alertChannelId)
}

export async function detachAlertChannel(monitorId: string, alertChannelId: string) {
    const result = await db.delete(monitorAlertChannels)
        .where(
            and(
                eq(monitorAlertChannels.monitorId, monitorId),
                eq(monitorAlertChannels.alertChannelId, alertChannelId)
            )
        )
        .returning()
    return result[0] || null
}