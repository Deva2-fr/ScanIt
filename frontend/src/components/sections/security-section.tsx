"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { SecurityDetailDialog } from "@/components/dialogs/security-detail-dialog";
import {
    Shield,
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    Lock,
    Key,
    FileWarning,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    Eye,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SecurityResult, SecurityHeader, ExposedFile, SeverityLevel } from "@/types";

interface SecuritySectionProps {
    data: SecurityResult;
    className?: string;
}

const severityConfig: Record<SeverityLevel, {
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
    label: string;
}> = {
    critical: {
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        icon: <ShieldX className="w-4 h-4" />,
        label: "Critical"
    },
    high: {
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        icon: <ShieldAlert className="w-4 h-4" />,
        label: "High"
    },
    medium: {
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        icon: <AlertTriangle className="w-4 h-4" />,
        label: "Medium"
    },
    low: {
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        icon: <Info className="w-4 h-4" />,
        label: "Low"
    },
    info: {
        color: "text-zinc-400",
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/30",
        icon: <Info className="w-4 h-4" />,
        label: "Info"
    },
    ok: {
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        icon: <ShieldCheck className="w-4 h-4" />,
        label: "OK"
    },
};

// Interactive Header Card Component
function HeaderCard({
    header,
    onClick
}: {
    header: SecurityHeader;
    onClick: () => void;
}) {
    const config = severityConfig[header.severity];

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-4 rounded-lg border cursor-pointer transition-all duration-200",
                "hover:scale-[1.01] hover:shadow-lg",
                config.bg,
                config.border,
                "group"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn("p-2 rounded-lg", config.bg)}>
                        {header.present ? (
                            <CheckCircle2 className={cn("w-4 h-4", config.color)} />
                        ) : (
                            config.icon
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-zinc-200 truncate">{header.name}</h4>
                        <p className="text-sm text-zinc-500 truncate">
                            {header.present
                                ? (header.value ? header.value.slice(0, 50) + (header.value.length > 50 ? "..." : "") : "Present")
                                : "Missing - Click for details"
                            }
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-2">
                    <Badge
                        variant="outline"
                        className={cn("text-xs hidden sm:flex", config.color, config.border)}
                    >
                        {config.label}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-500 hover:text-white group-hover:bg-zinc-700/50"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Interactive Exposed File Card
function ExposedFileCard({
    file,
    onClick
}: {
    file: ExposedFile;
    onClick: () => void;
}) {
    const config = severityConfig[file.severity];

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-4 rounded-lg border cursor-pointer transition-all duration-200",
                "hover:scale-[1.01] hover:shadow-lg",
                config.bg,
                config.border,
                "group"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <code className="text-sm font-mono text-zinc-200">{file.path}</code>
                    {file.description && (
                        <p className="text-xs text-zinc-500 mt-1 truncate">{file.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                    <Badge
                        variant="outline"
                        className={cn("text-xs", config.color, config.border)}
                    >
                        {config.label}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                </div>
            </div>
        </div>
    );
}

export function SecuritySection({ data, className }: SecuritySectionProps) {
    const [selectedHeader, setSelectedHeader] = useState<SecurityHeader | null>(null);
    const [selectedFile, setSelectedFile] = useState<ExposedFile | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<"header" | "file">("header");

    const presentHeaders = data.headers.filter((h) => h.present);
    const missingHeaders = data.headers.filter((h) => !h.present && h.severity !== "ok");
    const exposedFiles = data.exposed_files.filter((f) => f.accessible);

    const handleHeaderClick = (header: SecurityHeader) => {
        setSelectedHeader(header);
        setDialogType("header");
        setDialogOpen(true);
    };

    const handleFileClick = (file: ExposedFile) => {
        setSelectedFile(file);
        setDialogType("file");
        setDialogOpen(true);
    };

    const getDialogData = () => {
        if (dialogType === "header" && selectedHeader) {
            return {
                name: selectedHeader.name,
                severity: selectedHeader.severity,
                value: selectedHeader.value,
                present: selectedHeader.present,
                description: selectedHeader.description,
                recommendation: selectedHeader.recommendation,
            };
        }
        if (dialogType === "file" && selectedFile) {
            return {
                name: selectedFile.path,
                severity: selectedFile.severity,
                description: selectedFile.description,
                path: selectedFile.path,
            };
        }
        return {
            name: "",
            severity: "info" as SeverityLevel,
        };
    };

    return (
        <>
            <Card className={cn("bg-zinc-900/50 border-zinc-800", className)}>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2 rounded-lg",
                                data.score >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                                    data.score >= 50 ? "bg-amber-500/20 text-amber-400" :
                                        "bg-red-500/20 text-red-400"
                            )}>
                                <Shield className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-xl">Security Analysis</CardTitle>
                        </div>
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-lg px-3 py-1",
                                data.score >= 80 ? "border-emerald-500/50 text-emerald-400" :
                                    data.score >= 50 ? "border-amber-500/50 text-amber-400" :
                                        "border-red-500/50 text-red-400"
                            )}
                        >
                            {data.score}/100
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* SSL Certificate */}
                    <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                        <div className="flex items-center gap-3 mb-3">
                            <Lock className="w-5 h-5 text-zinc-400" />
                            <h3 className="font-semibold">SSL/TLS Certificate</h3>
                        </div>

                        {data.ssl.error && (
                            <div className="flex items-start gap-2 text-red-400 mb-4 bg-red-500/10 p-3 rounded-md border border-red-500/20">
                                <ShieldX className="w-5 h-5 shrink-0 mt-0.5" />
                                <span className="text-sm font-medium">{data.ssl.error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                {data.ssl.valid ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-400" />
                                )}
                                <span className={data.ssl.valid ? "text-emerald-400" : "text-red-400"}>
                                    {data.ssl.valid ? "Valid Certificate" : "Invalid Certificate"}
                                </span>
                            </div>

                            {data.ssl.days_until_expiry !== null && (
                                <div className="flex items-center gap-2">
                                    <Key className="w-4 h-4 text-zinc-400" />
                                    <span className={cn(
                                        data.ssl.is_expired ? "text-red-400" :
                                            data.ssl.is_expiring_soon ? "text-amber-400" :
                                                "text-zinc-300"
                                    )}>
                                        {data.ssl.is_expired
                                            ? "Expired!"
                                            : `Expires in ${data.ssl.days_until_expiry} days`
                                        }
                                    </span>
                                </div>
                            )}

                            {data.ssl.protocol_version && (
                                <div className="text-sm text-zinc-400">
                                    Protocol: <span className="text-zinc-300">{data.ssl.protocol_version}</span>
                                </div>
                            )}

                            {data.ssl.issuer && (
                                <div className="text-sm text-zinc-400 truncate w-full" title={data.ssl.issuer}>
                                    Issuer: <span className="text-zinc-300">{data.ssl.issuer}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Missing Headers - Interactive Cards */}
                    {missingHeaders.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldAlert className="w-5 h-5 text-red-400" />
                                <h3 className="font-semibold text-red-400">
                                    Missing Security Headers ({missingHeaders.length})
                                </h3>
                                <span className="text-xs text-zinc-500">Click for details</span>
                            </div>
                            <div className="space-y-2">
                                {missingHeaders.map((header) => (
                                    <HeaderCard
                                        key={header.name}
                                        header={header}
                                        onClick={() => handleHeaderClick(header)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Present Headers */}
                    {presentHeaders.length > 0 && (
                        <Accordion type="single" collapsible>
                            <AccordionItem value="present" className="border-none">
                                <AccordionTrigger className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:no-underline hover:bg-emerald-500/20">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                        <span className="text-emerald-400 font-semibold">
                                            Present Security Headers ({presentHeaders.length})
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2">
                                    <div className="space-y-2">
                                        {presentHeaders.map((header) => (
                                            <HeaderCard
                                                key={header.name}
                                                header={header}
                                                onClick={() => handleHeaderClick(header)}
                                            />
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}

                    {/* Exposed Files - Interactive */}
                    {exposedFiles.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <FileWarning className="w-5 h-5 text-red-400" />
                                <h3 className="font-semibold text-red-400">
                                    Exposed Sensitive Files ({exposedFiles.length})
                                </h3>
                                <span className="text-xs text-zinc-500">Click for details</span>
                            </div>
                            <div className="space-y-2">
                                {exposedFiles.map((file) => (
                                    <ExposedFileCard
                                        key={file.path}
                                        file={file}
                                        onClick={() => handleFileClick(file)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <SecurityDetailDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                type={dialogType}
                data={getDialogData()}
            />
        </>
    );
}
