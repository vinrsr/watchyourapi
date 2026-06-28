import { Router, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { authenticate, AuthRequest } from '../middleware/authenticate'
import { findUserById } from '../db/queries/users'
import { db } from '../db/index'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

export const userRouter = Router()

userRouter.use(authenticate)

userRouter.get('/me', async (req: AuthRequest, res: Response) => {
    try {
        const user = await findUserById(req.userId!)
        if (!user) { res.status(404).json({ error: 'User not found' }); return }
        res.json(user)
    } catch {
        res.status(500).json({ error: 'Failed to fetch user' })
    }
})

userRouter.patch('/me', async (req: AuthRequest, res: Response) => {
    const schema = z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
    })

    const result = schema.safeParse(req.body)
    if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return }

    try {
        const updated = await db.update(users)
            .set(result.data)
            .where(eq(users.id, req.userId!))
            .returning({ id: users.id, email: users.email, name: users.name })
        res.json(updated[0])
    } catch {
        res.status(500).json({ error: 'Failed to update user' })
    }
})

userRouter.patch('/me/password', async (req: AuthRequest, res: Response) => {
    const schema = z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
    })

    const result = schema.safeParse(req.body)
    if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return }

    try {
        const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, req.userId!) })
        if (!user) { res.status(404).json({ error: 'User not found' }); return }

        const valid = await bcrypt.compare(result.data.currentPassword, user.passwordHash)
        if (!valid) { res.status(400).json({ error: 'Current password is incorrect' }); return }

        const passwordHash = await bcrypt.hash(result.data.newPassword, 12)
        await db.update(users).set({ passwordHash }).where(eq(users.id, req.userId!))
        res.json({ message: 'Password updated' })
    } catch {
        res.status(500).json({ error: 'Failed to update password' })
    }
})