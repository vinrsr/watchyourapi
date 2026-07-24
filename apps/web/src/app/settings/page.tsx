'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertChannelsApi, userApi } from '@/lib/queries'
import DashboardLayout from '@/components/DashboardLayout'
import PasswordInput from '@/components/PasswordInput'

export default function SettingsPage() {
    const queryClient = useQueryClient()

    // Alert channel form
    const [channelForm, setChannelForm] = useState({ name: '', email: '' })
    const [showChannelForm, setShowChannelForm] = useState(false)
    const [cooldowns, setCooldowns] = useState<Record<string, number>>({})
    const [, forceUpdate] = useState(0)

    // Password form
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [pwError, setPwError] = useState('')
    const [pwSuccess, setPwSuccess] = useState(false)

    // Tick every second while any cooldown is active
    useEffect(() => {
        const hasActive = Object.values(cooldowns).some(exp => exp > Date.now())
        if (!hasActive) return
        const id = setInterval(() => forceUpdate(n => n + 1), 1000)
        return () => clearInterval(id)
    }, [cooldowns])

    const { data: channels = [] } = useQuery({
        queryKey: ['alert-channels'],
        queryFn: alertChannelsApi.list,
    })

    const createChannelMutation = useMutation({
        mutationFn: () => alertChannelsApi.create({
            type: 'email',
            name: channelForm.name,
            config: { email: channelForm.email },
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alert-channels'] })
            setShowChannelForm(false)
            setChannelForm({ name: '', email: '' })
        },
    })

    const deleteChannelMutation = useMutation({
        mutationFn: alertChannelsApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alert-channels'] }),
    })

    const testMutation = useMutation({
        mutationFn: alertChannelsApi.test,
    })

    const changePasswordMutation = useMutation({
        mutationFn: () => userApi.changePassword({
            currentPassword: pwForm.currentPassword,
            newPassword: pwForm.newPassword,
        }),
        onSuccess: () => {
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setPwError('')
            setPwSuccess(true)
            setTimeout(() => setPwSuccess(false), 3000)
        },
        onError: (err: any) => {
            setPwError(err.response?.data?.error || 'Failed to update password')
        },
    })

    function handlePasswordSubmit() {
        setPwError('')
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwError('New passwords do not match')
            return
        }
        changePasswordMutation.mutate()
    }

    function handleSendTest(channelId: string) {
        testMutation.mutate(channelId)
        setCooldowns(c => ({ ...c, [channelId]: Date.now() + 30_000 }))
    }

    const inputClass = 'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#2EDB8F] focus:border-transparent transition-colors'

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-2xl">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Settings</h1>
                    <p className="text-white/40 text-sm mt-1">Manage your password and alert channels</p>
                </div>

                {/* Password */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="px-4 sm:px-6 py-4 border-b border-white/10">
                        <h2 className="font-medium text-white">Change password</h2>
                    </div>
                    <div className="px-4 sm:px-6 py-5 space-y-4">
                        {pwError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-400/20 text-red-400 text-sm">
                                {pwError}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1.5">Current password</label>
                            <PasswordInput
                                value={pwForm.currentPassword}
                                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                                className={inputClass}
                                autoComplete="current-password"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-1.5">New password</label>
                                <PasswordInput
                                    value={pwForm.newPassword}
                                    onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                                    className={inputClass}
                                    minLength={8}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-1.5">Confirm new password</label>
                                <PasswordInput
                                    value={pwForm.confirmPassword}
                                    onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                    className={inputClass}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePasswordSubmit}
                                disabled={changePasswordMutation.isPending}
                                className="px-4 py-2 bg-[#2EDB8F] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#52E8A5] disabled:opacity-50 transition-colors"
                            >
                                {changePasswordMutation.isPending ? 'Updating...' : 'Update password'}
                            </button>
                            {pwSuccess && <span className="text-sm text-emerald-400">Password updated</span>}
                        </div>
                    </div>
                </div>

                {/* Alert channels */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="px-4 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="font-medium text-white">Alert channels</h2>
                        <button
                            onClick={() => setShowChannelForm(true)}
                            className="px-3 py-1.5 bg-[#2EDB8F] text-slate-900 rounded-lg text-xs font-medium hover:bg-[#52E8A5] transition-colors"
                        >
                            + Add channel
                        </button>
                    </div>

                    {showChannelForm && (
                        <div className="px-4 sm:px-6 py-5 border-b border-white/10">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        value={channelForm.name}
                                        onChange={e => setChannelForm(f => ({ ...f, name: e.target.value }))}
                                        className={inputClass}
                                        placeholder="My email alerts"
                                        maxLength={100}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1.5">Email address</label>
                                    <input
                                        type="email"
                                        value={channelForm.email}
                                        onChange={e => setChannelForm(f => ({ ...f, email: e.target.value }))}
                                        className={inputClass}
                                        placeholder="alerts@example.com"
                                    />
                                </div>
                                <div className="flex gap-3 pt-1">
                                    <button
                                        onClick={() => createChannelMutation.mutate()}
                                        disabled={createChannelMutation.isPending}
                                        className="px-4 py-2 bg-[#2EDB8F] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#52E8A5] disabled:opacity-50 transition-colors"
                                    >
                                        {createChannelMutation.isPending ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => setShowChannelForm(false)}
                                        className="px-4 py-2 border border-white/15 text-white/60 rounded-lg text-sm font-medium hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="divide-y divide-white/10">
                        {channels.length === 0 && !showChannelForm ? (
                            <div className="px-4 sm:px-6 py-8 text-center text-sm text-white/30">
                                No alert channels yet
                            </div>
                        ) : (
                            channels.map((channel: any) => {
                                const cooldownMs = (cooldowns[channel.id] ?? 0) - Date.now()
                                const isCoolingDown = cooldownMs > 0
                                const secondsLeft = isCoolingDown ? Math.ceil(cooldownMs / 1000) : 0
                                const isTestDisabled = testMutation.isPending || isCoolingDown

                                return (
                                    <div key={channel.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{channel.name}</p>
                                            <p className="text-xs text-white/30 mt-0.5 truncate">{channel.config.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleSendTest(channel.id)}
                                                disabled={isTestDisabled}
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#2EDB8F]/40 text-[#2EDB8F] hover:bg-[#2EDB8F]/10 hover:border-[#52E8A5] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                {testMutation.isPending
                                                    ? 'Sending...'
                                                    : isCoolingDown
                                                        ? `Wait ${secondsLeft}s`
                                                        : 'Send test'}
                                            </button>
                                            <button
                                                onClick={() => deleteChannelMutation.mutate(channel.id)}
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-500/30 text-red-400/70 hover:bg-red-500/10 hover:border-red-400/60 hover:text-red-400 transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
