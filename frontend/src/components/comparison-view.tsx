"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyzeResponse } from "@/types/api";
import {
    Shield,
    Search,
    Zap,
    Eye,
    Settings,
    Cookie,
    Share2,
    Leaf,
    AtSign,
    Trophy,
    Swords
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BattleRadar } from "./battle-radar";
import confetti from "canvas-confetti";

interface ComparisonViewProps {
    main: AnalyzeResponse;
    competitor: AnalyzeResponse;
}

// Helper for score colors
function getScoreColor(score: number): string {
    if (score >= 81) return "text-green-400";
    if (score >= 41) return "text-orange-400";
    return "text-red-400";
}

export function ComparisonView({ main, competitor }: ComparisonViewProps) {
    // Determine winner
    const mainWins = main.global_score > competitor.global_score;
    const competitorWins = main.global_score < competitor.global_score;
    const isDraw = main.global_score === competitor.global_score;

    // Trigger confetti if main user wins
    useEffect(() => {
        if (mainWins) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#4ade80', '#fb923c', '#a78bfa']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#4ade80', '#fb923c', '#a78bfa']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [mainWins]);

    // Metrics configuration
    const comparisons = [
        {
            label: "Score Global",
            icon: Shield,
            main: main.global_score,
            competitor: competitor.global_score,
            color: "violet"
        },
        {
            label: "Performance",
            icon: Zap,
            main: main.seo.scores.performance || 0,
            competitor: competitor.seo.scores.performance || 0,
            color: "blue"
        },
        {
            label: "SEO",
            icon: Search,
            main: main.seo.scores.seo || 0,
            competitor: competitor.seo.scores.seo || 0,
            color: "green"
        },
        {
            label: "Sécurité",
            icon: Shield,
            main: main.security.score,
            competitor: competitor.security.score,
            color: "red"
        },
        {
            label: "Accessibilité",
            icon: Eye,
            main: main.seo.scores.accessibility || 0,
            competitor: competitor.seo.scores.accessibility || 0,
            color: "yellow"
        },
        {
            label: "Best Practices",
            icon: Settings,
            main: main.seo.scores.best_practices || 0,
            competitor: competitor.seo.scores.best_practices || 0,
            color: "purple"
        },
        {
            label: "RGPD",
            icon: Cookie,
            main: main.gdpr.score,
            competitor: competitor.gdpr.score,
            color: "orange"
        },
        {
            label: "Social Media",
            icon: Share2,
            main: main.smo.score,
            competitor: competitor.smo.score,
            color: "pink"
        },
        {
            label: "Eco-Index",
            icon: Leaf,
            main: main.green_it.score,
            competitor: competitor.green_it.score,
            color: "emerald"
        },
        {
            label: "Email DNS",
            icon: AtSign,
            main: main.dns_health.score,
            competitor: competitor.dns_health.score,
            color: "indigo"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Battle Header with Winner Badge */}
            <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-black/40 to-orange-500/5 backdrop-blur-xl overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <div className="p-2 rounded-lg bg-violet-500/20">
                                <Swords className="w-6 h-6 text-violet-400" />
                            </div>
                            Battle Mode
                        </CardTitle>

                        {/* Winner Badge */}
                        {!isDraw && (
                            <Badge className={cn(
                                "px-4 py-2 text-lg font-bold flex items-center gap-2",
                                mainWins ? "bg-green-500/20 text-green-400 border-green-500/50" :
                                    "bg-orange-500/20 text-orange-400 border-orange-500/50"
                            )}>
                                <Trophy className="w-5 h-5" />
                                {mainWins ? "VOUS GAGNEZ!" : "CONCURRENT GAGNE"}
                            </Badge>
                        )}
                        {isDraw && (
                            <Badge className="px-4 py-2 text-lg font-bold bg-zinc-500/20 text-zinc-400 border-zinc-500/50">
                                ÉGALITÉ PARFAITE
                            </Badge>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Split Screen View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT - Main Site */}
                <Card className={cn(
                    "border-2 transition-all duration-300",
                    mainWins ? "border-green-500/50 bg-green-500/5 shadow-lg shadow-green-500/20" :
                        "border-zinc-800 bg-black/40"
                )}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-lg text-zinc-400">Votre Site</CardTitle>
                            {mainWins && (
                                <Trophy className="w-6 h-6 text-green-400 animate-pulse" />
                            )}
                        </div>
                        <div className="font-mono text-sm text-white truncate" title={main.url}>
                            {main.url}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Global Score */}
                        <div className="text-center mb-4 p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20">
                            <div className="text-sm text-zinc-400 mb-2">Score Global</div>
                            <div className={cn(
                                "text-6xl font-black tabular-nums",
                                getScoreColor(main.global_score)
                            )}>
                                {main.global_score}
                            </div>
                            <div className="text-zinc-500 text-sm mt-1">/100</div>
                        </div>

                        {/* Individual Metrics */}
                        <div className="space-y-3">
                            {comparisons.slice(1).map((metric, idx) => {
                                const Icon = metric.icon;

                                return (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-lg bg-${metric.color}-500/10`}>
                                                <Icon className={`w-4 h-4 text-${metric.color}-400`} />
                                            </div>
                                            <span className="text-sm text-zinc-400">{metric.label}</span>
                                        </div>
                                        <span className={cn(
                                            "text-lg font-bold tabular-nums",
                                            getScoreColor(metric.main)
                                        )}>
                                            {metric.main}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* RIGHT - Competitor Site */}
                <Card className={cn(
                    "border-2 transition-all duration-300",
                    competitorWins ? "border-orange-500/50 bg-orange-500/5 shadow-lg shadow-orange-500/20" :
                        "border-zinc-800 bg-black/40"
                )}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-lg text-zinc-400">Concurrent</CardTitle>
                            {competitorWins && (
                                <Trophy className="w-6 h-6 text-orange-400 animate-pulse" />
                            )}
                        </div>
                        <div className="font-mono text-sm text-orange-400 truncate" title={competitor.url}>
                            {competitor.url}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Global Score */}
                        <div className="text-center mb-4 p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                            <div className="text-sm text-zinc-400 mb-2">Score Global</div>
                            <div className={cn(
                                "text-6xl font-black tabular-nums",
                                getScoreColor(competitor.global_score)
                            )}>
                                {competitor.global_score}
                            </div>
                            <div className="text-zinc-500 text-sm mt-1">/100</div>
                        </div>

                        {/* Individual Metrics */}
                        <div className="space-y-3">
                            {comparisons.slice(1).map((metric, idx) => {
                                const Icon = metric.icon;

                                return (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-lg bg-${metric.color}-500/10`}>
                                                <Icon className={`w-4 h-4 text-${metric.color}-400`} />
                                            </div>
                                            <span className="text-sm text-zinc-400">{metric.label}</span>
                                        </div>
                                        <span className={cn(
                                            "text-lg font-bold tabular-nums",
                                            getScoreColor(metric.competitor)
                                        )}>
                                            {metric.competitor}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Card with RADAR and Confetti */}
            <Card className="border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-blue-500/10 backdrop-blur-xl overflow-hidden relative">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Left: Text Summary */}
                        <div className="space-y-6">
                            <div>
                                <div className="text-sm text-zinc-400 mb-2">Résultat Final</div>
                                <div className="text-3xl font-bold">
                                    {mainWins && <span className="text-green-400">Victoire Écrasante! 🏆</span>}
                                    {competitorWins && <span className="text-orange-400">Le concurrent a l'avantage</span>}
                                    {isDraw && <span className="text-zinc-400">Match Nul</span>}
                                </div>
                                <p className="text-zinc-500 mt-2">
                                    {mainWins
                                        ? "Votre site surpasse le concurrent sur la majorité des indicateurs clés."
                                        : competitorWins
                                            ? "Il y a des axes d'amélioration pour rattraper le concurrent."
                                            : "Les deux sites ont des performances très similaires."}
                                </p>
                            </div>

                            <div className="flex items-center gap-8">
                                <div>
                                    <div className="text-sm text-zinc-400 mb-1">Différence Score</div>
                                    <div className={cn(
                                        "text-4xl font-black tabular-nums",
                                        mainWins ? "text-green-400" :
                                            competitorWins ? "text-red-400" :
                                                "text-zinc-500"
                                    )}>
                                        {mainWins && "+"}
                                        {(main.global_score - competitor.global_score).toFixed(0)}
                                    </div>
                                </div>

                                {mainWins && (
                                    <div className="p-4 rounded-full bg-green-500/10 border border-green-500/20 animate-pulse">
                                        <Trophy className="w-8 h-8 text-green-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Radar Chart */}
                        <div className="w-full h-[300px] bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-4">
                            <BattleRadar main={main} competitor={competitor} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
