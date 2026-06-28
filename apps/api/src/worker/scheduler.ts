import { Queue, Worker } from 'bullmq'
import { findAllActiveMonitors } from '../db/queries/monitors'
import { processMonitorCheck } from './processor'

function getConnection() {
    const url = process.env.REDIS_URL
    console.log('Redis URL:', url?.slice(0, 30))
    if (url) {
        return { url, tls: {} }
    }
    return {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    }
}

export async function startScheduler() {
    try {
        const connection = getConnection()
        console.log('Starting scheduler with connection:', JSON.stringify(connection).slice(0, 50))

        const monitorQueue = new Queue('monitor-checks', { connection })

        const worker = new Worker(
            'monitor-checks',
            async (job) => {
                await processMonitorCheck(job.data.monitorId)
            },
            { connection, concurrency: 10 }
        )

        worker.on('failed', (job, err) => {
            console.error(`Job failed for monitor ${job?.data.monitorId}:`, err)
        })

        worker.on('error', (err) => {
            console.error('Worker error:', err)
        })

        await scheduleAllMonitors(monitorQueue)
        setInterval(() => scheduleAllMonitors(monitorQueue), 60_000)

        console.log('Scheduler running')
    } catch (err) {
        console.error('Scheduler failed to start:', err)
        console.log('API will continue without scheduler')
    }
}

async function scheduleAllMonitors(monitorQueue: Queue) {
    try {
        const monitors = await findAllActiveMonitors()
        for (const monitor of monitors) {
            await monitorQueue.add(
                `check-${monitor.id}`,
                { monitorId: monitor.id },
                {
                    jobId: `check-${monitor.id}`,
                    repeat: { every: monitor.intervalSeconds * 1000 },
                    removeOnComplete: 100,
                    removeOnFail: 50,
                }
            )
        }
    } catch (err) {
        console.error('Failed to schedule monitors:', err)
    }
}