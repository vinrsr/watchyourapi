import { Router, Request, Response } from 'express'
import { db } from '../db/index'
import { monitors, users } from '../db/schema'
import { eq } from 'drizzle-orm'

export const statusRouter = Router()

statusRouter.get('/:userId', async (req: Request, res: Response) => {
    try {
        const user = await db.select({ id: users.id, name: users.name })
            .from(users)
            .where(eq(users.id, req.params.userId))
            .then(r => r[0] || null)

        if (!user) { res.status(404).json({ error: 'Not found' }); return }

        const monitorList = await db.select({
            id: monitors.id,
            name: monitors.name,
            url: monitors.url,
            status: monitors.status,
            lastCheckedAt: monitors.lastCheckedAt,
        })
            .from(monitors)
            .where(eq(monitors.userId, req.params.userId))
            .orderBy(monitors.createdAt)

        const down = monitorList.filter(m => m.status === 'down').length
        const overall = down === 0 ? 'operational' : 'degraded'

        res.json({ user: { name: user.name }, overall, monitors: monitorList })
    } catch {
        res.status(500).json({ error: 'Failed to fetch status' })
    }
})
