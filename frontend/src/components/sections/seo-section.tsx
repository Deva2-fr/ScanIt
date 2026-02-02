"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreGauge } from "@/components/score-gauge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
    Gauge,
    Zap,
    Clock,
    LayoutGrid,
    TrendingUp,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ArrowRight,
    Info,
    HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SEOResult } from "@/types";
import { useLanguage } from "@/lib/i18n";

interface SEOSectionProps {
    data: SEOResult;
    className?: string;
}

// Core Web Vital Card with Hover Info
function CWVCard({
    metricKey,
    value,
    score,
    icon: Icon,
}: {
    metricKey: "lcp" | "fid" | "cls" | "fcp" | "ttfb" | "inp";
    value: number | null;
    score: string | null;
    icon: React.ElementType;
}) {
    const { t } = useLanguage();
    const info = t.cwv[metricKey];

    const getColor = (s: string | null) => {
        if (!s) return "text-zinc-500";
        if (s === "good") return "text-emerald-400";
        if (s === "needs-improvement") return "text-amber-400";
        return "text-red-400";
    };

    const getBg = (s: string | null) => {
        if (!s) return "bg-zinc-500/10";
        if (s === "good") return "bg-emerald-500/10";
        if (s === "needs-improvement") return "bg-amber-500/10";
        return "bg-red-500/10";
    };

    const formatValue = () => {
        if (value === null) return "—";
        if (metricKey === "lcp" || metricKey === "fcp") return `${value.toFixed(2)}s`;
        if (metricKey === "cls") return value.toFixed(3);
        if (metricKey === "ttfb" || metricKey === "fid" || metricKey === "inp") return `${Math.round(value)}ms`;
        return value.toString();
    };

    return (
        <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
                <div className={cn(
                    "p-4 rounded-xl border cursor-help transition-all duration-200",
                    "hover:scale-[1.02] hover:shadow-lg",
                    getBg(score),
                    "border-zinc-700/50"
                )}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Icon className={cn("w-4 h-4", getColor(score))} />
                            <span className="text-sm text-zinc-400 uppercase">{metricKey}</span>
                        </div>
                        <HelpCircle className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400 transition-colors" />
                    </div>
                    <p className={cn("text-2xl font-bold", getColor(score))}>
                        {formatValue()}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">{info.name.split("(")[0].trim()}</p>
                </div>
            </HoverCardTrigger>

            <HoverCardContent
                className="w-80 bg-zinc-900 border-zinc-800 p-4"
                side="top"
                align="center"
            >
                <div className="space-y-3">
                    <div>
                        <h4 className="font-semibold text-zinc-100 mb-1">{info.name}</h4>
                        <p className="text-sm text-zinc-400">{info.description}</p>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-emerald-400">Good: {info.goodThreshold}</span>
                    </div>

                    <div>
                        <h5 className="text-xs font-medium text-zinc-500 uppercase mb-1">Why It Matters</h5>
                        <p className="text-xs text-zinc-400">{info.impact}</p>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}

// Lighthouse Score Card with Tooltip
function LighthouseScoreCard({
    label,
    score,
    description
}: {
    label: string;
    score: number | null;
    description: string;
}) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div className="cursor-help">
                        <ScoreGauge score={score} label={label} size="sm" />
                    </div>
                </TooltipTrigger>
                <TooltipContent
                    side="bottom"
                    className="max-w-xs bg-zinc-900 border-zinc-800 p-3"
                >
                    <p className="text-sm text-zinc-300">{description}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                        Score: {score !== null ? `${score}/100` : "Not available"}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function SEOSection({ data, className }: SEOSectionProps) {
    const { t } = useLanguage();
    const { scores, core_web_vitals, audits, opportunities } = data;

    return (
        <Card className={cn("bg-zinc-900/50 border-zinc-800", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <Gauge className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl">{t.seo.title}</CardTitle>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-zinc-900 border-zinc-800">
                                <p className="text-sm">
                                    {t.seo.lighthouseInfo}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* Lighthouse Scores with Tooltips */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-sm font-medium text-zinc-500">{t.seo.lighthouseScores}</h3>
                        <span className="text-xs text-zinc-600">{t.common.hoverForInfo}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <LighthouseScoreCard
                            label={t.seo.performance}
                            score={scores.performance}
                            description={t.seo.performanceDesc}
                        />
                        <LighthouseScoreCard
                            label={t.seo.seoLabel}
                            score={scores.seo}
                            description={t.seo.seoDesc}
                        />
                        <LighthouseScoreCard
                            label={t.seo.accessibility}
                            score={scores.accessibility}
                            description={t.seo.accessibilityDesc}
                        />
                        <LighthouseScoreCard
                            label={t.seo.bestPractices}
                            score={scores.best_practices}
                            description={t.seo.bestPracticesDesc}
                        />
                    </div>
                </div>

                {/* Core Web Vitals with Hover Cards */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-sm font-medium text-zinc-500">Core Web Vitals</h3>
                        <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-400">
                            Google Ranking Factor
                        </Badge>
                        <span className="text-xs text-zinc-600">Hover for details</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <CWVCard
                            metricKey="lcp"
                            value={core_web_vitals.lcp}
                            score={core_web_vitals.lcp_score}
                            icon={Zap}
                        />
                        <CWVCard
                            metricKey="fid"
                            value={core_web_vitals.fid ?? core_web_vitals.inp}
                            score={core_web_vitals.fid_score}
                            icon={Clock}
                        />
                        <CWVCard
                            metricKey="cls"
                            value={core_web_vitals.cls}
                            score={core_web_vitals.cls_score}
                            icon={LayoutGrid}
                        />
                    </div>

                    {/* Additional metrics */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        {core_web_vitals.fcp !== null && (
                            <CWVCard
                                metricKey="fcp"
                                value={core_web_vitals.fcp}
                                score={core_web_vitals.fcp! <= 1.8 ? "good" : core_web_vitals.fcp! <= 3 ? "needs-improvement" : "poor"}
                                icon={Zap}
                            />
                        )}
                        {core_web_vitals.ttfb !== null && (
                            <CWVCard
                                metricKey="ttfb"
                                value={core_web_vitals.ttfb}
                                score={core_web_vitals.ttfb! <= 800 ? "good" : core_web_vitals.ttfb! <= 1800 ? "needs-improvement" : "poor"}
                                icon={Clock}
                            />
                        )}
                    </div>
                </div>

                {/* SEO Audits */}
                {audits.length > 0 && (
                    <Accordion type="single" collapsible>
                        <AccordionItem value="audits" className="border-none">
                            <AccordionTrigger className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:no-underline hover:bg-zinc-800">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-blue-400" />
                                    <span className="font-semibold">SEO Audits ({audits.length})</span>
                                    <Badge variant="outline" className="ml-2 text-xs border-emerald-500/30 text-emerald-400">
                                        {audits.filter(a => a.passed).length} passed
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2">
                                <div className="space-y-2">
                                    {audits.map((audit) => (
                                        <TooltipProvider key={audit.id}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={cn(
                                                            "p-3 rounded-lg flex items-center gap-3 cursor-help transition-all",
                                                            "hover:scale-[1.01]",
                                                            audit.passed ? "bg-emerald-500/5 hover:bg-emerald-500/10" : "bg-amber-500/5 hover:bg-amber-500/10"
                                                        )}
                                                    >
                                                        {audit.passed ? (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                                        ) : (
                                                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className={cn(
                                                                "font-medium text-sm",
                                                                audit.passed ? "text-zinc-300" : "text-amber-300"
                                                            )}>
                                                                {audit.title}
                                                            </p>
                                                            {audit.displayValue && (
                                                                <p className="text-xs text-zinc-500">{audit.displayValue}</p>
                                                            )}
                                                        </div>
                                                        <Info className="w-4 h-4 text-zinc-600" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="left"
                                                    className="max-w-sm bg-zinc-900 border-zinc-800 p-3"
                                                >
                                                    <p className="text-sm text-zinc-300">{audit.description}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}

                {/* Opportunities */}
                {opportunities.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-sm font-medium text-zinc-500">
                                Optimization Opportunities
                            </h3>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="w-3.5 h-3.5 text-zinc-600" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs bg-zinc-900 border-zinc-800">
                                        <p className="text-sm">
                                            These optimizations could improve your page load time. Sorted by potential impact.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="space-y-2">
                            {opportunities.slice(0, 5).map((opp) => (
                                <TooltipProvider key={opp.id}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div
                                                className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-between cursor-help hover:bg-amber-500/10 transition-all"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm text-zinc-200">{opp.title}</p>
                                                    {opp.displayValue && (
                                                        <p className="text-xs text-zinc-500">{opp.displayValue}</p>
                                                    )}
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-amber-400" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="top"
                                            className="max-w-sm bg-zinc-900 border-zinc-800 p-3"
                                        >
                                            <p className="text-sm text-zinc-300">{opp.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error state */}
                {data.error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
                        <XCircle className="w-5 h-5" />
                        {data.error}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
