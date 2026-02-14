"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TechDetailSheet } from "@/components/dialogs/tech-detail-sheet";
import {
    Code2,
    Server,
    Globe,
    Layers,
    BarChart3,
    AlertTriangle,
    ExternalLink,
    CheckCircle2,
    ChevronRight,
    Shield,
    Building2,
    Users,
    MapPin,
    Mail,
    Phone,
    Twitter,
    Linkedin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { TechStackResult, Technology } from "@/types";

interface TechStackSectionProps {
    data: TechStackResult;
    className?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
    "CMS": <Globe className="w-4 h-4" />,
    "E-commerce": <Globe className="w-4 h-4" />,
    "Website Builder": <Globe className="w-4 h-4" />,
    "JavaScript Framework": <Code2 className="w-4 h-4" />,
    "JavaScript Library": <Code2 className="w-4 h-4" />,
    "CSS Framework": <Layers className="w-4 h-4" />,
    "Web Server": <Server className="w-4 h-4" />,
    "Hosting": <Server className="w-4 h-4" />,
    "CDN": <Server className="w-4 h-4" />,
    "Analytics": <BarChart3 className="w-4 h-4" />,
    "Tag Manager": <BarChart3 className="w-4 h-4" />,
    "Programming Language": <Code2 className="w-4 h-4" />,
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    "CMS": { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/30" },
    "E-commerce": { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
    "Website Builder": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
    "JavaScript Framework": { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
    "JavaScript Library": { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
    "CSS Framework": { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
    "Web Server": { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
    "Hosting": { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30" },
    "CDN": { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
    "Analytics": { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/30" },
    "Tag Manager": { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
    "Programming Language": { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" },
};

// Interactive Tech Card
function TechCard({
    tech,
    onClick
}: {
    tech: Technology;
    onClick: () => void;
}) {
    const primaryCategory = tech.categories[0] || "Other";
    const colors = categoryColors[primaryCategory] || {
        bg: "bg-zinc-500/10",
        text: "text-zinc-400",
        border: "border-zinc-500/30"
    };
    const icon = categoryIcons[primaryCategory] || <Code2 className="w-4 h-4" />;
    const iconUrl = tech.icon ? `https://raw.githubusercontent.com/fingers10/wappalyzer/master/src/drivers/webextension/images/icons/${tech.icon}` : null;

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all duration-200",
                "hover:scale-[1.02] hover:shadow-lg group",
                colors.bg,
                colors.border,
                tech.is_outdated && "ring-2 ring-amber-500/50"
            )}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg flex items-center justify-center overflow-hidden", colors.bg, colors.text)}>
                        {iconUrl ? (
                            <img
                                src={iconUrl}
                                alt={tech.name}
                                className="w-4 h-4 object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    // Make the sibling SVG visible if hidden? 
                                    // Easier: Just render the fallback icon if error occurs? 
                                    // Standard approach: state. But for list it's heavy.
                                    // CSS fallback: display: none on error, and have SVG behind it?
                                    // Let's just use the image and if it fails, it fails (alt text). 
                                    // Or rely on Wappalyzer path being stable.
                                }}
                            />
                        ) : (
                            icon
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold text-zinc-100">{tech.name}</h4>
                        <div className="flex flex-wrap gap-1">
                            {tech.categories.map(cat => (
                                <span key={cat} className={cn("text-[10px] px-1 rounded-sm bg-zinc-800/50", colors.text)}>
                                    {cat}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {tech.website && (
                        <a
                            href={tech.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </div>
            </div>

            {/* Version info */}
            {(tech.version || tech.latest_version) && (
                <div className="flex items-center justify-between gap-2 mt-3">
                    <div className="flex items-center gap-2">
                        {tech.version && (
                            <Badge variant="outline" className="text-xs bg-zinc-800/50">
                                v{tech.version}
                            </Badge>
                        )}

                        {tech.is_outdated ? (
                            <div className="flex items-center gap-1 text-amber-400">
                                <AlertTriangle className="w-3 h-3" />
                                <span className="text-xs">
                                    → v{tech.latest_version}
                                </span>
                            </div>
                        ) : tech.latest_version && tech.version && (
                            <div className="flex items-center gap-1 text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="text-xs">Up to date</span>
                            </div>
                        )}
                    </div>

                    {/* View Risks Button for outdated */}
                    {tech.is_outdated && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick();
                            }}
                        >
                            <Shield className="w-3 h-3 mr-1" />
                            View Risks
                        </Button>
                    )}
                </div>
            )}

            {/* Confidence bar */}
            {tech.confidence < 100 && (
                <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>Confidence</span>
                        <span>{tech.confidence}%</span>
                    </div>
                    <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full", colors.bg.replace("/10", "/50"))}
                            style={{ width: `${tech.confidence}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export function TechStackSection({ data, className }: TechStackSectionProps) {
    const { t } = useLanguage();
    const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Group technologies by category
    const grouped = data.technologies.reduce<Record<string, Technology[]>>((acc, tech) => {
        const cats = tech.categories.length > 0 ? tech.categories : ["Other"];
        cats.forEach(cat => {
            if (!acc[cat]) {
                acc[cat] = [];
            }
            acc[cat].push(tech);
        });
        return acc;
    }, {});

    // Sort: outdated first
    Object.values(grouped).forEach(techs => {
        techs.sort((a, b) => (b.is_outdated ? 1 : 0) - (a.is_outdated ? 1 : 0));
    });

    const handleTechClick = (tech: Technology) => {
        setSelectedTech(tech);
        setSheetOpen(true);
    };

    return (
        <>
            <Card className={cn("bg-zinc-900/50 border-zinc-800", className)}>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                                <Layers className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-xl">{t.tech.title}</CardTitle>
                            <span className="text-xs text-zinc-500">Click to view details</span>
                        </div>

                        {data.outdated_count > 0 && (
                            <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {data.outdated_count} outdated
                            </Badge>
                        )}

                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Tech Score</span>
                            <div className={cn(
                                "text-2xl font-black",
                                data.score >= 90 ? "text-emerald-500" :
                                    data.score >= 70 ? "text-amber-500" :
                                        "text-red-500"
                            )}>
                                {data.score}%
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Company Info (Wappalyzer API) */}
                    {data.company?.name && (
                        <div className="p-5 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-6">
                            <div className="flex flex-col md:flex-row gap-6 justify-between">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-violet-100 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-violet-400" />
                                        {data.company.name}
                                    </h3>
                                    {data.company.description && (
                                        <p className="text-sm text-violet-200/80 max-w-2xl">
                                            {data.company.description}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-4 text-sm text-violet-300 pt-2">
                                        {data.company.industry && (
                                            <Badge variant="outline" className="bg-violet-500/10 border-violet-500/30 text-violet-300">
                                                {data.company.industry}
                                            </Badge>
                                        )}
                                        {data.company.size && (
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-4 h-4 text-violet-400" />
                                                {data.company.size}
                                            </div>
                                        )}
                                        {data.company.location && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-violet-400" />
                                                {data.company.location}
                                            </div>
                                        )}
                                        {data.company.founded && (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-violet-400">Est.</span>
                                                {data.company.founded}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contacts */}
                                {data.contacts && (
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        {data.contacts.emails?.slice(0, 3).map((email, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-violet-200">
                                                <Mail className="w-4 h-4 text-violet-400" />
                                                {email}
                                            </div>
                                        ))}
                                        {data.contacts.phones?.slice(0, 2).map((phone, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-violet-200">
                                                <Phone className="w-4 h-4 text-violet-400" />
                                                {phone}
                                            </div>
                                        ))}
                                        <div className="flex gap-2 mt-1">
                                            {data.contacts.linkedin?.map((url, idx) => (
                                                <a key={idx} href={url.startsWith('http') ? url : `https://linkedin.com/${url}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 transition-colors">
                                                    <Linkedin className="w-4 h-4" />
                                                </a>
                                            ))}
                                            {data.contacts.twitter?.map((url, idx) => (
                                                <a key={idx} href={url.startsWith('http') ? url : `https://twitter.com/${url}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 transition-colors">
                                                    <Twitter className="w-4 h-4" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quick Overview */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {data.cms && (
                            <div className="p-3 rounded-lg bg-zinc-800/50 text-center hover:bg-zinc-800 transition-colors cursor-pointer"
                                onClick={() => {
                                    const cmsTech = data.technologies.find(t => t.name === data.cms);
                                    if (cmsTech) handleTechClick(cmsTech);
                                }}
                            >
                                <Globe className="w-5 h-5 mx-auto text-violet-400 mb-1" />
                                <p className="text-xs text-zinc-500">CMS</p>
                                <p className="font-semibold text-zinc-200">{data.cms}</p>
                            </div>
                        )}
                        {data.framework && (
                            <div className="p-3 rounded-lg bg-zinc-800/50 text-center hover:bg-zinc-800 transition-colors cursor-pointer"
                                onClick={() => {
                                    const fwTech = data.technologies.find(t => t.name === data.framework);
                                    if (fwTech) handleTechClick(fwTech);
                                }}
                            >
                                <Code2 className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
                                <p className="text-xs text-zinc-500">Framework</p>
                                <p className="font-semibold text-zinc-200">{data.framework}</p>
                            </div>
                        )}
                        {data.server && (
                            <div className="p-3 rounded-lg bg-zinc-800/50 text-center hover:bg-zinc-800 transition-colors cursor-pointer"
                                onClick={() => {
                                    const srvTech = data.technologies.find(t => t.name === data.server);
                                    if (srvTech) handleTechClick(srvTech);
                                }}
                            >
                                <Server className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                                <p className="text-xs text-zinc-500">Server</p>
                                <p className="font-semibold text-zinc-200">{data.server}</p>
                            </div>
                        )}
                        {data.cdn && (
                            <div className="p-3 rounded-lg bg-zinc-800/50 text-center hover:bg-zinc-800 transition-colors cursor-pointer"
                                onClick={() => {
                                    const cdnTech = data.technologies.find(t => t.name === data.cdn);
                                    if (cdnTech) handleTechClick(cdnTech);
                                }}
                            >
                                <Server className="w-5 h-5 mx-auto text-orange-400 mb-1" />
                                <p className="text-xs text-zinc-500">CDN</p>
                                <p className="font-semibold text-zinc-200">{data.cdn}</p>
                            </div>
                        )}
                    </div>

                    {/* Technologies Grid - Grouped by Category */}
                    {Object.entries(grouped).map(([category, techs]) => (
                        <div key={category}>
                            <h3 className="text-sm font-medium text-zinc-500 mb-3">{category}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {techs.map((tech) => (
                                    <TechCard
                                        key={tech.name}
                                        tech={tech}
                                        onClick={() => handleTechClick(tech)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Empty state */}
                    {data.technologies.length === 0 && !data.error && (
                        <div className="text-center py-8 text-zinc-500">
                            <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>{t.tech.noTechnologies}</p>
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

            {/* Detail Sheet */}
            <TechDetailSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                technology={selectedTech}
            />
        </>
    );
}
