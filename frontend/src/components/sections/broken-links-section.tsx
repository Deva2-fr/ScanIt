"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Link2,
    LinkIcon,
    ExternalLink as ExternalLinkIcon,
    AlertTriangle,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { BrokenLinksResult } from "@/types";

interface BrokenLinksSectionProps {
    data: BrokenLinksResult;
    className?: string;
}

export function BrokenLinksSection({ data, className }: BrokenLinksSectionProps) {
    const { t } = useLanguage();
    const hasBrokenLinks = data.broken_count > 0;

    return (
        <Card className={cn("bg-zinc-900/50 border-zinc-800", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            hasBrokenLinks
                                ? "bg-red-500/20 text-red-400"
                                : "bg-emerald-500/20 text-emerald-400"
                        )}>
                            <Link2 className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl">{t.links.title}</CardTitle>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-zinc-400 border-zinc-700">
                            {data.total_links_checked} {t.links.checked}
                        </Badge>
                        {hasBrokenLinks ? (
                            <Badge variant="outline" className="border-red-500/50 text-red-400">
                                <XCircle className="w-3 h-3 mr-1" />
                                {data.broken_count} {t.links.broken}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {t.links.allOk}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Summary */}
                {hasBrokenLinks && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                            <div className="flex items-center gap-2 mb-1">
                                <LinkIcon className="w-4 h-4 text-red-400" />
                                <span className="text-sm text-zinc-400">{t.links.internal}</span>
                            </div>
                            <p className="text-2xl font-bold text-red-400">{data.internal_broken}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                            <div className="flex items-center gap-2 mb-1">
                                <ExternalLinkIcon className="w-4 h-4 text-amber-400" />
                                <span className="text-sm text-zinc-400">{t.links.external}</span>
                            </div>
                            <p className="text-2xl font-bold text-amber-400">{data.external_broken}</p>
                        </div>
                    </div>
                )}

                {/* Broken Links List */}
                {hasBrokenLinks && (
                    <Accordion type="single" collapsible defaultValue="broken">
                        <AccordionItem value="broken" className="border-none">
                            <AccordionTrigger className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 hover:no-underline hover:bg-red-500/20">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                    <span className="text-red-400 font-semibold">
                                        {t.links.brokenLinks} ({data.broken_count})
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2">
                                <div className="space-y-2">
                                    {data.broken_links.map((link, index) => (
                                        <div
                                            key={index}
                                            className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {link.is_internal ? (
                                                            <LinkIcon className="w-4 h-4 text-zinc-500" />
                                                        ) : (
                                                            <ExternalLinkIcon className="w-4 h-4 text-zinc-500" />
                                                        )}
                                                        <span className="text-xs text-zinc-500">
                                                            {link.is_internal ? t.links.internal : t.links.external}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-mono text-zinc-300 truncate">
                                                        {link.url}
                                                    </p>
                                                    {link.source_text && (
                                                        <p className="text-xs text-zinc-500 mt-1 truncate">
                                                            {t.links.linkText}: &ldquo;{link.source_text}&rdquo;
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "flex-shrink-0",
                                                        link.status_code === 0
                                                            ? "border-amber-500/50 text-amber-400"
                                                            : "border-red-500/50 text-red-400"
                                                    )}
                                                >
                                                    {link.status_code === 0 ? link.error_type : `${link.status_code}`}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}

                {/* Success state */}
                {!hasBrokenLinks && !data.error && (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-emerald-400 mb-1">
                            {t.links.allLinksWorking}
                        </h3>
                        <p className="text-sm text-zinc-500">
                            {data.total_links_checked} {t.links.linksCheckedValid}
                        </p>
                    </div>
                )}

                {/* Error state */}
                {data.error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                        {data.error}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
