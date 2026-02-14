"use client";

import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonRowProps {
    label: string;
    icon: LucideIcon;
    mainScore: number;
    competitorScore: number;
    colorClass: string;
}

export function ComparisonRow({ label, icon: Icon, mainScore, competitorScore, colorClass }: ComparisonRowProps) {
    const diff = mainScore - competitorScore;
    const diffAbs = Math.abs(diff);

    // Determine diff indicator
    const getDiffIndicator = () => {
        if (diffAbs < 1) {
            return {
                icon: Minus,
                color: "text-zinc-500",
                text: "Égal",
                bgColor: "bg-zinc-800/50"
            };
        }
        if (diff > 0) {
            return {
                icon: TrendingUp,
                color: "text-green-400",
                text: `+${diff.toFixed(0)}`,
                bgColor: "bg-green-500/10"
            };
        }
        return {
            icon: TrendingDown,
            color: "text-red-400",
            text: `${diff.toFixed(0)}`,
            bgColor: "bg-red-500/10"
        };
    };

    const diffIndicator = getDiffIndicator();
    const DiffIcon = diffIndicator.icon;

    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
            {/* Icon */}
            <div className={cn(
                "p-2 rounded-lg flex-shrink-0",
                `bg-${colorClass}-500/10`
            )}>
                <Icon className={cn("w-5 h-5", `text-${colorClass}-400`)} />
            </div>

            {/* Label & Scores */}
            <div className="flex-1 min-w-0">
                <div className="text-sm text-zinc-400 mb-1">{label}</div>
                <div className="flex items-center gap-4">
                    {/* Main Score */}
                    <div className="flex items-baseline gap-1">
                        <span className={cn(
                            "text-2xl font-bold",
                            mainScore > competitorScore ? "text-green-400" :
                                mainScore < competitorScore ? "text-red-400" :
                                    "text-white"
                        )}>{mainScore}</span>
                        <span className="text-sm text-zinc-500">/100</span>
                    </div>

                    {/* VS */}
                    <span className="text-zinc-600 font-medium">vs</span>

                    {/* Competitor Score */}
                    <div className="flex items-baseline gap-1">
                        <span className={cn(
                            "text-2xl font-bold",
                            competitorScore > mainScore ? "text-green-400" :
                                competitorScore < mainScore ? "text-red-400/60" :
                                    "text-orange-400"
                        )}>{competitorScore}</span>
                        <span className="text-sm text-zinc-500">/100</span>
                    </div>
                </div>
            </div>

            {/* Diff Badge */}
            <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0",
                diffIndicator.bgColor,
                diffIndicator.color
            )}>
                <DiffIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">{diffIndicator.text}</span>
            </div>
        </div>
    );
}
