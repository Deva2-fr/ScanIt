"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Legend } from "recharts";
import { AnalyzeResponse } from "@/types";

interface BattleRadarProps {
    main: AnalyzeResponse;
    competitor: AnalyzeResponse;
}

export function BattleRadar({ main, competitor }: BattleRadarProps) {
    const data = [
        {
            subject: "Performance",
            main: main.seo.scores.performance || 0,
            competitor: competitor.seo.scores.performance || 0,
            fullMark: 100,
        },
        {
            subject: "SEO",
            main: main.seo.scores.seo || 0,
            competitor: competitor.seo.scores.seo || 0,
            fullMark: 100,
        },
        {
            subject: "Sécurité",
            main: main.security.score,
            competitor: competitor.security.score,
            fullMark: 100,
        },
        {
            subject: "Accessibilité",
            main: main.seo.scores.accessibility || 0,
            competitor: competitor.seo.scores.accessibility || 0,
            fullMark: 100,
        },
        {
            subject: "Best Practices",
            main: main.seo.scores.best_practices || 0,
            competitor: competitor.seo.scores.best_practices || 0,
            fullMark: 100,
        },
        {
            subject: "Green IT",
            main: main.green_it.score,
            competitor: competitor.green_it.score,
            fullMark: 100,
        }
    ];

    return (
        <div className="w-full h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="45%" outerRadius="65%" data={data}>
                    <PolarGrid stroke="#3f3f46" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    />
                    <Radar
                        name="Votre Site"
                        dataKey="main"
                        stroke="#4ade80" // green-400
                        strokeWidth={3}
                        fill="#4ade80"
                        fillOpacity={0.25}
                        dot={{ r: 4, fillOpacity: 1, strokeWidth: 0 }}
                    />
                    <Radar
                        name="Concurrent"
                        dataKey="competitor"
                        stroke="#fb923c" // orange-400
                        strokeWidth={3}
                        fill="#fb923c"
                        fillOpacity={0.25}
                        dot={{ r: 4, fillOpacity: 1, strokeWidth: 0 }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ paddingTop: "10px" }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
