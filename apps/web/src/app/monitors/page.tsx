'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { monitorsApi } from '@/lib/queries'
import DashboardLayout from '@/components/DashboardLayout'

export default function MonitorsPage() {
    const queryClient = useQueryClient()
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({
        name: '',
        url: '',
        method: 'GET',
        intervalSeconds: 60,
        timeoutSeconds: 30,
    })

    const { data: monitors = [], isLoading } = useQuery({
        queryKey: ['monitors'],
        queryFn: monitorsApi.list,
    })

    const createMutation = useMutation({
        mutationFn: monitorsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['monitors'] })
            setShowForm(false)
            setForm({ name: '', url: '', method: 'GET', intervalSeconds: 60, timeoutSeconds: 30 })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: monitorsApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitors'] }),
    })

    const pauseMutation = useMutation({
        mutationFn: monitorsApi.pause,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitors'] }),
    })

    const resumeMutation = useMutation({
        mutationFn: monitorsApi.resume,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitors'] }),
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        createMutation.mutate(form)
    }

    if (isLoading) return <div className="text-sm text-gray-500">Loading...</div>

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Monitors</h1>
                        <p className="text-gray-500 text-sm mt-1">{monitors.length} monitors configured</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        Add monitor
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="font-medium text-gray-900 mb-4">New monitor</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="My API"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                    <input
                                        type="url"
                                        value={form.url}
                                        onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://api.example.com/health"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                                    <select
                                        value={form.method}
                                        onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option>GET</option>
                                        <option>POST</option>
                                        <option>HEAD</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Check every (seconds)</label>
                                    <input
                                        type="number"
                                        value={form.intervalSeconds}
                                        onChange={e => setForm(f => ({ ...f, intervalSeconds: parseInt(e.target.value) }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min={30}
                                        max={86400}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create monitor'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                    {monitors.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-gray-500 text-sm">No monitors yet. Add one to get started.</p>
                        </div>
                    ) : (
                        monitors.map((monitor: any) => (
                            <div key={monitor.id} className="flex items-center justify-between px-6 py-4">
                                <Link href={`/monitors/${monitor.id}`} className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{monitor.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">{monitor.url}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Every {monitor.intervalSeconds}s</p>
                                </Link>
                                <div className="flex items-center gap-3 ml-4">
                                    <StatusBadge status={monitor.status} />
                                    <button
                                        onClick={() => monitor.status === 'paused'
                                            ? resumeMutation.mutate(monitor.id)
                                            : pauseMutation.mutate(monitor.id)
                                        }
                                        className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        {monitor.status === 'paused' ? 'Resume' : 'Pause'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete this monitor?')) deleteMutation.mutate(monitor.id)
                                        }}
                                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
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