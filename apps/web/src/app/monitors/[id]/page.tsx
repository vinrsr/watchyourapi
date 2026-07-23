'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { monitorsApi, checksApi, incidentsApi, alertChannelsApi } from '@/lib/queries'
import DashboardLayout from '@/components/DashboardLayout'
import PageLoading from '@/components/PageLoading'
import { useAuthStore } from '@/store/auth'

export default function MonitorDetailPage() {
    const { id } = useParams<{ id: string }>()
    const queryClient = useQueryClient()
    const accountEmail = useAuthStore(s => s.user?.email)
    const [checksPage, setChecksPage] = useState(1)

    const { data: monitor, isLoading } = useQuery({
        queryKey: ['monitor', id],
        queryFn: () => monitorsApi.get(id),
    })

    const { data: stats } = useQuery({
        queryKey: ['stats', id],
        queryFn: () => checksApi.stats(id),
        refetchInterval: 30_000,
    })

    const { data: checksData } = useQuery({
        queryKey: ['checks', id, checksPage],
        queryFn: () => checksApi.list(id, checksPage),
        refetchInterval: 30_000,
    })

    const { data: incidents } = useQuery({
        queryKey: ['incidents', id],
        queryFn: () => incidentsApi.byMonitor(id),
    })

    const { data: alertChannels = [] } = useQuery({
        queryKey: ['alert-channels'],
        queryFn: alertChannelsApi.list,
    })

    const { data: attachedIds = [] } = useQuery({
        queryKey: ['attached-channels', id],
        queryFn: () => alertChannelsApi.attachedChannels(id),
    })

    const attachMutation = useMutation({
        mutationFn: ({ monitorId, alertChannelId }: { monitorId: string; alertChannelId: string }) =>
            alertChannelsApi.attach(monitorId, alertChannelId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attached-channels', id] }),
    })

    const detachMutation = useMutation({
        mutationFn: ({ monitorId, alertChannelId }: { monitorId: string; alertChannelId: string }) =>
            alertChannelsApi.detach(monitorId, alertChannelId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attached-channels', id] }),
    })

    if (isLoading) {
        return (
            <DashboardLayout>
                <PageLoading />
            </DashboardLayout>
        )
    }

    if (!monitor) {
        return (
            <DashboardLayout>
                <div className="text-sm text-white/40">Monitor not found</div>
            </DashboardLayout>
        )
    }

    const checks = checksData?.data ?? []
    const isLastPage = checks.length < (checksData?.limit ?? 50)
    const maxResponseMs = Math.max(...checks.map((c: any) => c.responseTimeMs ?? 0), 1)

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">{monitor.name}</h1>
                        <p className="text-white/30 text-sm mt-1 font-mono">{monitor.url}</p>
                    </div>
                    <StatusBadge status={monitor.status} />
                </div>

                {attachedIds.length === 0 && (
                    <div className="relative overflow-hidden rounded-2xl border-l-4 border-amber-400 bg-amber-400/15 px-5 py-4 shadow-lg shadow-amber-500/10">
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-base">
                                ⚠
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-amber-200">No alert email attached to this monitor</p>
                                <p className="text-sm text-amber-100/80 mt-1">
                                    If it goes down, we&apos;ll fall back to notifying your registered account email{' '}
                                    {accountEmail ? <span className="font-semibold text-white">{accountEmail}</span> : '(not set)'}.
                                    Attach a dedicated alert email below if you&apos;d like other people notified too.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {stats && (
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Uptime (7d)', value: `${stats.uptimePercent}%` },
                            { label: 'Avg response', value: `${stats.avgResponseTimeMs}ms` },
                            { label: 'Total checks', value: stats.totalChecks },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5">
                                <p className="text-sm text-white/40">{stat.label}</p>
                                <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Response time chart */}
                {checks.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 px-6 py-5">
                        <p className="text-sm font-medium text-white mb-4">Response time</p>
                        <div className="flex items-end gap-px h-16">
                            {[...checks].reverse().map((check: any) => {
                                const heightPct = check.responseTimeMs
                                    ? Math.max(4, Math.round((check.responseTimeMs / maxResponseMs) * 100))
                                    : 4
                                return (
                                    <div
                                        key={check.id}
                                        title={check.responseTimeMs ? `${check.responseTimeMs}ms` : check.result}
                                        style={{ height: `${heightPct}%` }}
                                        className={`flex-1 rounded-sm transition-opacity hover:opacity-70 cursor-default ${
                                            check.result === 'success' ? 'bg-emerald-400/70' : 'bg-red-400/70'
                                        }`}
                                    />
                                )
                            })}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-white/20">
                            <span>oldest</span>
                            <span>newest</span>
                        </div>
                    </div>
                )}

                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="px-6 py-4 border-b border-white/10">
                        <h2 className="font-medium text-white">Alert channels</h2>
                    </div>
                    <div className="px-6 py-4">
                        {alertChannels.length === 0 ? (
                            <p className="text-sm text-white/40">
                                No alert channels yet.{' '}
                                <a href="/settings" className="text-[#2EDB8F] hover:text-[#7DF0BC] transition-colors">Add one in settings</a>
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {alertChannels.map((channel: any) => {
                                    const isAttached = attachedIds.includes(channel.id)
                                    const isPending = (isAttached ? detachMutation : attachMutation).isPending

                                    return (
                                        <div key={channel.id} className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isAttached ? 'bg-emerald-400' : 'bg-white/15'}`} />
                                                <div>
                                                    <p className="text-sm font-medium text-white">{channel.name}</p>
                                                    <p className="text-xs text-white/30 mt-0.5">{channel.config.email}</p>
                                                </div>
                                            </div>
                                            {isAttached ? (
                                                <button
                                                    onClick={() => detachMutation.mutate({ monitorId: id, alertChannelId: channel.id })}
                                                    disabled={isPending}
                                                    className="text-xs px-3 py-1.5 rounded-lg border border-white/15 text-white/40 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-all"
                                                >
                                                    {isPending ? 'Removing...' : 'Detach'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => attachMutation.mutate({ monitorId: id, alertChannelId: channel.id })}
                                                    disabled={isPending}
                                                    className="text-xs px-3 py-1.5 bg-[#2EDB8F] text-slate-900 rounded-lg hover:bg-[#25C07A] disabled:opacity-50 transition-colors"
                                                >
                                                    {isPending ? 'Attaching...' : 'Attach'}
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="font-medium text-white">Recent checks</h2>
                        <span className="text-xs text-white/30">Page {checksPage}</span>
                    </div>
                    <div className="divide-y divide-white/10">
                        {checks.map((check: any) => (
                            <div key={check.id} className="flex items-center justify-between px-6 py-3">
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${check.result === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    <span className="text-sm text-white/60">
                                        {check.statusCode ? `HTTP ${check.statusCode}` : check.result}
                                    </span>
                                    {check.errorMessage && (
                                        <span className="text-xs text-red-400">{check.errorMessage}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-white/30">
                                    {check.responseTimeMs && <span>{check.responseTimeMs}ms</span>}
                                    <span>{new Date(check.checkedAt).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between">
                        <button
                            onClick={() => setChecksPage(p => Math.max(1, p - 1))}
                            disabled={checksPage === 1}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/15 text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setChecksPage(p => p + 1)}
                            disabled={isLastPage}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/15 text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>

                {incidents && incidents.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                        <div className="px-6 py-4 border-b border-white/10">
                            <h2 className="font-medium text-white">Incidents</h2>
                        </div>
                        <div className="divide-y divide-white/10">
                            {incidents.map((incident: any) => (
                                <div key={incident.id} className="flex items-center justify-between px-6 py-4">
                                    <div>
                                        <p className="text-sm text-white">{incident.cause}</p>
                                        <p className="text-xs text-white/30 mt-0.5">
                                            Started {new Date(incident.startedAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {incident.resolvedAt ? (
                                            <span className="text-xs text-emerald-400 font-medium">Resolved</span>
                                        ) : (
                                            <span className="text-xs text-red-400 font-medium">Ongoing</span>
                                        )}
                                        {incident.durationSeconds && (
                                            <p className="text-xs text-white/30 mt-0.5">
                                                {Math.round(incident.durationSeconds / 60)}m downtime
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
        down: 'bg-red-400/10 text-red-400 border-red-400/20',
        paused: 'bg-white/5 text-white/40 border-white/10',
    }
    const labels: Record<string, string> = {
        active: 'Operational',
        down: 'Down',
        paused: 'Paused',
    }
    return (
        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${styles[status] || styles.paused}`}>
            {labels[status] || status}
        </span>
    )
}