"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Crown, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuotaReachedDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function QuotaReachedDialog({ open, onOpenChange }: QuotaReachedDialogProps) {
    const router = useRouter();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800">
                <DialogHeader className="flex flex-col items-center text-center space-y-4 pt-4">
                    <div className="p-3 rounded-full bg-violet-500/10 border border-violet-500/20">
                        <Crown className="w-8 h-8 text-violet-400" />
                    </div>
                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-bold text-white">
                            Limite quotidienne atteinte
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Vous avez atteint votre quota de scans quotidiens pour le plan Starter.
                            Passez au plan Pro pour débloquer plus d'analyses et des fonctionnalités avancées.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 my-4 space-y-3">
                    <h4 className="text-sm font-medium text-zinc-300">Inclus dans le plan Pro :</h4>
                    <ul className="space-y-2 text-sm text-zinc-400">
                        <li className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400" />
                            <span>50 scans par jour</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-emerald-400" />
                            <span>Export PDF détaillé</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-400" />
                            <span>Historique de 30 jours</span>
                        </li>
                    </ul>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto text-zinc-400 hover:text-white">
                        Annuler
                    </Button>
                    <Button
                        onClick={() => router.push("/pricing")}
                        className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white gap-2"
                    >
                        Changer de plan <ArrowRight className="w-4 h-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
