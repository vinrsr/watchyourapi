import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/authenticate'
import { findMonitorById } from '../db/queries/monitors'
import { findChecksByMonitorId, getMonitorStats } from '../db/queries/checks'

export const checksRouter = Router()

checksRouter.use(authenticate)

checksRouter.get('/:id/checks', async (req: AuthRequest, res: Response) => {
    try {
        const monitor = await findMonitorById(req.params.id, req.userId!)
        if (!monitor) { res.status(404).json({ error: 'Monitor not found' }); return }

        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 50
        const offset = (page - 1) * limit

        const data = await findChecksByMonitorId(req.params.id, limit, offset)
        res.json({ data, page, limit })
    } catch {
        res.status(500).json({ error: 'Failed to fetch checks' })
    }
})

checksRouter.get('/:id/stats', async (req: AuthRequest, res: Response) => {
    try {
        const monitor = await findMonitorById(req.params.id, req.userId!)
        if (!monitor) { res.status(404).json({ error: 'Monitor not found' }); return }

        const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const to = req.query.to ? new Date(req.query.to as string) : new Date()

        const stats = await getMonitorStats(req.params.id, from, to)
        res.json(stats)
    } catch {
        res.status(500).json({ error: 'Failed to fetch stats' })
    }
})