import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/authenticate'
import {
    getMonitors,
    getMonitor,
    addMonitor,
    editMonitor,
    removeMonitor,
    pauseMonitor,
    resumeMonitor,
} from '../services/monitors'

export const monitorsRouter = Router()

const createSchema = z.object({
    name: z.string().min(1),
    url: z.string().url(),
    method: z.enum(['GET', 'POST', 'HEAD']).default('GET'),
    intervalSeconds: z.number().min(30).max(86400).default(60),
    timeoutSeconds: z.number().min(5).max(60).default(30),
})

const updateSchema = createSchema.partial()

monitorsRouter.use(authenticate)

monitorsRouter.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const monitors = await getMonitors(req.userId!)
        res.json(monitors)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch monitors'
        res.status(500).json({ error: message })
    }
})

monitorsRouter.post('/', async (req: AuthRequest, res: Response) => {
    const result = createSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json({ error: result.error.flatten() })
        return
    }

    try {
        const monitor = await addMonitor(req.userId!, result.data)
        res.status(201).json(monitor)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create monitor'
        res.status(500).json({ error: message })
    }
})

monitorsRouter.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const monitor = await getMonitor(req.params.id, req.userId!)
        res.json(monitor)
    } catch (err: unknown) {
        res.status(404).json({ error: 'Monitor not found' })
    }
})

monitorsRouter.patch('/:id', async (req: AuthRequest, res: Response) => {
    const result = updateSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json({ error: result.error.flatten() })
        return
    }

    try {
        const monitor = await editMonitor(req.params.id, req.userId!, result.data)
        res.json(monitor)
    } catch (err: unknown) {
        res.status(404).json({ error: 'Monitor not found' })
    }
})

monitorsRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        await removeMonitor(req.params.id, req.userId!)
        res.status(200).json({ message: 'Monitor deleted' })
    } catch (err: unknown) {
        res.status(404).json({ error: 'Monitor not found' })
    }
})

monitorsRouter.post('/:id/pause', async (req: AuthRequest, res: Response) => {
    try {
        const monitor = await pauseMonitor(req.params.id, req.userId!)
        res.json(monitor)
    } catch (err: unknown) {
        res.status(404).json({ error: 'Monitor not found' })
    }
})

monitorsRouter.post('/:id/resume', async (req: AuthRequest, res: Response) => {
    try {
        const monitor = await resumeMonitor(req.params.id, req.userId!)
        res.json(monitor)
    } catch (err: unknown) {
        res.status(404).json({ error: 'Monitor not found' })
    }
})