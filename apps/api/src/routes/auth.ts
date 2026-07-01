import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { eq, and, gt } from 'drizzle-orm'
import { register, login, refresh, logout } from '../services/auth'
import { db } from '../db/index'
import { passwordResets, users } from '../db/schema'
import { findUserByEmail } from '../db/queries/users'
import { sendPasswordResetEmail } from '../lib/mailer'

export const authRouter = Router()

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1)
})

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
})

authRouter.post('/register', async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json({ error: result.error.flatten() })
        return
    }

    try {
        const { email, password, name } = result.data
        const data = await register(email, password, name)
        res.status(201).json(data)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Registration failed'
        res.status(400).json({ error: message })
    }
})

authRouter.post('/login', async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json({ error: result.error.flatten() })
        return
    }

    try {
        const { email, password } = result.data
        const data = await login(email, password)
        res.status(200).json(data)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Login failed'
        res.status(401).json({ error: message })
    }
})

authRouter.post('/refresh', async (req: Request, res: Response) => {
    const { refreshToken } = req.body
    if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token required' })
        return
    }

    try {
        const data = await refresh(refreshToken)
        res.status(200).json(data)
    } catch (err: unknown) {
        res.status(401).json({ error: 'Invalid refresh token' })
    }
})

authRouter.post('/logout', async (req: Request, res: Response) => {
    const { refreshToken } = req.body
    if (refreshToken) {
        await logout(refreshToken)
    }
    res.status(200).json({ message: 'Logged out' })
})

authRouter.post('/forgot-password', async (req: Request, res: Response) => {
    const { email } = req.body
    if (!email) { res.status(400).json({ error: 'Email required' }); return }

    try {
        const user = await findUserByEmail(email)
        // Always return success to avoid leaking whether an email exists
        if (user) {
            const token = randomBytes(32).toString('hex')
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

            await db.delete(passwordResets).where(eq(passwordResets.userId, user.id))
            await db.insert(passwordResets).values({ userId: user.id, token, expiresAt })

            const resetUrl = `${process.env.WEB_URL || 'http://localhost:3000'}/reset-password?token=${token}`
            await sendPasswordResetEmail(user.email, resetUrl)
        }

        res.json({ message: 'If that email exists, a reset link has been sent' })
    } catch {
        res.status(500).json({ error: 'Failed to process request' })
    }
})

authRouter.post('/reset-password', async (req: Request, res: Response) => {
    const schema = z.object({ token: z.string(), newPassword: z.string().min(8) })
    const result = schema.safeParse(req.body)
    if (!result.success) { res.status(400).json({ error: 'Invalid request' }); return }

    try {
        const reset = await db.select().from(passwordResets)
            .where(and(
                eq(passwordResets.token, result.data.token),
                gt(passwordResets.expiresAt, new Date()),
            ))
            .then(r => r[0] || null)

        if (!reset) { res.status(400).json({ error: 'Invalid or expired reset link' }); return }

        const passwordHash = await bcrypt.hash(result.data.newPassword, 12)
        await db.update(users).set({ passwordHash }).where(eq(users.id, reset.userId))
        await db.delete(passwordResets).where(eq(passwordResets.id, reset.id))

        res.json({ message: 'Password reset successfully' })
    } catch {
        res.status(500).json({ error: 'Failed to reset password' })
    }
})