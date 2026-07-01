import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { authRouter } from './routes/auth'
import { monitorsRouter } from './routes/monitors'
import { checksRouter } from './routes/checks'
import { incidentsRouter } from './routes/incidents'
import { alertChannelsRouter } from './routes/alertChannels'
import { userRouter } from './routes/user'
import { errorHandler } from './middleware/errorHandler'
import { startScheduler } from './worker/scheduler'
import { globalIncidentsRouter } from './routes/globalIncidents'
import { statusRouter } from './routes/status'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
    origin: [
        process.env.WEB_URL || 'http://localhost:3000',
        'http://localhost:3000',
    ],
    credentials: true,
}))
app.use(express.json())

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false })
const forgotLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false })

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.use('/auth/login', authLimiter)
app.use('/auth/register', authLimiter)
app.use('/auth/forgot-password', forgotLimiter)
app.use('/auth', authRouter)
app.use('/monitors', monitorsRouter)
app.use('/monitors', checksRouter)
app.use('/monitors', incidentsRouter)
app.use('/alert-channels', alertChannelsRouter)
app.use('/user', userRouter)
app.use('/incidents', globalIncidentsRouter)
app.use('/status', statusRouter)

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`)
    startScheduler().catch(console.error)
})