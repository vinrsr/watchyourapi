import { api } from './axios'

export const authApi = {
    register: (data: { email: string; password: string; name: string }) =>
        api.post('/auth/register', data).then(r => r.data),

    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data).then(r => r.data),

    logout: (refreshToken: string) =>
        api.post('/auth/logout', { refreshToken }),
}

export const monitorsApi = {
    list: () => api.get('/monitors').then(r => r.data),

    get: (id: string) => api.get(`/monitors/${id}`).then(r => r.data),

    create: (data: {
        name: string
        url: string
        method: string
        intervalSeconds: number
        timeoutSeconds: number
    }) => api.post('/monitors', data).then(r => r.data),

    update: (id: string, data: Partial<{
        name: string
        url: string
        intervalSeconds: number
    }>) => api.patch(`/monitors/${id}`, data).then(r => r.data),

    delete: (id: string) => api.delete(`/monitors/${id}`).then(r => r.data),

    pause: (id: string) => api.post(`/monitors/${id}/pause`).then(r => r.data),

    resume: (id: string) => api.post(`/monitors/${id}/resume`).then(r => r.data),
}

export const checksApi = {
    list: (monitorId: string, page = 1) =>
        api.get(`/monitors/${monitorId}/checks?page=${page}`).then(r => r.data),

    stats: (monitorId: string) =>
        api.get(`/monitors/${monitorId}/stats`).then(r => r.data),
}

export const incidentsApi = {
    all: () => api.get('/incidents').then(r => r.data),
    byMonitor: (monitorId: string) =>
        api.get(`/monitors/${monitorId}/incidents`).then(r => r.data),
}

export const alertChannelsApi = {
    list: () => api.get('/alert-channels').then(r => r.data),

    create: (data: { type: 'email'; name: string; config: { email: string } }) =>
        api.post('/alert-channels', data).then(r => r.data),

    delete: (id: string) => api.delete(`/alert-channels/${id}`).then(r => r.data),

    test: (id: string) => api.post(`/alert-channels/${id}/test`).then(r => r.data),

    attach: (monitorId: string, alertChannelId: string) =>
        api.post(`/alert-channels/monitors/${monitorId}/alert-channels`, { alertChannelId }).then(r => r.data),
}

export const userApi = {
    me: () => api.get('/user/me').then(r => r.data),
    update: (data: { name?: string; email?: string }) =>
        api.patch('/user/me', data).then(r => r.data),
}