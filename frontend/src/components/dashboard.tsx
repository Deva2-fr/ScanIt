"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { GlobalScore, ScoreGauge } from "@/components/score-gauge";
import { SecuritySection } from "@/components/sections/security-section";
import { TechStackSection } from "@/components/sections/tech-stack-section";
import { SEOSection } from "@/components/sections/seo-section";
import { BrokenLinksSection } from "@/components/sections/broken-links-section";
import { GdprSection } from "@/components/sections/gdpr-section";
import { SmoSection } from "@/components/sections/smo-section";
import { GreenSection } from "@/components/sections/green-section";
import { DnsSection } from "@/components/sections/dns-section";
import { ComparisonView } from "@/components/comparison-view";
import { RoadmapBoard } from "@/components/roadmap/RoadmapBoard";
import DownloadButton from "@/components/pdf/DownloadButton";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/lib/i18n";
import { AnalyzeResponse } from "@/types";
import {
    ArrowLeft,
    Download,
    Clock,
    Globe,
    Shield,
    Gauge,
    Layers,
    Link2,
    ExternalLink,
    RefreshCw,
    Cookie,
    Share2,
    Leaf,
    AtSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AiSummaryCard } from "@/components/dashboard/AiSummaryCard";

interface DashboardProps {
    data: AnalyzeResponse;
    onBack: () => void;
    onRescan: () => void;
}

export function Dashboard({ data, onBack, onRescan }: DashboardProps) {
    const { t, language } = useLanguage();

    const formattedDate = new Date(data.analyzed_at).toLocaleString(
        language === "fr" ? "fr-FR" : "en-US"
    );



    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onBack}
                                className="text-zinc-400 hover:text-white"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t.common.newScan}
                            </Button>

                            <Separator orientation="vertical" className="h-6 bg-zinc-800" />

                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-violet-400" />
                                <a
                                    href={data.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
                                >
                                    {new URL(data.url).hostname}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-500">
                                <Clock className="w-4 h-4" />
                                <span>{data.scan_duration_seconds?.toFixed(1)}s</span>
                            </div>

                            <LanguageSwitcher variant="minimal" />

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onRescan}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {t.common.rescan}
                            </Button>

                            <DownloadButton data={data} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Global Score Section */}
                <section className="mb-12">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800">
                        <GlobalScore score={data.global_score} />

                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <ScoreGauge
                                score={data.seo.scores.performance}
                                label={t.seo.performance}
                                size="sm"
                                // Performance is usually computed if SEO is allowed, but let's check
                                restricted={data.seo.error?.includes("Plan Limit")}
                            />
                            <ScoreGauge
                                score={data.seo.scores.seo}
                                label="SEO"
                                size="sm"
                                restricted={data.seo.error?.includes("Plan Limit")}
                            />
                            <ScoreGauge
                                score={data.security.score}
                                label={t.security.title.split(" ")[0]}
                                size="sm"
                                restricted={data.security.error?.includes("Plan Limit")}
                            />
                            <ScoreGauge
                                score={data.seo.scores.accessibility}
                                label={t.seo.accessibility}
                                size="sm"
                                restricted={data.seo.error?.includes("Plan Limit")}
                            />
                        </div>
                    </div>

                    {/* AI SUMMARY CARD */}
                    <div className="mt-8 mb-12">
                        <AiSummaryCard data={data} />
                    </div>

                    {/* SMART ROADMAP */}
                    <div className="mt-12 mb-12">
                        {/* Aggregate all issues for the Roadmap */}
                        <RoadmapBoard
                            errors={[
                                ...data.errors, // Critical Global Errors

                                // SEO Issues
                                ...(data.seo.audits?.filter(a => !a.passed && a.score !== 1).map(a => `SEO: ${a.title}`) || []),

                                // Performance Specifics (Core Web Vitals)
                                ...(data.seo.scores.performance && data.seo.scores.performance < 90 ? [`Performance: Score Global Faible (${data.seo.scores.performance}/100)`] : []),
                                ...(data.seo.core_web_vitals?.lcp_score === 'poor' ? [`Performance: LCP très lent (> 2.5s)`] : []),
                                ...(data.seo.core_web_vitals?.cls_score === 'poor' ? [`Performance: Stabilité visuelle (CLS) critique`] : []),

                                // Security Issues
                                ...(data.security.headers?.filter(h => !h.present && h.severity !== 'info').map(h => `Security: En-tête manquant ${h.name}`) || []),
                                ...(data.security.exposed_files?.filter(f => f.accessible).map(f => `Security: Fichier sensible exposé ${f.path}`) || []),

                                // Social Media (SMO)
                                ...(data.smo?.missing_tags?.map(t => `Social: Balise manquante ${t}`) || []),
                                ...(data.smo?.image_status === 'missing' || data.smo?.image_status === 'broken' ? [`Social: Image de partage (OG Image) manquante ou invalide`] : []),

                                // Tech Issues
                                ...(data.tech_stack.outdated_count > 0 ? [`Tech: ${data.tech_stack.outdated_count} technologies obsolètes détectées`] : []),

                                // Broken Links
                                ...(data.broken_links.broken_count > 0 ? [`Links: ${data.broken_links.broken_count} liens brisés trouvés`] : []),

                                // GDPR
                                ...(data.gdpr && !data.gdpr.compliant ? ["GDPR: Non-conformité détectée (Cookies/Consentement)"] : []),

                                // Green IT
                                ...(data.green_it.grade > "C" ? [`GreenIT: Empreinte carbone élevée (Grade ${data.green_it.grade})`] : []),

                                // DNS
                                ...(data.dns_health.spf.status !== "valid" ? ["Security: Configuration SPF invalide ou manquante"] : []),
                                ...(data.dns_health.dmarc.status !== "valid" ? ["Security: Configuration DMARC manquante"] : [])
                            ]}
                        />
                    </div>

                    {/* Quick Summary */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                    <Gauge className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">{t.seo.performance}</p>
                                    <p className="text-xl font-bold text-zinc-100">
                                        {data.seo.scores.performance ?? "—"}/100
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">{t.security.title.split(" ")[0]}</p>
                                    <p className="text-xl font-bold text-zinc-100">
                                        {data.security.error?.includes("Plan Limit") ? (
                                            <span className="text-sm text-zinc-500 uppercase">Plan requis</span>
                                        ) : (
                                            `${data.security.score}/100`
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">{t.tech.title}</p>
                                    <p className="text-xl font-bold text-zinc-100">
                                        {data.tech_stack.error?.includes("Plan Limit") ? (
                                            <span className="text-sm text-zinc-500 uppercase">Plan requis</span>
                                        ) : (
                                            <>
                                                {data.tech_stack.technologies.length}
                                                {data.tech_stack.outdated_count > 0 && (
                                                    <Badge variant="outline" className="ml-2 text-xs border-amber-500/50 text-amber-400">
                                                        {data.tech_stack.outdated_count} {t.common.outdated}
                                                    </Badge>
                                                )}
                                            </>
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    data.broken_links.broken_count > 0
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-emerald-500/20 text-emerald-400"
                                )}>
                                    <Link2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">{t.links.title}</p>
                                    <p className={cn(
                                        "text-xl font-bold",
                                        data.broken_links.broken_count > 0 ? "text-red-400" : "text-emerald-400"
                                    )}>
                                        {data.broken_links.error?.includes("Plan Limit") ? (
                                            <span className="text-sm text-zinc-500 uppercase">Plan requis</span>
                                        ) : (
                                            `${data.broken_links.broken_count} / ${data.broken_links.total_links_checked}`
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    data.gdpr?.compliant
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "bg-red-500/20 text-red-400"
                                )}>
                                    <Cookie className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">RGPD</p>
                                    <p className={cn(
                                        "text-xl font-bold",
                                        data.gdpr?.compliant ? "text-emerald-400" : "text-red-400"
                                    )}>
                                        {data.gdpr?.error?.includes("Plan Limit") ? (
                                            <span className="text-sm text-zinc-500 uppercase">Plan requis</span>
                                        ) : (
                                            data.gdpr?.compliant ? "Conforme" : "Défaillant"
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Competitor Comparison */}
                {data.competitor && (
                    <section className="mb-8">
                        <ComparisonView main={data} competitor={data.competitor} />
                    </section>
                )}

                {/* Detailed Sections */}
                <Tabs defaultValue="seo" className="space-y-6">
                    <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
                        <TabsTrigger
                            value="seo"
                            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                        >
                            <Gauge className="w-4 h-4 mr-2" />
                            {t.seo.title}
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            {t.security.title.split(" ")[0]}
                        </TabsTrigger>
                        <TabsTrigger
                            value="tech"
                            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                        >
                            <Layers className="w-4 h-4 mr-2" />
                            {t.tech.title}
                        </TabsTrigger>
                        <TabsTrigger
                            value="links"
                            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                        >
                            <Link2 className="w-4 h-4 mr-2" />
                            {t.links.title}
                        </TabsTrigger>
                        <TabsTrigger
                            value="gdpr"
                            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            RGPD
                        </TabsTrigger>
                        <TabsTrigger
                            value="smo"
                            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Social
                        </TabsTrigger>
                        <TabsTrigger
                            value="green"
                            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                        >
                            <Leaf className="w-4 h-4 mr-2" />
                            Eco-Index
                        </TabsTrigger>
                        <TabsTrigger
                            value="dns"
                            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                        >
                            <AtSign className="w-4 h-4 mr-2" />
                            Email
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="seo" className="mt-6">
                        <SEOSection data={data.seo} />
                    </TabsContent>

                    <TabsContent value="security" className="mt-6">
                        <SecuritySection data={data.security} />
                    </TabsContent>

                    <TabsContent value="tech" className="mt-6">
                        <TechStackSection data={data.tech_stack} />
                    </TabsContent>

                    <TabsContent value="links" className="mt-6">
                        <BrokenLinksSection data={data.broken_links} />
                    </TabsContent>

                    <TabsContent value="gdpr" className="mt-6">
                        <GdprSection data={data.gdpr} />
                    </TabsContent>

                    <TabsContent value="smo" className="mt-6">
                        <SmoSection data={data.smo} />
                    </TabsContent>

                    <TabsContent value="green" className="mt-6">
                        <GreenSection data={data.green_it} />
                    </TabsContent>

                    <TabsContent value="dns" className="mt-6">
                        <DnsSection data={data.dns_health} />
                    </TabsContent>
                </Tabs>

                {/* Errors */}
                {data.errors.length > 0 && (
                    <Card className="mt-8 bg-red-500/10 border-red-500/30">
                        <CardHeader>
                            <CardTitle className="text-red-400">{t.dashboard.errorsTitle}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {data.errors.map((error, index) => (
                                    <li key={index} className="text-sm text-red-300">
                                        • {error}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Footer Info */}
                <div className="mt-12 text-center text-sm text-zinc-500">
                    <p>{t.dashboard.scannedOn} {formattedDate}</p>
                    <p className="mt-1">{t.dashboard.analysisCompleted} {data.scan_duration_seconds?.toFixed(1)} {t.dashboard.seconds}</p>
                </div>
            </main>
        </div>
    );
}
