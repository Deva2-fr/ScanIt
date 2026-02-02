/**
 * API Client for SiteAuditor Backend
 */
import { AnalyzeRequest, AnalyzeResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "ApiError";
    }
}

/**
 * Analyze a URL using the SiteAuditor API
 */
export async function analyzeUrl(url: string, lang: string = "en", competitorUrl?: string): Promise<AnalyzeResponse> {
    const request: AnalyzeRequest = {
        url,
        lang,
        ...(competitorUrl && { competitor_url: competitorUrl })
    };

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new ApiError(response.status, error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * Health check for the API
 */
export async function healthCheck(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        return response.ok;
    } catch {
        return false;
    }
}

export { ApiError };
