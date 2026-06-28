'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { monitorsApi, checksApi, incidentsApi, alertChannelsApi } from '@/lib/queries'
import DashboardLayout from '@/components/DashboardLayout'

export default function MonitorDetailPage() {
    const { id } = useParams<{ id: string }>()
    const queryClient = useQueryClient()

    const { data: monitor, isLoading } = useQuery({
        queryKey: ['monitor', id],
        queryFn: () => monitorsApi.get(id),
    })

    const { data: stats } = useQuery({
        queryKey: ['stats', id],
        queryFn: () => checksApi.stats(id),
        refetchInterval: 30_000,
    })

    const { data: checks } = useQuery({
        queryKey: ['checks', id],
        queryFn: () => checksApi.list(id),
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

    const attachMutation = useMutation({
        mutationFn: ({ monitorId, alertChannelId }: { monitorId: string; alertChannelId: string }) =>
            alertChannelsApi.attach(monitorId, alertChannelId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitor', id] }),
    })

    if (isLoading) return <div className="text-sm text-gray-500">Loading...</div>
    if (!monitor) return <div className="text-sm text-gray-500">Monitor not found</div>

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{monitor.name}</h1>
                        <p className="text-gray-400 text-sm mt-1">{monitor.url}</p>
                    </div>
                    <StatusBadge status={monitor.status} />
                </div>

                {stats && (
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Uptime (7d)', value: `${stats.uptimePercent}%` },
                            { label: 'Avg response', value: `${stats.avgResponseTimeMs}ms` },
                            { label: 'Total checks', value: stats.totalChecks },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-medium text-gray-900">Alert channels</h2>
                    </div>
                    <div className="px-6 py-4">
                        {alertChannels.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No alert channels yet.{' '}
                                <a href="/settings" className="text-blue-600 hover:underline">Add one in settings</a>
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {alertChannels.map((channel: any) => (
                                    <div key={channel.id} className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{channel.name}</p>
                                            <p className="text-xs text-gray-400">{channel.config.email}</p>
                                        </div>
                                        <button
                                            onClick={() => attachMutation.mutate({ monitorId: id, alertChannelId: channel.id })}
                                            disabled={attachMutation.isPending}
                                            className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                        >
                                            {attachMutation.isPending ? 'Attaching...' : 'Attach'}
                                        </button>
                                        {attachMutation.isError && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {(attachMutation.error as any)?.response?.data?.error || 'Failed to attach'}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-medium text-gray-900">Recent checks</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {checks?.data?.slice(0, 20).map((check: any) => (
                            <div key={check.id} className="flex items-center justify-between px-6 py-3">
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${check.result === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="text-sm text-gray-600">
                                        {check.statusCode ? `HTTP ${check.statusCode}` : check.result}
                                    </span>
                                    {check.errorMessage && (
                                        <span className="text-xs text-red-500">{check.errorMessage}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    {check.responseTimeMs && <span>{check.responseTimeMs}ms</span>}
                                    <span>{new Date(check.checkedAt).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {incidents && incidents.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="font-medium text-gray-900">Incidents</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {incidents.map((incident: any) => (
                                <div key={incident.id} className="flex items-center justify-between px-6 py-4">
                                    <div>
                                        <p className="text-sm text-gray-900">{incident.cause}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Started {new Date(incident.startedAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {incident.resolvedAt ? (
                                            <span className="text-xs text-green-600 font-medium">Resolved</span>
                                        ) : (
                                            <span className="text-xs text-red-600 font-medium">Ongoing</span>
                                        )}
                                        {incident.durationSeconds && (
                                            <p className="text-xs text-gray-400 mt-0.5">
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
        active: 'bg-green-50 text-green-700 border-green-200',
        down: 'bg-red-50 text-red-700 border-red-200',
        paused: 'bg-gray-50 text-gray-600 border-gray-200',
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