'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { monitorsApi } from '@/lib/queries'
import DashboardLayout from '@/components/DashboardLayout'
import PageLoading from '@/components/PageLoading'
import { useAuthStore } from '@/store/auth'

export default function MonitorsPage() {
    const queryClient = useQueryClient()
    const accountEmail = useAuthStore(s => s.user?.email)
    const [showForm, setShowForm] = useState(false)
    const [showNoEmailConfirm, setShowNoEmailConfirm] = useState(false)
    const [form, setForm] = useState({
        name: '',
        url: '',
        intervalSeconds: 60,
        timeoutSeconds: 30,
        email: '',
    })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ name: '', url: '', intervalSeconds: 60 })

    const { data: monitors = [], isLoading } = useQuery({
        queryKey: ['monitors'],
        queryFn: monitorsApi.list,
    })

    const createMutation = useMutation({
        mutationFn: monitorsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['monitors'] })
            setShowForm(false)
            setForm({ name: '', url: '', intervalSeconds: 60, timeoutSeconds: 30, email: '' })
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

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: typeof editForm }) =>
            monitorsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['monitors'] })
            setEditingId(null)
        },
    })

    function submitMonitor() {
        const { email, ...rest } = form
        createMutation.mutate(email.trim() ? { ...rest, email: email.trim() } : rest)
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!form.email.trim()) {
            setShowNoEmailConfirm(true)
            return
        }
        submitMonitor()
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <PageLoading />
            </DashboardLayout>
        )
    }

    const inputClass = 'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#2EDB8F] focus:border-transparent transition-colors'

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Monitors</h1>
                        <p className="text-white/40 text-sm mt-1">{monitors.length} monitors configured</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-[#2EDB8F] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#52E8A5] transition-colors"
                    >
                        Add monitor
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                        <h2 className="font-medium text-white mb-4">New monitor</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className={inputClass}
                                        placeholder="My API"
                                        maxLength={100}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1.5">URL</label>
                                    <div className="flex items-stretch w-full bg-white/5 border border-white/10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#2EDB8F] transition-colors">
                                        <span
                                            title="Only GET checks are supported"
                                            className="flex items-center px-3 bg-white/5 border-r border-white/10 text-xs font-mono font-semibold text-white/40 select-none"
                                        >
                                            GET
                                        </span>
                                        <input
                                            type="url"
                                            value={form.url}
                                            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                                            className="flex-1 min-w-0 px-3 py-2 bg-transparent text-sm text-white placeholder-white/25 focus:outline-none"
                                            placeholder="https://api.example.com/health"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1.5">Check every (seconds)</label>
                                    <input
                                        type="number"
                                        value={form.intervalSeconds}
                                        onChange={e => setForm(f => ({ ...f, intervalSeconds: parseInt(e.target.value) }))}
                                        className={inputClass}
                                        min={30}
                                        max={86400}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1.5">Alert email (optional)</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        className={inputClass}
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-4 py-2 bg-[#2EDB8F] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#52E8A5] disabled:opacity-50 transition-colors"
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create monitor'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 border border-white/15 text-white/60 rounded-lg text-sm font-medium hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {showNoEmailConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                        <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4">
                            <h3 className="text-white font-medium">No alert email added</h3>
                            <p className="text-sm text-white/50">
                                If this API goes down, we&apos;ll notify your registered account email
                                {accountEmail ? <> (<span className="text-white/70">{accountEmail}</span>)</> : ''} instead.
                                You can attach a dedicated alert email anytime from the monitor page. Continue without one?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowNoEmailConfirm(false)}
                                    className="px-4 py-2 border border-white/15 text-white/60 rounded-lg text-sm font-medium hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNoEmailConfirm(false)
                                        submitMonitor()
                                    }}
                                    className="px-4 py-2 bg-[#2EDB8F] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#52E8A5] transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 divide-y divide-white/10">
                    {monitors.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-white/40 text-sm">No monitors yet. Add one to get started.</p>
                        </div>
                    ) : (
                        monitors.map((monitor: any) => (
                            <div key={monitor.id} className="px-6 py-4">
                                {editingId === monitor.id ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-white/50 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                                    className={inputClass}
                                                    maxLength={100}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-white/50 mb-1">URL</label>
                                                <input
                                                    type="url"
                                                    value={editForm.url}
                                                    onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))}
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-white/50 mb-1">Check every (seconds)</label>
                                                <input
                                                    type="number"
                                                    value={editForm.intervalSeconds}
                                                    onChange={e => setEditForm(f => ({ ...f, intervalSeconds: parseInt(e.target.value) }))}
                                                    className={inputClass}
                                                    min={30}
                                                    max={86400}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateMutation.mutate({ id: monitor.id, data: editForm })}
                                                disabled={updateMutation.isPending}
                                                className="px-3 py-1.5 bg-[#2EDB8F] text-slate-900 rounded-lg text-xs font-medium hover:bg-[#52E8A5] disabled:opacity-50 transition-colors"
                                            >
                                                {updateMutation.isPending ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-3 py-1.5 border border-white/15 text-white/60 rounded-lg text-xs font-medium hover:bg-white/5 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <Link href={`/monitors/${monitor.id}`} className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-white">{monitor.name}</p>
                                                {!monitor.hasAlertChannel && (
                                                    <span
                                                        title={`No alert email attached — if this API goes down, we'll notify your account email (${accountEmail ?? 'not set'}) instead.`}
                                                        className="text-xs px-2 py-0.5 rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-400 font-medium flex-shrink-0"
                                                    >
                                                        No alert email
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-white/30 mt-0.5 truncate">{monitor.url}</p>
                                            <p className="text-xs text-white/25 mt-0.5">Every {monitor.intervalSeconds}s</p>
                                        </Link>
                                        <div className="flex items-center gap-2 ml-4">
                                            <StatusBadge status={monitor.status} />
                                            <button
                                                onClick={() => {
                                                    setEditingId(monitor.id)
                                                    setEditForm({ name: monitor.name, url: monitor.url, intervalSeconds: monitor.intervalSeconds })
                                                }}
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/15 text-white/40 hover:bg-white/5 hover:text-white transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => monitor.status === 'paused'
                                                    ? resumeMutation.mutate(monitor.id)
                                                    : pauseMutation.mutate(monitor.id)
                                                }
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/15 text-white/40 hover:bg-white/5 hover:text-white transition-all"
                                            >
                                                {monitor.status === 'paused' ? 'Resume' : 'Pause'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this monitor?')) deleteMutation.mutate(monitor.id)
                                                }}
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-500/30 text-red-400/70 hover:bg-red-500/10 hover:border-red-400/60 hover:text-red-400 transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
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
