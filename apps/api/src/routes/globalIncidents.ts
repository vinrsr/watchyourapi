import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/authenticate'
import { db } from '../db/index'
import { incidents, monitors } from '../db/schema'
import { eq } from 'drizzle-orm'

export const globalIncidentsRouter = Router()

globalIncidentsRouter.use(authenticate)

globalIncidentsRouter.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const data = await db.select({
            id: incidents.id,
            monitorId: incidents.monitorId,
            monitorName: monitors.name,
            monitorUrl: monitors.url,
            startedAt: incidents.startedAt,
            resolvedAt: incidents.resolvedAt,
            durationSeconds: incidents.durationSeconds,
            cause: incidents.cause,
        })
            .from(incidents)
            .innerJoin(monitors, eq(incidents.monitorId, monitors.id))
            .where(eq(monitors.userId, req.userId!))
            .orderBy(incidents.startedAt)

        res.json(data)
    } catch {
        res.status(500).json({ error: 'Failed to fetch incidents' })
    }
})