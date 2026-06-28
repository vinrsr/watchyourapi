import axios from 'axios'
import { findMonitorById, updateMonitorStatus } from '../db/queries/monitors'
import { createCheck } from '../db/queries/checks'
import { createIncident, resolveIncident, findOpenIncident } from '../db/queries/incidents'
import { db } from '../db/index'
import { alertChannels, monitorAlertChannels } from '../db/schema'
import { eq } from 'drizzle-orm'
import { sendDownAlert, sendRecoveryAlert } from '../lib/mailer'

export async function processMonitorCheck(monitorId: string) {
    const monitor = await db.query.monitors.findFirst({
        where: (m, { eq }) => eq(m.id, monitorId),
        with: {
            monitorAlertChannels: {
                with: { alertChannel: true }
            }
        }
    })

    if (!monitor || monitor.status !== 'active') return

    const startTime = Date.now()
    let statusCode: number | null = null
    let responseTimeMs: number | null = null
    let result: 'success' | 'timeout' | 'error' = 'error'
    let errorMessage: string | null = null

    try {
        const response = await axios({
            method: monitor.method,
            url: monitor.url,
            timeout: monitor.timeoutSeconds * 1000,
            validateStatus: () => true,
        })

        responseTimeMs = Date.now() - startTime
        statusCode = response.status
        result = response.status >= 200 && response.status < 300 ? 'success' : 'error'
        if (result === 'error') {
            errorMessage = `Received status ${response.status}`
        }
    } catch (err: unknown) {
        responseTimeMs = Date.now() - startTime
        if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
            result = 'timeout'
            errorMessage = `Timed out after ${monitor.timeoutSeconds}s`
        } else {
            result = 'error'
            errorMessage = err instanceof Error ? err.message : 'Unknown error'
        }
    }

    await createCheck({ monitorId, statusCode, responseTimeMs, result, errorMessage })

    const wasDown = await findOpenIncident(monitorId)

    if (result !== 'success') {
        await updateMonitorStatus(monitorId, 'down')

        if (!wasDown) {
            const incident = await createIncident(monitorId, errorMessage || 'Unknown error')
            await sendAlerts(monitor, 'down', errorMessage || 'Unknown error', 0)
        }
    } else {
        await updateMonitorStatus(monitorId, 'active')

        if (wasDown) {
            const resolved = await resolveIncident(monitorId)
            await sendAlerts(monitor, 'up', '', resolved?.durationSeconds || 0)
        }
    }
}

async function sendAlerts(
    monitor: any,
    type: 'down' | 'up',
    cause: string,
    durationSeconds: number
) {
    const channels = monitor.monitorAlertChannels?.map((mac: any) => mac.alertChannel) || []

    for (const channel of channels) {
        try {
            if (channel.type === 'email') {
                const email = (channel.config as any).email
                if (type === 'down') {
                    await sendDownAlert(email, monitor.name, monitor.url, cause)
                } else {
                    await sendRecoveryAlert(email, monitor.name, monitor.url, durationSeconds)
                }
            }
        } catch (err) {
            console.error(`Failed to send alert via ${channel.type}:`, err)
        }
    }
}