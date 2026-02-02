"use client";

import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, BarChart3, Activity, Shield, Zap, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScoreHistoryChartProps {
    data: Array<{
        created_at: string;
        score: number;
        url?: string;
        summary?: string; // JSON string
    }>;
}

type MetricType = 'global' | 'seo' | 'security' | 'performance';

const metrics: Record<MetricType, { label: string; color: string; icon: any }> = {
    global: { label: 'Global Score', color: '#8b5cf6', icon: Activity }, // Violet
    seo: { label: 'SEO', color: '#3b82f6', icon: Search }, // Blue
    security: { label: 'Sécurité', color: '#ef4444', icon: Shield }, // Red
    performance: { label: 'Performance', color: '#f59e0b', icon: Zap }, // Amber
};

const CustomTooltip = ({ active, payload, label, color }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/95 border border-border/50 rounded-lg shadow-xl p-3 backdrop-blur-sm text-xs">
                <p className="font-semibold mb-1">{payload[0].payload.fullDate}</p>
                {payload[0].payload.hostname && (
                    <p className="text-muted-foreground mb-2 flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        {payload[0].payload.hostname}
                    </p>
                )}
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-muted-foreground">{payload[0].name}:</span>
                    <span className="font-bold text-foreground">{payload[0].value}/100</span>
                </div>
            </div>
        );
    }
    return null;
};

export function ScoreHistoryChart({ data }: ScoreHistoryChartProps) {
    const [metric, setMetric] = useState<MetricType>('global');
    const [selectedDomain, setSelectedDomain] = useState<string>("all");

    // 1. Get Unique Domains
    const uniqueDomains = useMemo(() => {
        if (!data) return [];
        const domains = new Set(data.map(d => {
            try {
                return d.url ? new URL(d.url).hostname : 'Inconnu';
            } catch { return 'Inconnu'; }
        }));
        return Array.from(domains).sort();
    }, [data]);

    // 2. Prepare Data
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        let filteredData = [...data];

        // Filter by domain if selected
        if (selectedDomain !== "all") {
            filteredData = filteredData.filter(d => {
                try {
                    const hostname = d.url ? new URL(d.url).hostname : 'Inconnu';
                    return hostname === selectedDomain;
                } catch { return false; }
            });
        }

        return filteredData
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map(scan => {
                const date = new Date(scan.created_at);
                let value = scan.score;

                // If specialized metric is selected, try to parse summary
                if (metric !== 'global' && scan.summary) {
                    try {
                        const summary = JSON.parse(scan.summary);
                        if (summary[metric] !== undefined) {
                            value = summary[metric];
                        }
                    } catch (e) {
                        // ignore parse error
                    }
                }

                // Normalize scores if > 100 (e.g. 10000 bug fix)
                if (value > 100) {
                    value = Math.round(value / 100);
                }

                return {
                    value: value,
                    hostname: scan.url ? new URL(scan.url).hostname : 'Unknown',
                    date: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
                    timestamp: date.getTime(),
                    fullDate: date.toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                };
            });
    }, [data, metric, selectedDomain]);

    const activeMetric = metrics[metric];

    // 3. UX - Boundary Cases
    if (chartData.length === 0 && selectedDomain === "all") {
        return null; // Should not happen if data check passed in parent
    }

    if (chartData.length === 0 && selectedDomain !== "all") {
        return (
            <Card className="bg-background/60 backdrop-blur-sm border-muted mb-6">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-muted-foreground">Aucune donnée pour ce site.</p>
                </CardContent>
            </Card>
        )
    }

    if (chartData.length === 1) {
        return (
            <Card className="bg-background/60 backdrop-blur-sm border-muted mb-6">
                <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="w-5 h-5 text-violet-500" />
                                Évolution du Score
                            </CardTitle>
                            <CardDescription>
                                Analysez la progression par catégorie
                            </CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Site Web" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les sites</SelectItem>
                                    {uniqueDomains.map(domain => (
                                        <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={metric} onValueChange={(v: MetricType) => setMetric(v)}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Métrique" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="global">Global</SelectItem>
                                    <SelectItem value="security">Sécurité</SelectItem>
                                    <SelectItem value="seo">SEO</SelectItem>
                                    <SelectItem value="performance">Perf.</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="p-3 bg-muted rounded-full mb-4">
                        <BarChart3 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-foreground mb-1">Pas assez de données</h3>
                    <p className="text-sm text-muted-foreground">
                        Lancez un deuxième audit pour voir votre progression !
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: activeMetric.color }}>
                        <span className="text-2xl font-bold">{chartData[0].value}</span>
                        <span className="text-muted-foreground text-xs font-normal">{activeMetric.label} actuel</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const strokeColor = activeMetric.color;
    const gradientId = `colorScore-${metric}`;
    const Icon = activeMetric.icon;

    return (
        <Card className="bg-background/60 backdrop-blur-sm border-muted mb-6">
            <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="w-5 h-5 text-violet-500" />
                            Évolution du Score
                        </CardTitle>
                        <CardDescription>
                            Analysez la progression par catégorie
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Site Web" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les sites</SelectItem>
                                {uniqueDomains.map(domain => (
                                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={metric} onValueChange={(v: MetricType) => setMetric(v)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Métrique" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="global">Global</SelectItem>
                                <SelectItem value="security">Sécurité</SelectItem>
                                <SelectItem value="seo">SEO</SelectItem>
                                <SelectItem value="performance">Perf.</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis
                                dataKey="timestamp"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                tick={{ fontSize: 12, fill: '#888888' }}
                                dy={10}
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                scale="time"
                            />
                            <YAxis
                                domain={[0, 100]}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#888888' }}
                            />
                            <Tooltip
                                content={<CustomTooltip color={strokeColor} />}
                                cursor={{ stroke: strokeColor, strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                name={activeMetric.label}
                                stroke={strokeColor}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#${gradientId})`}
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
