
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { analyzeUrl, saveAudit, getAudits } from "@/lib/api";
import { AnalyzeResponse } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

// --- Hook for Analyzing URL (Mutation) ---
export function useAnalyze() {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    return useMutation({
        mutationFn: async ({ url, lang, competitorUrl }: { url: string, lang: string, competitorUrl?: string }) => {
            return await analyzeUrl(url, lang, competitorUrl);
        },
        onSuccess: () => {
            if (isAuthenticated) {
                queryClient.invalidateQueries({ queryKey: ['history'] });
            }
        }
    });
}

// --- Hook for Saving History (Mutation) ---
export function useSaveScan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (scanData: AnalyzeResponse) => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            return await saveAudit(scanData, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['history'] });
        }
    });
}

// --- Hook for Getting History (Query) ---
export function useHistory() {
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['history'],
        queryFn: async () => {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error("No token");
            return await getAudits(token);
        },
        enabled: isAuthenticated,
    });
}
