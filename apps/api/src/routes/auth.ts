import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { register, login, refresh, logout } from '../services/auth'

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