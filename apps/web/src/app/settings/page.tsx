'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertChannelsApi } from '@/lib/queries'
import DashboardLayout from '@/components/DashboardLayout'

export default function SettingsPage() {
    const queryClient = useQueryClient()
    const [form, setForm] = useState({ name: '', email: '' })
    const [showForm, setShowForm] = useState(false)

    const { data: channels = [] } = useQuery({
        queryKey: ['alert-channels'],
        queryFn: alertChannelsApi.list,
    })

    const createMutation = useMutation({
        mutationFn: () => alertChannelsApi.create({
            type: 'email',
            name: form.name,
            config: { email: form.email },
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alert-channels'] })
            setShowForm(false)
            setForm({ name: '', email: '' })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: alertChannelsApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alert-channels'] }),
    })

    const testMutation = useMutation({
        mutationFn: alertChannelsApi.test,
    })

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-2xl">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your alert channels</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-medium text-gray-900">Alert channels</h2>
                        <button
                            onClick={() => setShowForm(true)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Add channel
                        </button>
                    </div>

                    {showForm && (
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="My email alerts"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="alerts@example.com"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => createMutation.mutate()}
                                        disabled={createMutation.isPending}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {createMutation.isPending ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => setShowForm(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="divide-y divide-gray-100">
                        {channels.length === 0 && !showForm ? (
                            <div className="px-6 py-8 text-center text-sm text-gray-500">
                                No alert channels yet
                            </div>
                        ) : (
                            channels.map((channel: any) => (
                                <div key={channel.id} className="flex items-center justify-between px-6 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{channel.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{channel.config.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => testMutation.mutate(channel.id)}
                                            disabled={testMutation.isPending}
                                            className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                                        >
                                            {testMutation.isPending ? 'Sending...' : 'Send test'}
                                        </button>
                                        <button
                                            onClick={() => deleteMutation.mutate(channel.id)}
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
            </div>
        </DashboardLayout>
    )
}