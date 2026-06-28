import { Queue, Worker } from 'bullmq'
import { findAllActiveMonitors } from '../db/queries/monitors'
import { processMonitorCheck } from './processor'

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
}

export const monitorQueue = new Queue('monitor-checks', { connection })

export async function startScheduler() {
    console.log('Starting scheduler...')

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

    await scheduleAllMonitors()

    setInterval(scheduleAllMonitors, 60_000)

    console.log('Scheduler running')
}

async function scheduleAllMonitors() {
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
}