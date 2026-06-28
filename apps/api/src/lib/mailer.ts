import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendDownAlert(to: string, monitorName: string, url: string, cause: string) {
    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject: `🔴 ${monitorName} is down`,
        html: `
      <h2>${monitorName} is down</h2>
      <p><strong>URL:</strong> ${url}</p>
      <p><strong>Cause:</strong> ${cause}</p>
      <p><strong>Time:</strong> ${new Date().toUTCString()}</p>
      <p>We'll notify you when it recovers.</p>
    `
    })
}

export async function sendRecoveryAlert(to: string, monitorName: string, url: string, durationSeconds: number) {
    const duration = durationSeconds < 60
        ? `${durationSeconds}s`
        : `${Math.round(durationSeconds / 60)}m`

    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject: `✅ ${monitorName} is back up`,
        html: `
      <h2>${monitorName} has recovered</h2>
      <p><strong>URL:</strong> ${url}</p>
      <p><strong>Downtime duration:</strong> ${duration}</p>
      <p><strong>Recovered at:</strong> ${new Date().toUTCString()}</p>
    `
    })
}