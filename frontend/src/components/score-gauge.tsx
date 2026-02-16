"use client";

import { useMemo } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { AlertCircle } from "lucide-react";

interface ScoreGaugeProps {
    score: number | null | undefined;
    label: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

// Utility function to clamp score between 0 and 100
function clampScore(score: number | null | undefined): number {
    if (score === null || score === undefined) return 0;
    return Math.max(0, Math.min(100, Math.round(score)));
}

export function ScoreGauge({ score, label, size = "md", className, restricted = false }: ScoreGaugeProps & { restricted?: boolean }) {
    const isAvailable = score !== null && score !== undefined;
    const displayScore = clampScore(score);

    const { color, bgColor, glowColor } = useMemo(() => {
        if (restricted) {
            return {
                color: "#71717a", // zinc-500
                bgColor: "rgba(113, 113, 122, 0.1)",
                glowColor: "rgba(113, 113, 122, 0.0)", // No glow for restricted
            };
        }
        if (!isAvailable) {
            return {
                color: "#71717a", // zinc-500
                bgColor: "rgba(113, 113, 122, 0.1)",
                glowColor: "rgba(113, 113, 122, 0.2)",
            };
        }
        if (displayScore >= 90) {
            return {
                color: "#10b981", // emerald-500
                bgColor: "rgba(16, 185, 129, 0.1)",
                glowColor: "rgba(16, 185, 129, 0.4)",
            };
        } else if (displayScore >= 50) {
            return {
                color: "#f59e0b", // amber-500
                bgColor: "rgba(245, 158, 11, 0.1)",
                glowColor: "rgba(245, 158, 11, 0.4)",
            };
        } else {
            return {
                color: "#ef4444", // red-500
                bgColor: "rgba(239, 68, 68, 0.1)",
                glowColor: "rgba(239, 68, 68, 0.4)",
            };
        }
    }, [displayScore, isAvailable, restricted]);

    const data = [
        {
            name: label,
            value: restricted ? 100 : displayScore, // Full circle for restricted but gray
            fill: color,
        },
    ];

    const dimensions = {
        sm: { container: "w-24 h-24", text: "text-xl", label: "text-xs" },
        md: { container: "w-36 h-36", text: "text-3xl", label: "text-sm" },
        lg: { container: "w-48 h-48", text: "text-4xl", label: "text-base" },
    };

    const dim = dimensions[size];

    return (
        <div className={cn("relative flex flex-col items-center", className)}>
            {/* Glow effect */}
            {!restricted && (
                <div
                    className={cn("absolute rounded-full blur-2xl opacity-50", dim.container)}
                    style={{ backgroundColor: glowColor }}
                />
            )}

            {/* Chart */}
            <div className={cn("relative", dim.container)}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        innerRadius="75%"
                        outerRadius="100%"
                        data={data}
                        startAngle={90}
                        endAngle={-270}
                        barSize={size === "sm" ? 8 : size === "md" ? 10 : 12}
                    >
                        <PolarAngleAxis
                            type="number"
                            domain={[0, 100]}
                            angleAxisId={0}
                            tick={false}
                        />
                        <RadialBar
                            background={{ fill: bgColor }}
                            dataKey="value"
                            cornerRadius={10}
                            animationDuration={1500}
                            animationEasing="ease-out"
                        />
                    </RadialBarChart>
                </ResponsiveContainer>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {restricted ? (
                        <div className="flex flex-col items-center text-center px-1">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 leading-tight">Changer<br />de plan</span>
                        </div>
                    ) : isAvailable ? (
                        <span
                            className={cn("font-bold tabular-nums", dim.text)}
                            style={{ color }}
                        >
                            {displayScore}
                        </span>
                    ) : (
                        <div className="flex flex-col items-center">
                            <AlertCircle className="w-6 h-6 text-zinc-500 mb-1" />
                            <span className="text-xs text-zinc-500">N/A</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Label */}
            <span className={cn("mt-2 text-zinc-400 font-medium", dim.label)}>
                {label}
            </span>
        </div>
    );
}

// Global Score Component with more dramatic styling
interface GlobalScoreProps {
    score: number | null | undefined;
    className?: string;
}

export function GlobalScore({ score, className }: GlobalScoreProps) {
    const { t } = useLanguage();

    // Clamp the score to 0-100
    const clampedScore = clampScore(score);
    const isAvailable = score !== null && score !== undefined;

    const { gradient, textColor, label } = useMemo(() => {
        if (!isAvailable) {
            return {
                gradient: "from-zinc-500 to-zinc-600",
                textColor: "text-zinc-400",
                label: "N/A",
            };
        }
        if (clampedScore >= 90) {
            return {
                gradient: "from-emerald-500 to-cyan-500",
                textColor: "text-emerald-400",
                label: t.common.excellent,
            };
        } else if (clampedScore >= 70) {
            return {
                gradient: "from-blue-500 to-violet-500",
                textColor: "text-blue-400",
                label: t.common.good,
            };
        } else if (clampedScore >= 50) {
            return {
                gradient: "from-amber-500 to-orange-500",
                textColor: "text-amber-400",
                label: t.common.needsWork,
            };
        } else {
            return {
                gradient: "from-red-500 to-pink-500",
                textColor: "text-red-400",
                label: t.common.poor,
            };
        }
    }, [clampedScore, isAvailable, t]);

    return (
        <div className={cn("flex flex-col items-center", className)}>
            {/* Large score display */}
            <div className="relative">
                {/* Glow */}
                <div className={cn(
                    "absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r rounded-full scale-150",
                    gradient
                )} />

                <div className="relative flex items-baseline gap-1">
                    {isAvailable ? (
                        <>
                            <span className={cn(
                                "text-8xl font-bold tabular-nums bg-gradient-to-r bg-clip-text text-transparent",
                                gradient
                            )}>
                                {clampedScore}
                            </span>
                            <span className="text-3xl text-zinc-500 font-medium">/100</span>
                        </>
                    ) : (
                        <div className="flex flex-col items-center py-4">
                            <AlertCircle className="w-16 h-16 text-zinc-500 mb-2" />
                            <span className="text-2xl text-zinc-500">Score unavailable</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Label */}
            <div className={cn("mt-4 text-xl font-semibold", textColor)}>
                {label}
            </div>

            {/* Subtitle */}
            <p className="text-sm text-zinc-500 mt-1">{t.dashboard.overallScore}</p>
        </div>
    );
}
