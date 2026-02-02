"use client"

import { AuthHeader } from '@/components/auth-header'
import { MonitorList } from '@/components/monitoring/monitor-list'
import { AddMonitorDialog } from '@/components/monitoring/add-monitor-dialog'
import { useState } from 'react'
import { Activity } from 'lucide-react'

export default function MonitoringPage() {
    const [refreshKey, setRefreshKey] = useState(0)

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1)
    }

    return (
        <div className="min-h-screen bg-background">
            <AuthHeader />
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Watchdog Monitoring</h1>
                            <p className="text-muted-foreground mt-1">
                                Monitor your websites 24/7 and get alerted when performance drops.
                            </p>
                        </div>
                    </div>
                    <AddMonitorDialog onSuccess={handleSuccess} />
                </div>

                <MonitorList keyProp={refreshKey} />
            </main>
        </div>
    )
}
