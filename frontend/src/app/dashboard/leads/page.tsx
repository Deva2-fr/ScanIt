"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { AuthHeader } from "@/components/auth-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Copy, Code, Download, Users, ExternalLink, Brush } from "lucide-react"
import { toast } from "sonner"

interface Lead {
    id: number
    prospect_email: string
    prospect_url: string
    scan_score: number
    created_at: string
    status: string
}

export default function LeadsPage() {
    const { user } = useAuth()
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [widgetColor, setWidgetColor] = useState("#7c3aed") // Default Violet

    // Fetch Leads
    useEffect(() => {
        const fetchLeads = async () => {
            if (!user) return
            try {
                const token = localStorage.getItem('access_token')
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/leads/`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setLeads(data)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchLeads()
    }, [user])

    const [origin, setOrigin] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin)
        }
    }, [])

    const widgetUrl = origin && user?.id
        ? `${origin}/embed/${user.id}?color=${widgetColor.replace('#', '')}`
        : ''

    const iframeCode = `<iframe 
  src="${widgetUrl}" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.1);"
></iframe>`

    const copyCode = () => {
        navigator.clipboard.writeText(iframeCode)
        toast.success("Code copié !")
    }

    const downloadCsv = () => {
        const headers = ["Email", "URL", "Score", "Date"]
        const csvContent = [
            headers.join(","),
            ...leads.map(l => [
                l.prospect_email,
                l.prospect_url,
                l.scan_score,
                new Date(l.created_at).toLocaleDateString()
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", "prospects.csv")
        document.body.appendChild(link)
        link.click()
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <AuthHeader />
            <main className="container mx-auto px-4 py-8">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">
                            Générateur de Leads
                        </h1>
                        <p className="text-zinc-500 mt-2">
                            Intégrez notre scanner sur votre site et capturez des prospects qualifiés.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2 border-zinc-800 hover:bg-zinc-900" onClick={downloadCsv}>
                            <Download className="w-4 h-4" />
                            Exporter CSV
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEADS LIST - Takes 2/3 of width */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-violet-400" />
                                    Prospects Capturés ({leads.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-8 text-zinc-500">Chargement...</div>
                                ) : leads.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg">
                                        <Users className="w-8 h-8 mx-auto text-zinc-700 mb-3" />
                                        <h3 className="text-lg font-medium text-zinc-300">Aucun prospect... pour l'instant !</h3>
                                        <p className="text-zinc-500 text-sm mt-1">
                                            Installez le widget sur votre site pour commencer à générer des leads.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                                    <TableHead className="text-zinc-400">Email</TableHead>
                                                    <TableHead className="text-zinc-400">Site Web</TableHead>
                                                    <TableHead className="text-zinc-400 text-center">Score Sécurité</TableHead>
                                                    <TableHead className="text-zinc-400 text-right">Date</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {leads.map((lead) => (
                                                    <TableRow key={lead.id} className="border-zinc-800">
                                                        <TableCell className="font-medium text-zinc-200">{lead.prospect_email}</TableCell>
                                                        <TableCell className="text-zinc-400">
                                                            <a href={lead.prospect_url} target="_blank" className="hover:text-violet-400 flex items-center gap-1">
                                                                {new URL(lead.prospect_url).hostname}
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge className={
                                                                lead.scan_score >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                                    lead.scan_score >= 50 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                                        "bg-red-500/10 text-red-400 border-red-500/20"
                                                            }>
                                                                {lead.scan_score}/100
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right text-zinc-500">
                                                            {new Date(lead.created_at).toLocaleDateString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* WIDGET CONFIG - Takes 1/3 of width */}
                    <div className="space-y-6">
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Code className="w-5 h-5 text-blue-400" />
                                    Configuration du Widget
                                </CardTitle>
                                <CardDescription>Personnalisez et intégrez le widget.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Color Picker */}
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-zinc-300">
                                        <Brush className="w-4 h-4" />
                                        Couleur Principale
                                    </Label>
                                    <div className="flex gap-2">
                                        {['#7c3aed', '#2563eb', '#059669', '#dc2626', '#db2777', '#000000'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setWidgetColor(color)}
                                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${widgetColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                        <input
                                            type="color"
                                            value={widgetColor}
                                            onChange={(e) => setWidgetColor(e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer bg-transparent border border-zinc-700"
                                        />
                                    </div>
                                </div>

                                {/* Preview Link */}
                                <div className="p-4 bg-black/40 rounded-lg border border-zinc-800">
                                    <Label className="text-xs text-zinc-500 mb-1 block">Aperçu en direct</Label>
                                    <a
                                        href={widgetUrl}
                                        target="_blank"
                                        className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 break-all"
                                    >
                                        Ouvrir l'aperçu du widget <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>

                                {/* Embed Code */}
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Code d'intégration (HTML)</Label>
                                    <div className="relative group">
                                        <pre className="bg-black p-4 rounded-lg text-xs text-zinc-400 font-mono overflow-x-auto border border-zinc-800 whitespace-pre-wrap break-all">
                                            {iframeCode}
                                        </pre>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={copyCode}
                                        >
                                            <Copy className="w-3 h-3 mr-2" />
                                            Copier
                                        </Button>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-2">
                                        Copiez ce code et collez-le dans le code HTML de votre site (WordPress, Webflow, Wix...).
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    )
}
