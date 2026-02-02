import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GDPRResult } from "@/types/api";
import { Shield, CheckCircle2, AlertTriangle, Cookie as CookieIcon, FileText, Ban, ExternalLink } from "lucide-react";

interface GdprSectionProps {
    data: GDPRResult;
}

export function GdprSection({ data }: GdprSectionProps) {
    // If data is missing (old scan), don't break
    if (!data) return null;

    return (
        <Card className="border-violet-500/20 bg-black/40 backdrop-blur-xl overflow-hidden mb-6">
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Shield className="w-6 h-6 text-violet-400" />
                            Compliance RGPD & ePrivacy
                        </CardTitle>
                        <CardDescription>
                            Analyse des cookies déposés avant consentement (Zero-Click Analysis)
                        </CardDescription>
                    </div>
                    <div className="flex gap-2 items-center">
                        {data.error ? (
                            <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/20 hover:bg-red-500/30">
                                Erreur Analyse
                            </Badge>
                        ) : (
                            <Badge variant={data.compliant ? "default" : "destructive"} className={data.compliant ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/20" : "bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/20"}>
                                {data.compliant ? "Conforme" : "Défaillant"}
                            </Badge>
                        )}

                        {!data.error && data.score !== undefined && (
                            <div className={`font-bold text-lg ${data.score >= 80 ? "text-green-400" : data.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                                {data.score}/100
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {data.error ? (
                    <div className="p-8 rounded-xl bg-red-500/5 border border-red-500/20 flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-3 rounded-full bg-red-500/10 mb-2">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-red-400">Analyse impossible</h3>
                        <p className="text-zinc-300 max-w-md">
                            Le moteur d'analyse n'a pas pu scanner le site correctement.<br />
                            Vérifiez que le site est accessible.
                        </p>
                        <div className="p-3 rounded-lg bg-black/40 border border-red-500/20 font-mono text-xs text-red-300 mt-2 break-all max-w-full">
                            {data.error}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* CMP */}
                            <div className={`p-4 rounded-xl border ${data.cmp_detected ? "bg-green-500/10 border-green-500/20" : "bg-yellow-500/10 border-yellow-500/20"}`}>
                                <div className="flex items-start gap-3">
                                    {data.cmp_detected ? <CheckCircle2 className="w-5 h-5 text-green-400 mt-1" /> : <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1" />}
                                    <div>
                                        <h4 className="font-semibold text-zinc-100">CMP Détectée</h4>
                                        <p className="text-sm text-zinc-400 mt-1">
                                            {data.cmp_detected ? data.cmp_detected : "Aucune bannière détectée automatiquement."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Violations */}
                            <div className={`p-4 rounded-xl border ${data.violation_count === 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                                <div className="flex items-start gap-3">
                                    {data.violation_count === 0 ? <CheckCircle2 className="w-5 h-5 text-green-400 mt-1" /> : <Ban className="w-5 h-5 text-red-400 mt-1" />}
                                    <div>
                                        <h4 className="font-semibold text-zinc-100">Cookies Critiques</h4>
                                        <p className="text-sm text-zinc-400 mt-1">
                                            {data.violation_count} traceur(s) détecté(s) avant tout clic.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Privacy Policy */}
                            <div className={`p-4 rounded-xl border ${data.privacy_policy_detected ? "bg-green-500/10 border-green-500/20" : "bg-zinc-500/10 border-zinc-500/20"}`}>
                                <div className="flex items-start gap-3">
                                    <FileText className={`w-5 h-5 mt-1 ${data.privacy_policy_detected ? "text-green-400" : "text-zinc-400"}`} />
                                    <div>
                                        <h4 className="font-semibold text-zinc-100">Politique de Confidentialité</h4>
                                        <div className="text-sm text-zinc-400 mt-1">
                                            {data.privacy_policy_detected ? (
                                                data.privacy_policy_url ? (
                                                    <a
                                                        href={data.privacy_policy_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-violet-400 hover:text-violet-300 underline underline-offset-4 flex items-center gap-1 w-fit transition-colors"
                                                    >
                                                        Voir la politique <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ) : "Lien détecté sur la page."
                                            ) : "Lien non trouvé (vérifiez le footer)."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cookies List */}
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                                <CookieIcon className="w-5 h-5 text-violet-400" />
                                Cookies Identifiés ({data.cookies.length})
                            </h3>

                            {data.cookies.length === 0 ? (
                                <div className="p-8 text-center border border-dashed border-zinc-700 rounded-xl">
                                    <p className="text-zinc-400">Aucun cookie détecté avant consentement. C'est excellent !</p>
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                    {data.cookies.map((cookie, idx) => (
                                        <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-2 ${cookie.is_compliant ? "bg-zinc-900/50 border-zinc-800" : "bg-red-500/10 border-red-500/20"}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-full hidden sm:block ${cookie.is_compliant ? "bg-zinc-800" : "bg-red-500/20"}`}>
                                                    <CookieIcon className={`w-4 h-4 ${cookie.is_compliant ? "text-zinc-400" : "text-red-400"}`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-zinc-200">{cookie.name}</p>
                                                    <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                                                        <span>{cookie.domain}</span>
                                                        <span>•</span>
                                                        <span className={cookie.category.includes("Marketing") ? "text-red-400" : ""}>{cookie.category}</span>
                                                        {cookie.is_session && <span>• Session</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={`w-fit ${cookie.is_compliant ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400 bg-red-500/5"}`}>
                                                {cookie.is_compliant ? "Autorisé" : "Violation"}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
