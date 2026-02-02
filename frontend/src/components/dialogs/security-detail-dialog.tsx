"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    ShieldAlert,
    AlertTriangle,
    FileCode,
    Lightbulb,
    ExternalLink,
    Copy,
    Check
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { SeverityLevel } from "@/types";

interface SecurityDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: "header" | "file";
    data: {
        name: string;
        severity: SeverityLevel;
        value?: string | null;
        present?: boolean;
        description?: string | null;
        recommendation?: string | null;
        path?: string;
    };
}

const severityColors: Record<SeverityLevel, { bg: string; text: string; border: string }> = {
    critical: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
    high: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
    medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
    low: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
    info: { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/30" },
    ok: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
};

export function SecurityDetailDialog({ open, onOpenChange, type, data }: SecurityDetailDialogProps) {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);

    // Get detailed info from translations
    const detailedInfo = type === "header"
        ? t.security.securityHeaders[data.name]
        : (data.path ? t.security.exposedFilesDetail[data.path] : undefined);

    const colors = severityColors[data.severity];

    const handleCopyCode = async (code: string) => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", colors.bg)}>
                            <ShieldAlert className={cn("w-5 h-5", colors.text)} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl text-zinc-100">
                                {type === "header" ? data.name : data.path}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={cn("text-xs", colors.text, colors.border)}>
                                    {data.severity.toUpperCase()}
                                </Badge>
                                <span className="text-zinc-500">
                                    {type === "header"
                                        ? (data.present ? t.security.headerPresent : t.security.headerMissing)
                                        : t.security.exposedFile
                                    }
                                </span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Current Value (if header is present) */}
                    {type === "header" && data.present && data.value && (
                        <div>
                            <h4 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                                <FileCode className="w-4 h-4" />
                                Current Value
                            </h4>
                            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 font-mono text-sm text-zinc-300 break-all">
                                {data.value}
                            </div>
                        </div>
                    )}

                    {/* Evidence (for missing headers) */}
                    {type === "header" && !data.present && (
                        <div>
                            <h4 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Evidence
                            </h4>
                            <div className={cn("p-3 rounded-lg border", colors.bg, colors.border)}>
                                <p className="text-sm text-zinc-300">
                                    The <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-violet-400">{data.name}</code> header
                                    was not found in the HTTP response headers.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-2">Description</h4>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            {detailedInfo?.description || data.description || "No detailed description available."}
                        </p>
                    </div>

                    {/* Impact */}
                    {detailedInfo?.impact && (
                        <div>
                            <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Security Impact
                            </h4>
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-zinc-300 leading-relaxed">
                                    {detailedInfo.impact}
                                </p>
                            </div>
                        </div>
                    )}

                    <Separator className="bg-zinc-800" />

                    {/* Remediation */}
                    {(detailedInfo?.remediation || data.recommendation) && (
                        <div>
                            <h4 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                How to Fix
                            </h4>
                            <div className="relative">
                                <div className="p-4 rounded-lg bg-zinc-800/80 border border-zinc-700/50 font-mono text-sm text-zinc-300 whitespace-pre-wrap overflow-x-auto">
                                    {detailedInfo?.remediation || data.recommendation}
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 h-8 w-8 p-0 text-zinc-500 hover:text-white"
                                    onClick={() => handleCopyCode(detailedInfo?.remediation || data.recommendation || "")}
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* References (only for headers) */}
                    {type === "header" && detailedInfo && "references" in detailedInfo && (detailedInfo as { references?: string[] }).references && (detailedInfo as { references: string[] }).references.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-zinc-400 mb-2">References</h4>
                            <div className="space-y-2">
                                {(detailedInfo as { references: string[] }).references.map((ref, i) => (
                                    <a
                                        key={i}
                                        href={ref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        {new URL(ref).hostname}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
