import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/authenticate'
import { findMonitorById } from '../db/queries/monitors'
import { findIncidentsByMonitorId } from '../db/queries/incidents'
import { db } from '../db/index'
import { incidents, monitors } from '../db/schema'
import { eq } from 'drizzle-orm'

export const incidentsRouter = Router()

incidentsRouter.use(authenticate)

incidentsRouter.get('/:id/incidents', async (req: AuthRequest, res: Response) => {
    try {
        const monitor = await findMonitorById(req.params.id, req.userId!)
        if (!monitor) { res.status(404).json({ error: 'Monitor not found' }); return }

        const data = await findIncidentsByMonitorId(req.params.id)
        res.json(data)
    } catch {
        res.status(500).json({ error: 'Failed to fetch incidents' })
    }
})