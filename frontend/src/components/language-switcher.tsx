"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { useLanguage, Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const languages: { code: Language; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
];

interface LanguageSwitcherProps {
    variant?: "default" | "minimal";
    className?: string;
}

export function LanguageSwitcher({ variant = "default", className }: LanguageSwitcherProps) {
    const { language, setLanguage } = useLanguage();

    const currentLang = languages.find((l) => l.code === language);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size={variant === "minimal" ? "sm" : "default"}
                    className={cn(
                        "gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all",
                        variant === "minimal" && "h-8 px-2",
                        className
                    )}
                >
                    <Globe className="w-4 h-4" />
                    {variant === "default" && (
                        <>
                            <span className="text-lg">{currentLang?.flag}</span>
                            <span className="hidden sm:inline">{currentLang?.label}</span>
                        </>
                    )}
                    {variant === "minimal" && (
                        <span className="text-lg">{currentLang?.flag}</span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="bg-zinc-900 border-zinc-800 min-w-[140px]"
            >
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={cn(
                            "flex items-center justify-between gap-3 cursor-pointer",
                            "hover:bg-zinc-800 focus:bg-zinc-800",
                            language === lang.code && "bg-zinc-800/50"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{lang.flag}</span>
                            <span className="text-zinc-200">{lang.label}</span>
                        </div>
                        {language === lang.code && (
                            <Check className="w-4 h-4 text-violet-400" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
