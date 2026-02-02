import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SMOResult } from "@/types/api";
import { Share2, AlertTriangle, CheckCircle2, Image as ImageIcon, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SmoSectionProps {
    data: SMOResult;
}

export function SmoSection({ data }: SmoSectionProps) {
    if (!data) return null;

    return (
        <Card className="border-blue-500/20 bg-black/40 backdrop-blur-xl overflow-hidden mb-6">
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Share2 className="w-6 h-6 text-blue-400" />
                            Aperçu Réseaux Sociaux (SMO)
                        </CardTitle>
                        <CardDescription>
                            Simulation de l'apparence de votre lien sur les plateformes sociales.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${data.score >= 80 ? "text-green-400" : data.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                            {data.score}/100
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Diagnostics */}
                {data.missing_tags.length > 0 || data.image_status !== "valid" ? (
                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <h4 className="font-semibold text-orange-400 flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            Points d'amélioration détectés
                        </h4>
                        <ul className="space-y-1 text-sm text-zinc-300">
                            {data.image_status === "missing" && (
                                <li className="flex items-center gap-2">❌ Aucune image de prévisualisation (og:image) trouvée.</li>
                            )}
                            {data.image_status === "broken" && (
                                <li className="flex items-center gap-2">❌ L'image détectée renvoie une erreur 404 (Lien cassé).</li>
                            )}
                            {data.missing_tags.map(tag => (
                                <li key={tag} className="flex items-center gap-2">⚠️ Balise manquante : <code className="bg-black/30 px-1 rounded text-orange-300">{tag}</code></li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="w-5 h-5" />
                        Excellente configuration SMO ! Toutes les métadonnées essentielles sont présentes.
                    </div>
                )}

                <Tabs defaultValue="linkedin" className="w-full">
                    <TabsList className="bg-zinc-900 border border-zinc-800">
                        <TabsTrigger value="linkedin" className="data-[state=active]:bg-[#0077b5] data-[state=active]:text-white">LinkedIn</TabsTrigger>
                        <TabsTrigger value="twitter" className="data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-zinc-700">X (Twitter)</TabsTrigger>
                        <TabsTrigger value="facebook" className="data-[state=active]:bg-[#1877F2] data-[state=active]:text-white">Facebook</TabsTrigger>
                    </TabsList>

                    <div className="mt-6 flex justify-center bg-zinc-900/50 p-8 rounded-xl border border-zinc-800/50">
                        {/* LinkedIn Preview */}
                        <TabsContent value="linkedin" className="w-full max-w-[500px]">
                            <div className="bg-white rounded-lg overflow-hidden border border-gray-300 shadow-sm font-sans">
                                <div className="h-[260px] bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                    {data.image ? (
                                        <img src={data.image} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400">
                                            <ImageIcon className="w-12 h-12 mb-2" />
                                            <span className="text-sm">Pas d'image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-[#eef3f8]">
                                    <div className="text-sm font-semibold text-[#000000e6] truncate leading-tight">
                                        {data.title || "Titre de la page manquant"}
                                    </div>
                                    <div className="text-xs text-[#00000099] mt-1 truncate">
                                        {new URL(data.url || "https://example.com").hostname}
                                    </div>
                                </div>
                            </div>
                            <div className="text-center mt-4 text-xs text-zinc-500">
                                Aperçu approximatif LinkedIn Desktop
                            </div>
                        </TabsContent>

                        {/* Twitter Preview */}
                        <TabsContent value="twitter" className="w-full max-w-[500px]">
                            <div className="bg-black rounded-xl overflow-hidden border border-zinc-800 font-sans">
                                <div className="h-[260px] bg-zinc-900 relative overflow-hidden flex items-center justify-center">
                                    {data.twitter_image || data.image ? (
                                        <img src={data.twitter_image || data.image || ""} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-zinc-600">
                                            <ImageIcon className="w-12 h-12 mb-2" />
                                            <span className="text-sm">Pas d'image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <div className="text-zinc-500 text-[13px] uppercase mb-0.5">
                                        {new URL(data.url || "https://example.com").hostname}
                                    </div>
                                    <div className="text-white text-[15px] leading-5 font-normal truncate">
                                        {data.twitter_title || data.title || "Titre manquant"}
                                    </div>
                                    <div className="text-zinc-500 text-[15px] mt-0.5 leading-5 line-clamp-2">
                                        {data.twitter_description || data.description || "Description manquante"}
                                    </div>
                                </div>
                            </div>
                            <div className="text-center mt-4 text-xs text-zinc-500">
                                Aperçu approximatif X (Twitter) Large Card
                            </div>
                        </TabsContent>

                        {/* Facebook Preview */}
                        <TabsContent value="facebook" className="w-full max-w-[500px]">
                            <div className="bg-[#1c1e21] rounded-lg overflow-hidden border border-zinc-700 font-sans">
                                <div className="h-[260px] bg-black relative overflow-hidden flex items-center justify-center">
                                    {data.image ? (
                                        <img src={data.image} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-zinc-600">
                                            <ImageIcon className="w-12 h-12 mb-2" />
                                            <span className="text-sm">Pas d'image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-[#242526]">
                                    <div className="text-[#b0b3b8] text-[13px] uppercase mb-0.5 truncate">
                                        {new URL(data.url || "https://example.com").hostname}
                                    </div>
                                    <div className="text-[#e4e6eb] text-[16px] font-semibold leading-5 truncate mb-1">
                                        {data.title || "Titre manquant"}
                                    </div>
                                    <div className="text-[#b0b3b8] text-[14px] leading-5 line-clamp-1">
                                        {data.description || "Description manquante"}
                                    </div>
                                </div>
                            </div>
                            <div className="text-center mt-4 text-xs text-zinc-500">
                                Aperçu approximatif Facebook Dark Mode
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                {data.image_status === "valid" && (
                    <div className="grid grid-cols-2 gap-4 text-sm text-zinc-400">
                        <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800">
                            <span className="block text-zinc-500 text-xs uppercase mb-1">Titre Utilisé</span>
                            <span className="text-zinc-200">{data.title}</span>
                        </div>
                        <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800">
                            <span className="block text-zinc-500 text-xs uppercase mb-1">Description Utilisée</span>
                            <span className="text-zinc-200 line-clamp-2">{data.description}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
