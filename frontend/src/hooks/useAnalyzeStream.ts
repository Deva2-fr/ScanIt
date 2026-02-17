import { useState, useCallback } from "react";
import { AnalyzeResponse } from "@/types";
import { ApiError } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface StreamLog {
    type: "log";
    step: string;
    message: string;
}

interface StreamResult {
    type: "complete";
    data: AnalyzeResponse;
}

interface StreamError {
    type: "error";
    message: string;
}

type StreamMessage = StreamLog | StreamResult | StreamError;

interface UseAnalyzeStreamReturn {
    analyzeUrlStream: (url: string, lang?: string, competitorUrl?: string) => Promise<AnalyzeResponse>;
    logs: string[];
    currentStep: string | null;
}

export function useAnalyzeStream(): UseAnalyzeStreamReturn {
    const [logs, setLogs] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState<string | null>(null);

    const analyzeUrlStream = useCallback(async (url: string, lang: string = "en", competitorUrl?: string): Promise<AnalyzeResponse> => {
        setLogs([]);
        setCurrentStep("init");

        // BATTLE MODE & STANDARD MODE: Use /api/stream
        const params = new URLSearchParams({ url, lang });
        if (competitorUrl) {
            params.append("competitor_url", competitorUrl);
        }

        const endpoint = `${API_BASE_URL}/api/stream?${params.toString()}`;
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
        try {
            const response = await fetch(endpoint, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!response.ok) {
                const errText = await response.text();
                // Try to parse JSON error message if possible
                let errorDetails = errText;
                try {
                    const jsonError = JSON.parse(errText);
                    if (jsonError.detail) errorDetails = jsonError.detail;
                } catch (e) { /* ignore */ }

                throw new ApiError(response.status, errorDetails);
            }

            if (!response.body) throw new Error("ReadableStream not supported by browser.");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let finalResult: AnalyzeResponse | null = null;
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");

                // Keep the last incomplete line in the buffer
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (!line.trim()) continue;

                    let msg: StreamMessage | null = null;
                    try {
                        msg = JSON.parse(line) as StreamMessage;
                    } catch (e) {
                        console.warn("Failed to parse stream line:", line, e);
                        continue;
                    }

                    if (msg) {
                        if (msg.type === "log") {
                            setLogs(prev => [...prev, msg.message]);
                            setCurrentStep(msg.step);
                        } else if (msg.type === "complete") {
                            finalResult = msg.data;
                        } else if (msg.type === "error") {
                            throw new Error(msg.message);
                        }
                    }
                }
            }

            if (!finalResult) throw new Error("Stream ended without result.");
            return finalResult;

        } catch (error) {
            console.error("Stream Error:", error);
            throw error;
        }
    }, []);

    return { analyzeUrlStream, logs, currentStep };
}
