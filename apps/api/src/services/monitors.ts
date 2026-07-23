import {
    createMonitor,
    findMonitorsByUserId,
    findMonitorById,
    updateMonitor,
    deleteMonitor,
} from '../db/queries/monitors'
import {
    findEmailAlertChannelByAddress,
    createAlertChannel,
    attachAlertChannel,
} from '../db/queries/alertChannels'

export async function getMonitors(userId: string) {
    const monitors = await findMonitorsByUserId(userId)
    return monitors.map(({ monitorAlertChannels, ...monitor }) => ({
        ...monitor,
        hasAlertChannel: monitorAlertChannels.length > 0,
    }))
}

export async function getMonitor(id: string, userId: string) {
    const monitor = await findMonitorById(id, userId)
    if (!monitor) throw new Error('Monitor not found')
    return monitor
}

export async function addMonitor(
    userId: string,
    data: {
        name: string
        url: string
        intervalSeconds: number
        timeoutSeconds: number
        email?: string
    }
) {
    const { email, ...monitorData } = data
    const monitor = await createMonitor(userId, monitorData)

    if (email) {
        const channel = (await findEmailAlertChannelByAddress(userId, email))
            || (await createAlertChannel(userId, { type: 'email', name: email, config: { email } }))
        await attachAlertChannel(monitor.id, channel.id)
    }

    return monitor
}

export async function editMonitor(
    id: string,
    userId: string,
    data: Partial<{
        name: string
        url: string
        intervalSeconds: number
        timeoutSeconds: number
    }>
) {
    const monitor = await updateMonitor(id, userId, data)
    if (!monitor) throw new Error('Monitor not found')
    return monitor
}

export async function removeMonitor(id: string, userId: string) {
    const monitor = await deleteMonitor(id, userId)
    if (!monitor) throw new Error('Monitor not found')
    return monitor
}

export async function pauseMonitor(id: string, userId: string) {
    const monitor = await findMonitorById(id, userId)
    if (!monitor) throw new Error('Monitor not found')
    return updateMonitor(id, userId, { status: 'paused' })
}

export async function resumeMonitor(id: string, userId: string) {
    const monitor = await findMonitorById(id, userId)
    if (!monitor) throw new Error('Monitor not found')
    return updateMonitor(id, userId, { status: 'active' })
}