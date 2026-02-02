"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Layers,
    AlertTriangle,
    ExternalLink,
    ArrowUpCircle,
    Shield,
    GitBranch,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Technology, SeverityLevel } from "@/types";

interface TechDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    technology: Technology | null;
}

const severityColors: Record<SeverityLevel, { bg: string; text: string; border: string }> = {
    critical: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
    high: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
    medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
    low: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
    info: { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/30" },
    ok: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
};

// Mock security risks for outdated technologies
const getTechRisks = (tech: Technology): { risk: string; severity: SeverityLevel }[] => {
    if (!tech.is_outdated) return [];

    const risks: { risk: string; severity: SeverityLevel }[] = [];

    // Add mock risks based on how outdated the version is
    if (tech.version && tech.latest_version) {
        const currentMajor = parseInt(tech.version.split(".")[0]);
        const latestMajor = parseInt(tech.latest_version.split(".")[0]);

        if (latestMajor - currentMajor >= 2) {
            risks.push({
                risk: "Multiple major versions behind - likely missing critical security patches",
                severity: "critical"
            });
        } else if (latestMajor - currentMajor >= 1) {
            risks.push({
                risk: "Major version behind - may be missing important security updates",
                severity: "high"
            });
        } else {
            risks.push({
                risk: "Minor/patch updates available - recommended to update for latest fixes",
                severity: "medium"
            });
        }
    }

    // Technology-specific risks
    const techRisks: Record<string, { risk: string; severity: SeverityLevel }[]> = {
        "jQuery": [
            { risk: "Older jQuery versions have known XSS vulnerabilities", severity: "high" },
            { risk: "Consider migrating to vanilla JavaScript or modern frameworks", severity: "info" }
        ],
        "WordPress": [
            { risk: "WordPress core updates often include security patches", severity: "high" },
            { risk: "Outdated WordPress is a primary target for automated attacks", severity: "critical" }
        ],
        "Bootstrap": [
            { risk: "Older versions may have XSS vulnerabilities in tooltip/popover plugins", severity: "medium" }
        ],
        "PHP": [
            { risk: "Outdated PHP versions lack security updates and modern features", severity: "high" },
            { risk: "Consider upgrading to PHP 8.x for performance and security improvements", severity: "medium" }
        ],
        "nginx": [
            { risk: "Web server updates often patch HTTP/2 and TLS vulnerabilities", severity: "high" }
        ]
    };

    if (techRisks[tech.name]) {
        risks.push(...techRisks[tech.name]);
    }

    return risks;
};

export function TechDetailSheet({ open, onOpenChange, technology }: TechDetailSheetProps) {
    if (!technology) return null;

    const risks = getTechRisks(technology);
    const colors = technology.is_outdated
        ? severityColors[technology.severity]
        : severityColors.ok;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="bg-zinc-900 border-zinc-800 w-full sm:max-w-lg">
                <SheetHeader>
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", colors.bg)}>
                            <Layers className={cn("w-5 h-5", colors.text)} />
                        </div>
                        <div>
                            <SheetTitle className="text-xl text-zinc-100">
                                {technology.name}
                            </SheetTitle>
                            <SheetDescription className="text-zinc-500">
                                {technology.categories.join(", ")}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {/* Version Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <GitBranch className="w-4 h-4 text-zinc-500" />
                                <span className="text-sm text-zinc-500">Current Version</span>
                            </div>
                            <p className="text-xl font-bold text-zinc-200">
                                {technology.version || "Unknown"}
                            </p>
                        </div>

                        <div className={cn(
                            "p-4 rounded-xl border",
                            technology.is_outdated
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : "bg-zinc-800/50 border-zinc-700/50"
                        )}>
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowUpCircle className={cn(
                                    "w-4 h-4",
                                    technology.is_outdated ? "text-emerald-400" : "text-zinc-500"
                                )} />
                                <span className={cn(
                                    "text-sm",
                                    technology.is_outdated ? "text-emerald-400" : "text-zinc-500"
                                )}>
                                    Latest Version
                                </span>
                            </div>
                            <p className={cn(
                                "text-xl font-bold",
                                technology.is_outdated ? "text-emerald-400" : "text-zinc-200"
                            )}>
                                {technology.latest_version || "—"}
                            </p>
                        </div>
                    </div>

                    {/* Update Status */}
                    {technology.is_outdated && (
                        <div className={cn(
                            "p-4 rounded-xl border",
                            colors.bg,
                            colors.border
                        )}>
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className={cn("w-4 h-4", colors.text)} />
                                <span className={cn("font-medium", colors.text)}>
                                    Update Recommended
                                </span>
                            </div>
                            <p className="text-sm text-zinc-400">
                                You are running version {technology.version}, but version {technology.latest_version} is available.
                                {technology.update_urgency === "critical" && " This is a critical update."}
                            </p>
                        </div>
                    )}

                    <Separator className="bg-zinc-800" />

                    {/* Security Risks */}
                    {risks.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Security Risks
                            </h4>
                            <div className="space-y-2">
                                {risks.map((risk, index) => {
                                    const riskColors = severityColors[risk.severity];
                                    return (
                                        <div
                                            key={index}
                                            className={cn(
                                                "p-3 rounded-lg border flex items-start gap-3",
                                                riskColors.bg,
                                                riskColors.border
                                            )}
                                        >
                                            <AlertTriangle className={cn("w-4 h-4 mt-0.5 flex-shrink-0", riskColors.text)} />
                                            <div className="flex-1">
                                                <p className="text-sm text-zinc-300">{risk.risk}</p>
                                                <Badge
                                                    variant="outline"
                                                    className={cn("mt-2 text-xs", riskColors.text, riskColors.border)}
                                                >
                                                    {risk.severity.toUpperCase()}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* No risks for up-to-date tech */}
                    {!technology.is_outdated && (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                            <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                            <p className="text-emerald-400 font-medium">Up to Date</p>
                            <p className="text-sm text-zinc-400 mt-1">
                                This technology is running the latest version.
                            </p>
                        </div>
                    )}

                    {/* Confidence */}
                    <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-2">Detection Confidence</h4>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-violet-500 rounded-full transition-all"
                                    style={{ width: `${technology.confidence}%` }}
                                />
                            </div>
                            <span className="text-sm text-zinc-400">{technology.confidence}%</span>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="pt-4">
                        {technology.website && (
                            <Button
                                variant="outline"
                                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                asChild
                            >
                                <a href={technology.website} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Visit {technology.name} Website
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
