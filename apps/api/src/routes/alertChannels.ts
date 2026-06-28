import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/authenticate'
import {
    findAlertChannelsByUserId,
    createAlertChannel,
    deleteAlertChannel,
    attachAlertChannel,
    detachAlertChannel,
} from '../db/queries/alertChannels'
import { findMonitorById } from '../db/queries/monitors'
import { sendDownAlert } from '../lib/mailer'

export const alertChannelsRouter = Router()

alertChannelsRouter.use(authenticate)

const createSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('email'),
        name: z.string().min(1),
        config: z.object({ email: z.string().email() }),
    }),
])

alertChannelsRouter.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const data = await findAlertChannelsByUserId(req.userId!)
        res.json(data)
    } catch {
        res.status(500).json({ error: 'Failed to fetch alert channels' })
    }
})

alertChannelsRouter.post('/', async (req: AuthRequest, res: Response) => {
    const result = createSchema.safeParse(req.body)
    if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return }

    try {
        const channel = await createAlertChannel(req.userId!, result.data)
        res.status(201).json(channel)
    } catch {
        res.status(500).json({ error: 'Failed to create alert channel' })
    }
})

alertChannelsRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const channel = await deleteAlertChannel(req.params.id, req.userId!)
        if (!channel) { res.status(404).json({ error: 'Alert channel not found' }); return }
        res.json({ message: 'Alert channel deleted' })
    } catch {
        res.status(500).json({ error: 'Failed to delete alert channel' })
    }
})

alertChannelsRouter.post('/:id/test', async (req: AuthRequest, res: Response) => {
    try {
        const channels = await findAlertChannelsByUserId(req.userId!)
        const channel = channels.find(c => c.id === req.params.id)
        if (!channel) { res.status(404).json({ error: 'Alert channel not found' }); return }

        if (channel.type === 'email') {
            await sendDownAlert((channel.config as any).email, 'Test Monitor', 'https://example.com', 'This is a test alert')
        }

        res.json({ message: 'Test alert sent' })
    } catch {
        res.status(500).json({ error: 'Failed to send test alert' })
    }
})

alertChannelsRouter.post('/monitors/:monitorId/alert-channels', async (req: AuthRequest, res: Response) => {
    const { alertChannelId } = req.body
    if (!alertChannelId) { res.status(400).json({ error: 'alertChannelId required' }); return }

    try {
        const monitor = await findMonitorById(req.params.monitorId, req.userId!)
        if (!monitor) { res.status(404).json({ error: 'Monitor not found' }); return }

        const result = await attachAlertChannel(req.params.monitorId, alertChannelId)
        res.status(201).json(result)
    } catch {
        res.status(500).json({ error: 'Failed to attach alert channel' })
    }
})

alertChannelsRouter.delete('/monitors/:monitorId/alert-channels/:channelId', async (req: AuthRequest, res: Response) => {
    try {
        const monitor = await findMonitorById(req.params.monitorId, req.userId!)
        if (!monitor) { res.status(404).json({ error: 'Monitor not found' }); return }

        await detachAlertChannel(req.params.monitorId, req.params.channelId)
        res.json({ message: 'Alert channel detached' })
    } catch {
        res.status(500).json({ error: 'Failed to detach alert channel' })
    }
})