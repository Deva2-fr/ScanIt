/**
 * API Client for SiteAuditor Backend
 */
import { AnalyzeRequest, AnalyzeResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "ApiError";
    }
}

/**
 * Analyze a URL using the SiteAuditor API
 */
// Async Polling Configuration
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_ATTEMPTS = 60; // 2 minutes timeout

/**
 * Start an async analysis and poll for results
 */
function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
}

export async function analyzeUrl(url: string, lang: string = "en", competitorUrl?: string): Promise<AnalyzeResponse> {
    const request: AnalyzeRequest = {
        url,
        lang,
        ...(competitorUrl && { competitor_url: competitorUrl })
    };
    const headers = getAuthHeaders();
    const startResponse = await fetch(`${API_BASE_URL}/api/analyze/async`, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
    });

    if (!startResponse.ok) {
        // Fallback to sync endpoint if async fails (e.g. old backend)
        if (startResponse.status === 404) {
            return analyzeUrlSync(request);
        }
        const error = await startResponse.json().catch(() => ({ detail: "Failed to start analysis" }));
        throw new ApiError(startResponse.status, error.detail);
    }

    const { task_id } = await startResponse.json();

    // 2. Poll for Results
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL));

        const taskResponse = await fetch(`${API_BASE_URL}/api/tasks/${task_id}`, {
            headers: getAuthHeaders(),
        });

        if (!taskResponse.ok) continue; // Retry on transient network errors

        const task = await taskResponse.json();

        if (task.status === "completed" && task.result) {
            return task.result as AnalyzeResponse;
        }

        if (task.status === "failed") {
            throw new ApiError(500, task.error || "Analysis failed during background processing");
        }

        // If pending or running, continue loop
    }

    throw new ApiError(408, "Analysis timed out (background task took too long)");
}

/**
 * Legacy Synchronous Analysis (Fallback)
 */
async function analyzeUrlSync(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers: getAuthHeaders(),
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

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(priceId: string, token: string): Promise<{ url: string }> {
    const response = await fetch(`${API_BASE_URL}/api/billing/checkout?price_id=${priceId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Checkout failed" }));
        throw new ApiError(response.status, error.detail);
    }

    return response.json();
}

/**
 * Create a Stripe Customer Portal Session
 */
export async function createPortalSession(token: string): Promise<{ url: string }> {
    const response = await fetch(`${API_BASE_URL}/api/billing/portal`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Portal failed" }));
        throw new ApiError(response.status, error.detail);
    }

    return response.json();
}

// Subscription Simulation
export async function simulateUpgrade(plan: "pro" | "agency", token: string): Promise<any> {
    const priceId = plan === "agency" ? "price_agency_monthly" : "price_pro_monthly";
    return createCheckoutSession(priceId, token);
}

export async function cancelSubscription(token: string): Promise<any> {
    return createCheckoutSession("free", token);
}

export { ApiError };
