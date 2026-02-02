import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DNSHealthResult } from "@/types/api";
import { AtSign, ShieldAlert, ShieldCheck, ShieldQuestion, Server, AlertTriangle } from "lucide-react";

interface DnsSectionProps {
    data: DNSHealthResult;
}

export function DnsSection({ data }: DnsSectionProps) {
    if (!data) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "valid": return "bg-green-500/5 text-green-400 border-green-500/20";
            case "warning": return "bg-yellow-500/5 text-yellow-500 border-yellow-500/20";
            case "critical": return "bg-red-500/5 text-red-400 border-red-500/20";
            default: return "bg-zinc-800/10 text-zinc-500 border-zinc-800";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "valid": return <ShieldCheck className="w-5 h-5 text-green-400" />;
            case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case "critical": return <ShieldAlert className="w-5 h-5 text-red-500" />;
            default: return <ShieldQuestion className="w-5 h-5 text-zinc-500" />;
        }
    };

    return (
        <Card className="border-indigo-500/20 bg-black/40 backdrop-blur-xl overflow-hidden mb-6">
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <AtSign className="w-6 h-6 text-indigo-400" />
                            Santé DNS & Délivrabilité Email
                        </CardTitle>
                        <CardDescription>
                            Vérification des protocoles de sécurité (SPF, DMARC) pour éviter le SPAM.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${data.score >= 80 ? "text-green-400" : data.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                            {data.score}/100
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">

                {data.domain && (
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2 pl-1">
                        <Server className="w-4 h-4" />
                        <span>Domaine : <strong className="text-zinc-300">{data.domain}</strong></span>
                        {data.server_ip && <span>({data.server_ip})</span>}
                    </div>
                )}

                {/* SPF Card */}
                <div className={`p-5 rounded-xl border ${getStatusColor(data.spf.status)}`}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {getStatusIcon(data.spf.status)}
                            <div>
                                <h3 className="font-bold text-lg">Protocole SPF</h3>
                                <p className="text-sm opacity-80">Sender Policy Framework</p>
                            </div>
                        </div>
                        <Badge variant="outline" className={`uppercase ${data.spf.status === 'valid' ? 'border-green-500 text-green-400' : 'border-current'}`}>
                            {data.spf.status}
                        </Badge>
                    </div>

                    {data.spf.record ? (
                        <div className="bg-black/30 p-3 rounded font-mono text-xs overflow-x-auto text-zinc-300 mb-4 border border-zinc-700/50 shadow-inner">
                            {data.spf.record}
                        </div>
                    ) : (
                        <div className="text-sm italic opacity-70 mb-4">Aucun enregistrement SPF trouvé.</div>
                    )}

                    {data.spf.warnings.length > 0 && (
                        <div className="space-y-2 mt-2">
                            {data.spf.warnings.map((w, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm font-medium">
                                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{w}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* DMARC Card */}
                <div className={`p-5 rounded-xl border ${getStatusColor(data.dmarc.status)}`}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {getStatusIcon(data.dmarc.status)}
                            <div>
                                <h3 className="font-bold text-lg">Protocole DMARC</h3>
                                <p className="text-sm opacity-80">Domain-based Message Authentication</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {data.dmarc.policy && (
                                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                                    p={data.dmarc.policy}
                                </Badge>
                            )}
                            <Badge variant="outline" className={`uppercase ${data.dmarc.status === 'valid' ? 'border-green-500 text-green-400' : 'border-current'}`}>
                                {data.dmarc.status}
                            </Badge>
                        </div>
                    </div>

                    {data.dmarc.record ? (
                        <div className="bg-black/30 p-3 rounded font-mono text-xs overflow-x-auto text-zinc-300 mb-4 border border-zinc-700/50 shadow-inner">
                            {data.dmarc.record}
                        </div>
                    ) : (
                        <div className="text-sm italic opacity-70 mb-4">Aucun enregistrement DMARC trouvé.</div>
                    )}

                    {/* Explanation */}
                    <div className="text-sm opacity-80 mt-2">
                        {data.dmarc.status === 'missing' && "DMARC est essentiel pour empêcher les pirates d'utiliser votre domaine pour envoyer des emails."}
                        {data.dmarc.policy === 'none' && "La politique 'p=none' permet de surveiller le trafic mais ne bloque pas les emails frauduleux."}
                        {(data.dmarc.policy === 'reject' || data.dmarc.policy === 'quarantine') && "Votre politique DMARC protège activement votre domaine."}
                    </div>
                </div>
                {/* DKIM Card (Info) */}
                <div className={`p-5 rounded-xl border bg-zinc-800/20 border-zinc-700/50`}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {data.dkim?.status === "found" ?
                                <ShieldCheck className="w-5 h-5 text-green-400" /> :
                                <ShieldQuestion className="w-5 h-5 text-blue-400" />
                            }
                            <div>
                                <h3 className="font-bold text-lg text-zinc-200">Protocole DKIM</h3>
                                <p className="text-sm text-zinc-400">DomainKeys Identified Mail</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                            {data.dkim?.status === "found" ? "DETECTED" : "MANUAL CHECK"}
                        </Badge>
                    </div>

                    <div className="text-sm text-zinc-400">
                        {data.dkim?.note || "La vérification DKIM nécessite des sélecteurs spécifiques. Vérifiez votre fournisseur d'email."}
                    </div>

                    {data.dkim?.status === "found" && (
                        <div className="mt-2 text-xs text-green-400 font-mono">
                            Sélecteurs trouvés : {data.dkim.selectors_found.join(", ")}
                        </div>
                    )}
                </div>

                {/* Educational Section */}
                <div className="mt-6 pt-6 border-t border-zinc-800">
                    <h4 className="text-zinc-400 font-semibold mb-3 flex items-center gap-2">
                        <ShieldQuestion className="w-4 h-4" />
                        Comprendre ces résultats
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-zinc-500">
                        <div>
                            <strong className="block text-zinc-300 mb-1">C'est quoi SPF ?</strong>
                            Une liste blanche des serveurs autorisés à envoyer des emails pour vous. Sans SPF, n'importe qui peut se faire passer pour vous.
                        </div>
                        <div>
                            <strong className="block text-zinc-300 mb-1">C'est quoi DKIM ?</strong>
                            Une signature numérique invisible qui prouve que l'email n'a pas été modifié en cours de route. C'est comme un sceau de cire sur une enveloppe.
                        </div>
                        <div>
                            <strong className="block text-zinc-300 mb-1">C'est quoi DMARC ?</strong>
                            Le chef d'orchestre. Il dit aux boîtes mails (Gmail, Yahoo) quoi faire si SPF ou DKIM échouent : rejeter l'email ou le mettre en spam.
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-300 flex gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div>
                            <strong className="font-semibold text-indigo-200">Quel rapport avec mon site Web ?</strong>
                            <div className="mt-1 opacity-90 space-y-2">
                                <p>
                                    1. <strong>Si votre site envoie des emails</strong> (contact, inscription) : Sans ces sécurités, ils finiront en SPAM.
                                </p>
                                <p>
                                    2. <strong>Même si vous n'en n'envoyez pas</strong> : C'est encore plus important ! Vous devez dire au monde entier "Mon domaine n'envoie jamais d'emails".
                                    Sinon, un pirate peut usurper votre identité (`admin@votre-site.com`) pour arnaquer des gens, ce qui fera blacklister votre nom de domaine par Google.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
