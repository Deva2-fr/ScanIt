"use client"

import { useEffect, useState } from "react"
import { Monitor } from "@/types/monitor"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Trash2, ExternalLink, Activity, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface MonitorListProps {
    keyProp: number // to force refresh
}

export function MonitorList({ keyProp }: MonitorListProps) {
    const [monitors, setMonitors] = useState<Monitor[]>([])
    const [loading, setLoading] = useState(true)
    const { isAuthenticated } = useAuth()

    const fetchMonitors = async () => {
        if (!isAuthenticated) return
        try {
            const token = localStorage.getItem('access_token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/monitors/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setMonitors(data)
            }
        } catch (error) {
            console.error("Failed to fetch monitors", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMonitors()
    }, [keyProp, isAuthenticated])

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to stop monitoring this site?")) return
        try {
            const token = localStorage.getItem('access_token')
            await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/monitors/${id}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setMonitors(monitors.filter(m => m.id !== id))
            toast.success("Monitor deleted")
        } catch (error) {
            toast.error("Failed to delete")
        }
    }

    const handleToggle = async (id: number, currentState: boolean) => {
        // Optimistic update
        setMonitors(monitors.map(m => m.id === id ? { ...m, is_active: !currentState } : m))

        try {
            const token = localStorage.getItem('access_token')
            await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/monitors/${id}`, {
                method: "PATCH",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_active: !currentState })
            })
        } catch (error) {
            // Revert
            setMonitors(monitors.map(m => m.id === id ? { ...m, is_active: currentState } : m))
            toast.error("Failed to update")
        }
    }

    if (loading) {
        return <div className="text-center py-10">Loading monitors...</div>
    }

    if (monitors.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Activity className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">No monitors active</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new URL to watch.</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Score</TableHead>
                        <TableHead>Alert Sensitivity</TableHead>
                        <TableHead>Next Check</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {monitors.map((monitor) => (
                        <TableRow key={monitor.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                        {monitor.url}
                                        <ExternalLink className="h-3 w-3 opacity-50" />
                                    </a>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Switch
                                    checked={monitor.is_active}
                                    onCheckedChange={() => handleToggle(monitor.id, monitor.is_active)}
                                />
                            </TableCell>
                            <TableCell>
                                {monitor.last_score !== undefined && monitor.last_score !== null ? (
                                    <Badge variant={monitor.last_score >= 90 ? "default" : monitor.last_score >= 50 ? "secondary" : "destructive"}>
                                        {monitor.last_score}/100
                                    </Badge>
                                ) : (
                                    <span className="text-muted-foreground text-sm">Pending</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    Drop &gt; {monitor.alert_threshold}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">
                                        Last: {monitor.last_checked_at ? new Date(monitor.last_checked_at).toLocaleDateString() : "Never"}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground/60">
                                        Preferred: {monitor.check_hour}:00 UTC
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(monitor.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
