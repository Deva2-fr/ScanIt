"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";

interface RestrictedAccessProps {
    feature: string;
}

export function RestrictedAccess({ feature }: RestrictedAccessProps) {
    // We could use translation hooks here
    return (
        <Card className="border-dashed border-zinc-800 bg-zinc-900/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 mb-4">
                    <Lock className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-200 mb-2">
                    {feature} non disponible
                </h3>
                <p className="text-zinc-500 max-w-md mb-6">
                    Cette analyse détaillée n'est pas incluse dans votre plan actuel.
                    Passez au plan supérieur pour débloquer toutes les fonctionnalités.
                </p>
                <Button variant="default" className="bg-violet-600 hover:bg-violet-700 text-white">
                    Changer de plan
                </Button>
            </CardContent>
        </Card>
    );
}
