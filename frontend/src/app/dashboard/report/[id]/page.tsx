"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { DiffViewer } from "@/components/visual/diff-viewer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Download, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { AuthHeader } from "@/components/auth-header"

interface AuditDetail {
    id: number
    url: string
    score: number
    created_at: string
    summary: string
}

interface ParsedSummary {
    global_score: number
    screenshot_path?: string
    seo?: any
    security?: any
    visual_diff?: {
        difference_percentage: number
        diff_image_path?: string
        has_changed: boolean
    }
    // ... other fields
}

export default function AuditReportPage() {
    const { id } = useParams()
    const router = useRouter()
    const { isAuthenticated } = useAuth()

    const [audit, setAudit] = useState<AuditDetail | null>(null)
    const [parsedSummary, setParsedSummary] = useState<ParsedSummary | null>(null)
    const [previousAudit, setPreviousAudit] = useState<AuditDetail | null>(null)
    const [prevSummary, setPrevSummary] = useState<ParsedSummary | null>(null)

    const [loading, setLoading] = useState(true)

    // Helper to get image URL from relative path
    const getImageUrl = (path?: string) => {
        if (!path) return ""
        // If path starts with 'static/', append API URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
        return `${apiUrl}/${path}`
    }

    const fetchDetail = async () => {
        if (!isAuthenticated || !id) return
        try {
            const token = localStorage.getItem('access_token')
            // 1. Fetch current audit
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/audits/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to load report")
            const data: AuditDetail = await res.json()
            setAudit(data)

            const summary = JSON.parse(data.summary) as ParsedSummary
            setParsedSummary(summary)

            // 2. Fetch history to find previous audit for same URL
            if (summary.screenshot_path) {
                const historyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/audits/?limit=20`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (historyRes.ok) {
                    const history: AuditDetail[] = await historyRes.json()
                    // Filter for same URL, created before current
                    // Note: id is usually sequential, but created_at is safer
                    const currentId = Number(id)
                    const prev = history.find(a =>
                        a.url === data.url &&
                        a.id < currentId && // older than current
                        // Check if it has a screenshot
                        JSON.parse(a.summary).screenshot_path
                    )

                    if (prev) {
                        setPreviousAudit(prev)
                        setPrevSummary(JSON.parse(prev.summary))
                    }
                }
            }

        } catch (error) {
            console.error(error)
            toast.error("Error loading report")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDetail()
    }, [id, isAuthenticated])

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
    if (!audit || !parsedSummary) return <div>Report not found</div>

    return (
        <div className="min-h-screen bg-background">
            <AuthHeader />
            <main className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    <Button variant="ghost" onClick={() => router.back()} className="gap-2 pl-0">
                        <ArrowLeft className="h-4 w-4" /> Back to Profile
                    </Button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Audit Report</h2>
                            <p className="text-muted-foreground">
                                {audit.url} • {new Date(audit.created_at).toLocaleString()}
                            </p>
                        </div>
                        <Badge className="text-lg px-4 py-1" variant={audit.score >= 90 ? "default" : audit.score >= 50 ? "secondary" : "destructive"}>
                            Score: {audit.score}/100
                        </Badge>
                    </div>

                    {/* Visual Regression Section */}
                    {parsedSummary.screenshot_path && previousAudit && prevSummary?.screenshot_path && (
                        <Card className="border-blue-200 dark:border-blue-900 overflow-hidden">
                            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                                <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Visual Comparison
                                </CardTitle>
                                <CardDescription>
                                    Comparing this scan with the previous one from {new Date(previousAudit.created_at).toLocaleDateString()}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <DiffViewer
                                    beforeImage={getImageUrl(prevSummary.screenshot_path)}
                                    afterImage={getImageUrl(parsedSummary.screenshot_path)}
                                    diffImage={parsedSummary.visual_diff?.diff_image_path ? getImageUrl(parsedSummary.visual_diff.diff_image_path) : undefined}
                                    diffPercentage={parsedSummary.visual_diff?.difference_percentage}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Single Screenshot View if no comparison */}
                    {parsedSummary.screenshot_path && !previousAudit && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Screen Capture</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg overflow-hidden border shadow-sm max-w-4xl mx-auto">
                                    <img
                                        src={getImageUrl(parsedSummary.screenshot_path)}
                                        alt="Site Screenshot"
                                        className="w-full h-auto"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* JSON Dump for debug/details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Raw Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-[400px]">
                                {JSON.stringify(parsedSummary, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
