import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyzeResponse } from "@/types/api";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Shield,
    Search,
    Zap,
    Eye,
    Settings,
    Cookie,
    Share2,
    Leaf,
    AtSign
} from "lucide-react";

interface ComparisonViewProps {
    main: AnalyzeResponse;
    competitor: AnalyzeResponse;
}

export function ComparisonView({ main, competitor }: ComparisonViewProps) {
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

    const getDiffIndicator = (mainScore: number, compScore: number) => {
        const diff = mainScore - compScore;
        if (Math.abs(diff) < 1) {
            return { icon: Minus, color: "text-zinc-500", text: "Égal" };
        }
        if (diff > 0) {
            return { icon: TrendingUp, color: "text-green-400", text: `+${diff.toFixed(0)}` };
        }
        return { icon: TrendingDown, color: "text-red-400", text: `${diff.toFixed(0)}` };
    };

    return (
        <Card className="border-violet-500/20 bg-black/40 backdrop-blur-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-b border-violet-500/20">
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-violet-500/20">
                        <Shield className="w-6 h-6 text-violet-400" />
                    </div>
                    Comparaison Compétitive
                </CardTitle>
                <div className="flex items-center gap-8 mt-4 text-sm">
                    <div className="flex flex-col">
                        <span className="text-zinc-500 mb-1">Votre Site</span>
                        <span className="font-mono text-white truncate max-w-md">{main.url}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-zinc-500 mb-1">Concurrent</span>
                        <span className="font-mono text-orange-400 truncate max-w-md">{competitor.url}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4">
                    {comparisons.map((item, index) => {
                        const Icon = item.icon;
                        const diff = getDiffIndicator(item.main, item.competitor);
                        const DiffIcon = diff.icon;

                        return (
                            <div
                                key={index}
                                className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
                            >
                                <div className={`p-2 rounded-lg bg-${item.color}-500/10`}>
                                    <Icon className={`w-5 h-5 text-${item.color}-400`} />
                                </div>

                                <div className="flex-1">
                                    <div className="text-sm text-zinc-400 mb-1">{item.label}</div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-white">{item.main}</span>
                                            <span className="text-sm text-zinc-500">/100</span>
                                        </div>
                                        <div className="text-zinc-600">vs</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-orange-400">{item.competitor}</span>
                                            <span className="text-sm text-zinc-500">/100</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 ${diff.color}`}>
                                    <DiffIcon className="w-4 h-4" />
                                    <span className="text-sm font-semibold">{diff.text}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-zinc-400 mb-1">Performance Globale</div>
                            <div className="text-2xl font-bold text-white">
                                {main.global_score > competitor.global_score ? (
                                    <span className="text-green-400">Vous êtes en tête 🏆</span>
                                ) : main.global_score < competitor.global_score ? (
                                    <span className="text-orange-400">Le concurrent est en tête</span>
                                ) : (
                                    <span className="text-zinc-400">Égalité</span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-zinc-400 mb-1">Différence</div>
                            <div className={`text-3xl font-black ${main.global_score > competitor.global_score ? "text-green-400" :
                                    main.global_score < competitor.global_score ? "text-red-400" :
                                        "text-zinc-500"
                                }`}>
                                {main.global_score > competitor.global_score ? "+" : ""}
                                {(main.global_score - competitor.global_score).toFixed(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
