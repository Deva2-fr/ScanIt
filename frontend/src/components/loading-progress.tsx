"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisStep } from "@/types";

interface LoadingProgressProps {
    steps: AnalysisStep[];
    className?: string;
}

export function LoadingProgress({ steps, className }: LoadingProgressProps) {
    const [currentStep, setCurrentStep] = useState(0);

    // Simulate progress through steps
    useEffect(() => {
        const runningIndex = steps.findIndex((s) => s.status === "running");
        if (runningIndex !== -1) {
            setCurrentStep(runningIndex);
        } else {
            const completedCount = steps.filter((s) => s.status === "completed").length;
            setCurrentStep(completedCount);
        }
    }, [steps]);

    const progress = (steps.filter((s) => s.status === "completed").length / steps.length) * 100;

    return (
        <div className={cn("w-full max-w-xl mx-auto", className)}>
            {/* Progress bar */}
            <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-8">
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
                {/* Shimmer effect */}
                <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                    style={{
                        backgroundSize: "200% 100%",
                        animation: "shimmer 2s infinite linear"
                    }}
                />
            </div>

            {/* Steps list */}
            <div className="space-y-3">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className={cn(
                            "flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                            step.status === "running" && "bg-zinc-800/50 border border-violet-500/30",
                            step.status === "completed" && "opacity-60",
                            step.status === "pending" && "opacity-40"
                        )}
                    >
                        {/* Status icon */}
                        <div
                            className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                                step.status === "pending" && "bg-zinc-800 text-zinc-500",
                                step.status === "running" && "bg-violet-500/20 text-violet-400",
                                step.status === "completed" && "bg-emerald-500/20 text-emerald-400",
                                step.status === "error" && "bg-red-500/20 text-red-400"
                            )}
                        >
                            {step.status === "pending" && (
                                <span className="text-sm font-medium">{index + 1}</span>
                            )}
                            {step.status === "running" && (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            )}
                            {step.status === "completed" && (
                                <Check className="w-5 h-5" />
                            )}
                            {step.status === "error" && (
                                <AlertCircle className="w-5 h-5" />
                            )}
                        </div>

                        {/* Label */}
                        <div className="flex-1">
                            <p
                                className={cn(
                                    "font-medium transition-colors duration-300",
                                    step.status === "running" && "text-white",
                                    step.status === "completed" && "text-zinc-400",
                                    step.status === "pending" && "text-zinc-500",
                                    step.status === "error" && "text-red-400"
                                )}
                            >
                                {step.label}
                            </p>
                            {step.status === "running" && (
                                <p className="text-sm text-zinc-500 mt-0.5">Processing...</p>
                            )}
                        </div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "absolute left-[2.25rem] h-3 w-0.5 translate-y-[2.75rem]",
                                    step.status === "completed" ? "bg-emerald-500/30" : "bg-zinc-800"
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Add shimmer animation to globals
const shimmerStyle = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;

if (typeof document !== "undefined") {
    const style = document.createElement("style");
    style.textContent = shimmerStyle;
    document.head.appendChild(style);
}
