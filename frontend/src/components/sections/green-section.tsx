import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GreenResult } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Leaf, Award, Weight, Database, Scale, FileJson, Info } from "lucide-react";
import { RestrictedAccess } from "@/components/ui/restricted-access";

interface GreenSectionProps {
    data: GreenResult;
}

export function GreenSection({ data }: GreenSectionProps) {
    if (!data) return null;

    // Check for Plan Limit
    if (data.error?.includes("Plan Limit")) {
        return <RestrictedAccess feature="Green IT & Carbone" />;
    }

    // Determine color based on grade
    const getGradeColor = (grade: string) => {
        const colors: Record<string, string> = {
            "A": "bg-emerald-500 text-white shadow-emerald-500/20",
            "B": "bg-emerald-400 text-white shadow-emerald-400/20",
            "C": "bg-lime-400 text-black shadow-lime-400/20",
            "D": "bg-yellow-400 text-black shadow-yellow-400/20",
            "E": "bg-orange-400 text-white shadow-orange-400/20",
            "F": "bg-red-500 text-white shadow-red-500/20",
            "G": "bg-red-700 text-white shadow-red-700/20",
        };
        return colors[grade] || "bg-gray-500 text-white";
    };

    return (
        <Card className="border-emerald-500/20 bg-black/40 backdrop-blur-xl overflow-hidden mb-6">
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Leaf className="w-6 h-6 text-emerald-400" />
                            Eco-Conception & Impact Carbone
                        </CardTitle>
                        <CardDescription>
                            Analyse de l'empreinte environnementale de votre page web.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${data.score >= 80 ? "text-emerald-400" : data.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                            {data.score}/100
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8 justify-center py-6">
                    {/* Eco-Score Badge */}
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl font-black shadow-2xl ${getGradeColor(data.grade)} border-4 border-white/10 relative transition-transform hover:scale-105`}>
                            {data.grade}
                            <div className="absolute -bottom-2 px-3 py-1 bg-zinc-900 rounded-full text-xs text-white font-medium border border-zinc-700">
                                Eco-Score
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <Leaf className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm text-zinc-500">Empreinte Carbone</div>
                                <div className="text-xl font-bold text-white">{data.co2_grams} gCO2e <span className="text-xs font-normal text-zinc-500">/ visite</span></div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Scale className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm text-zinc-500">Poids de la page</div>
                                <div className="text-xl font-bold text-white mr-1">{data.total_size_mb} MB</div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-3 col-span-full">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <FileJson className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm text-zinc-500">Ressources Chargées</div>
                                <div className="flex items-baseline gap-2">
                                    <div className="text-xl font-bold text-white">{data.resource_count} fichiers</div>
                                    <div className="text-xs text-zinc-500">(Images, Scripts, Styles, etc.)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 text-sm text-zinc-400 flex gap-3">
                    <Info className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-semibold text-zinc-300">Comment est calculé ce score ?</span>
                        <p className="mt-1 leading-relaxed">
                            L'Eco-Index est estimé selon le modèle standard de l'impact du transfert de données (Digital Carbon Footprint).
                            On considère qu'1 Mo de données transférées génère environ <strong>0.6g de CO2</strong> (moyenne mondiale).
                            Pour obtenir un score <strong>A</strong>, la page doit peser moins de 0.8 MB environ.
                            Pour améliorer ce score : optimisez vos images (WebP/AVIF), minifiez vos fichiers JS/CSS et utilisez le Lazy Loading.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
