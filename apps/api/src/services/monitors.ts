import {
    createMonitor,
    findMonitorsByUserId,
    findMonitorById,
    updateMonitor,
    deleteMonitor,
} from '../db/queries/monitors'

export async function getMonitors(userId: string) {
    return findMonitorsByUserId(userId)
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
        method: 'GET' | 'POST' | 'HEAD'
        intervalSeconds: number
        timeoutSeconds: number
    }
) {
    return createMonitor(userId, data)
}

export async function editMonitor(
    id: string,
    userId: string,
    data: Partial<{
        name: string
        url: string
        method: 'GET' | 'POST' | 'HEAD'
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