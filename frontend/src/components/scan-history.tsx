"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from '@/contexts/AuthContext'
import { ExternalLink, Calendar, Search, Trash2 } from 'lucide-react'
import { ScoreHistoryChart } from './charts/ScoreHistoryChart'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

interface Scan {
    id: number
    url: string
    score: number
    created_at: string
    summary?: string
}

export function ScanHistory() {
    const { user } = useAuth()
    const [scans, setScans] = useState<Scan[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return

        const fetchHistory = async () => {
            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
                const token = localStorage.getItem('access_token')

                const response = await fetch(`${API_BASE_URL}/api/audits/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch scan history')
                }

                const data = await response.json()
                setScans(data)
            } catch (err) {
                console.error(err)
                setError('Could not load scan history')
            } finally {
                setLoading(false)
            }
        }

        fetchHistory()
    }, [user])

    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce scan ?")) return;

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
            const token = localStorage.getItem('access_token')

            const response = await fetch(`${API_BASE_URL}/api/audits/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                setScans(scans.filter(scan => scan.id !== id))
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDeleteAll = async () => {
        if (!confirm("ATTENTION : Cela supprimera TOUT votre historique d'audit. Cette action est irréversible. Êtes-vous sûr ?")) return;

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
            const token = localStorage.getItem('access_token')

            const response = await fetch(`${API_BASE_URL}/api/audits/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                setScans([])
            }
        } catch (err) {
            console.error(err)
        }
    }

    const getScoreColor = (score: number) => {
        // Normalize score if it was saved as > 100 (e.g. 10000 bug)
        const normalized = score > 100 ? Math.round(score / 100) : score;

        if (normalized >= 90) return "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20"
        if (normalized >= 70) return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
        if (normalized >= 50) return "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20"
        return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20"
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
            </div>
        )
    }

    if (scans.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <div className="p-4 rounded-full bg-muted mb-4">
                        <Search className="w-6 h-6" />
                    </div>
                    <p className="font-medium">No scans yet</p>
                    <p className="text-sm mt-1">Run your first audit to see it here</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <ScoreHistoryChart data={scans} />

            <Card className="bg-background/60 backdrop-blur-sm border-muted">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="w-5 h-5 text-blue-500" />
                                Scan History
                            </CardTitle>
                            <CardDescription>
                                Your recent website audits
                            </CardDescription>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteAll}
                            className="h-8 text-xs hover:scale-105 transition-transform cursor-pointer"
                        >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Tout supprimer
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                        <div className="space-y-4">
                            {scans.map((scan) => (
                                <div
                                    key={scan.id}
                                    className="group flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Link href={`/dashboard/report/${scan.id}`} className="hover:underline flex items-center gap-1.5 font-semibold text-primary">
                                                Audit #{scan.id}
                                            </Link>
                                            <span className="text-muted-foreground mx-1">•</span>
                                            <a
                                                href={scan.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="hover:underline flex items-center gap-1.5 text-muted-foreground text-sm"
                                            >
                                                {new URL(scan.url).hostname}
                                                <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(scan.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            {/* Attempt to parse summary to show other scores */}

                                            {(() => {
                                                try {
                                                    const summary = scan.summary ? JSON.parse(scan.summary) : {};

                                                    const getScore = (data: any) => {
                                                        if (typeof data === 'number') return data;
                                                        if (data && typeof data === 'object' && typeof data.score === 'number') return data.score;
                                                        return 0;
                                                    };

                                                    const seoScore = getScore(summary.seo);
                                                    const secuScore = getScore(summary.security);
                                                    const perfScore = getScore(summary.performance);

                                                    return (
                                                        <>
                                                            {summary.seo && (
                                                                <div className="hidden sm:flex flex-col items-center px-2">
                                                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">SEO</span>
                                                                    <span className={`text-xs font-bold ${getScoreColor(seoScore).split(' ')[1]}`}>{seoScore > 100 ? Math.round(seoScore / 100) : seoScore}</span>
                                                                </div>
                                                            )}
                                                            {summary.security && (
                                                                <div className="hidden sm:flex flex-col items-center px-2 border-l border-muted">
                                                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Secu</span>
                                                                    <span className={`text-xs font-bold ${getScoreColor(secuScore).split(' ')[1]}`}>{secuScore > 100 ? Math.round(secuScore / 100) : secuScore}</span>
                                                                </div>
                                                            )}
                                                            {summary.performance && (
                                                                <div className="hidden sm:flex flex-col items-center px-2 border-l border-muted mr-2">
                                                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Perf</span>
                                                                    <span className={`text-xs font-bold ${getScoreColor(perfScore).split(' ')[1]}`}>{perfScore > 100 ? Math.round(perfScore / 100) : perfScore}</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                } catch (e) { return null; }
                                            })()}

                                            <div className="flex flex-col items-end gap-1">
                                                <Badge variant="outline" className={`${getScoreColor(scan.score)} border px-3 py-1 text-sm`}>
                                                    {scan.score > 100 ? Math.round(scan.score / 100) : scan.score}
                                                </Badge>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(scan.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
