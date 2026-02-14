"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react"

export default function WidgetPage() {
    // 1. Get Params
    const params = useParams()
    const agencyId = params?.userId // e.g. "1"

    // 2. Customization (Query Params)
    const searchParams = useSearchParams()
    const primaryColor = searchParams.get('color') || "#7c3aed" // Default Violet

    // 3. State
    const [url, setUrl] = useState("")
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ score: number; message: string } | null>(null)
    const [error, setError] = useState("")

    // 4. Submit Handler
    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!url || !email) return

        setLoading(true)
        setError("")

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
            const res = await fetch(`${API_BASE_URL}/api/widget/scan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url,
                    email,
                    agency_id: parseInt(agencyId as string)
                })
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.detail || "Scan failed")
            }

            const data = await res.json()
            setResult(data)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // 5. Render Result View
    if (result) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center font-sans">
                {/* Score Circle */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64" cy="64" r="60"
                            stroke="#e4e4e7" strokeWidth="8" fill="transparent"
                        />
                        <circle
                            cx="64" cy="64" r="60"
                            stroke={result.score >= 80 ? "#10b981" : result.score >= 50 ? "#f59e0b" : "#ef4444"}
                            strokeWidth="8" fill="transparent"
                            strokeDasharray={377}
                            strokeDashoffset={377 - (377 * result.score) / 100}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <span className="absolute text-3xl font-bold text-gray-800">
                        {result.score}
                    </span>
                </div>

                <h2 className="text-xl font-bold mb-2 text-gray-800">
                    {result.score >= 80 ? "Excellent Score !" : "Attention requise"}
                </h2>
                <p className="text-gray-600 mb-6 max-w-xs mx-auto text-sm">
                    {result.message}
                </p>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4 max-w-sm">
                    <p>Un rapport détaillé a été généré.</p>
                    <strong>Contactez-nous pour corriger ces erreurs.</strong>
                </div>

                <Button
                    onClick={() => setResult(null)}
                    variant="outline"
                    className="mt-2 text-gray-500 hover:text-gray-900"
                >
                    Faire un autre test
                </Button>
            </div>
        )
    }

    // 6. Render Input View
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 font-sans bg-transparent">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-full bg-slate-100 mb-2">
                        <ShieldCheck className="w-6 h-6 text-slate-600" style={{ color: primaryColor }} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Audit de Sécurité Gratuit</h1>
                    <p className="text-sm text-gray-500">Testez la sécurité de votre site en 30 secondes.</p>
                </div>

                <form onSubmit={handleScan} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="url"
                            placeholder="https://votre-site.com"
                            required
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="bg-white border-gray-200 text-black placeholder:text-gray-500 !bg-white !text-black"
                        />
                    </div>

                    <div className="space-y-2">
                        <Input
                            type="email"
                            placeholder="votre@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white border-gray-200 text-black placeholder:text-gray-500 !bg-white !text-black"
                        />
                    </div>

                    {error && (
                        <div className="text-xs text-red-500 flex items-center gap-1 bg-red-50 p-2 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full font-semibold text-white transition-all shadow-md hover:shadow-lg hover:opacity-90"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyse en cours...
                            </>
                        ) : (
                            <>
                                Lancer l'analyse
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </form>

                <p className="text-[10px] text-center text-gray-400">
                    Propulsé par SiteAuditor Agency
                </p>
            </div>
        </div>
    )
}
