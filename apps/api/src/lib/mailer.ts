import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendDownAlert(to: string, monitorName: string, url: string, cause: string) {
    await resend.emails.send({
        from: 'WatchYourAPI <watchyourapi@vinrsr.com>',
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

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
    await resend.emails.send({
        from: 'WatchYourAPI <watchyourapi@vinrsr.com>',
        to,
        subject: 'Reset your WatchYourAPI password',
        html: `
      <h2>Reset your password</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}" style="color:#6366f1">Reset password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `
    })
}

export async function sendTestAlert(to: string, channelName: string, monitorName?: string, monitorUrl?: string) {
    const name = monitorName ?? 'Your API Monitor'
    const url = monitorUrl ?? 'https://your-api.example.com'

    await resend.emails.send({
        from: 'WatchYourAPI <watchyourapi@vinrsr.com>',
        to,
        subject: `🔔 Test alert from WatchYourAPI`,
        html: `
      <h2>This is a test alert</h2>
      <p>Your alert channel <strong>${channelName}</strong> is working correctly.</p>
      <p>If a real incident occurs, here's what the alert will look like:</p>
      <hr />
      <h3>${name} is down</h3>
      <p><strong>URL:</strong> ${url}</p>
      <p><strong>Cause:</strong> Connection timed out</p>
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
        from: 'WatchYourAPI <watchyourapi@vinrsr.com>',
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