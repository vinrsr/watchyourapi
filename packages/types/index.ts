export type MonitorStatus = 'active' | 'paused' | 'down'
export type MonitorMethod = 'GET' | 'POST' | 'HEAD'
export type CheckResult = 'success' | 'timeout' | 'error'
export type AlertChannelType = 'email' | 'slack'

export interface User {
    id: string
    email: string
    name: string
    createdAt: string
}

export interface Monitor {
    id: string
    userId: string
    name: string
    url: string
    method: MonitorMethod
    intervalSeconds: number
    timeoutSeconds: number
    status: MonitorStatus
    lastCheckedAt: string | null
    createdAt: string
}

export interface Check {
    id: string
    monitorId: string
    statusCode: number | null
    responseTimeMs: number | null
    result: CheckResult
    errorMessage: string | null
    checkedAt: string
}

export interface Incident {
    id: string
    monitorId: string
    startedAt: string
    resolvedAt: string | null
    durationSeconds: number | null
    cause: string | null
}

export interface AlertChannel {
    id: string
    userId: string
    type: AlertChannelType
    name: string
    config: Record<string, string>
    createdAt: string
}

export interface MonitorStats {
    uptimePercent: number
    avgResponseTimeMs: number
    totalChecks: number
    totalIncidents: number
}