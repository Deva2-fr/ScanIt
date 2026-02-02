"use client";

import { useState, useCallback, useEffect } from "react";
import { SearchBar } from "@/components/search-bar";
import { LoadingProgress } from "@/components/loading-progress";
import { Dashboard } from "@/components/dashboard";
import { AuthHeader } from "@/components/auth-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { analyzeUrl, healthCheck, ApiError } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { AnalyzeResponse, AnalysisStep } from "@/types";
import { AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type AppState = "idle" | "loading" | "results" | "error";

export default function Home() {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [state, setState] = useState<AppState>("idle");
  const [steps, setSteps] = useState<AnalysisStep[]>([]);
  const [results, setResults] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApiHealthy, setIsApiHealthy] = useState<boolean | null>(null);

  // Initialize steps with translations
  const getInitialSteps = useCallback((): AnalysisStep[] => [
    { id: "seo", label: t.steps.seo, status: "pending" },
    { id: "security", label: t.steps.security, status: "pending" },
    { id: "tech", label: t.steps.tech, status: "pending" },
    { id: "links", label: t.steps.links, status: "pending" },
  ], [t]);

  // Update steps when language changes
  useEffect(() => {
    if (state === "idle" || state === "error") {
      setSteps(getInitialSteps());
    }
  }, [t, state, getInitialSteps]);

  // Check API health on mount
  useEffect(() => {
    healthCheck().then(setIsApiHealthy);
  }, []);

  // Simulate step progression during loading
  useEffect(() => {
    if (state !== "loading") return;

    const stepDelays = [1000, 2500, 4000, 5500];
    const timeouts: NodeJS.Timeout[] = [];

    stepDelays.forEach((delay, index) => {
      const timeout = setTimeout(() => {
        setSteps((prev) =>
          prev.map((step, i) => {
            if (i < index) return { ...step, status: "completed" as const };
            if (i === index) return { ...step, status: "running" as const };
            return step;
          })
        );
      }, delay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [state]);

  const handleSearch = useCallback(async (url: string, competitorUrl?: string) => {
    setState("loading");
    setError(null);
    setSteps(getInitialSteps().map((s) => ({ ...s, status: "pending" })));

    try {
      const data = await analyzeUrl(url, language, competitorUrl);

      // Save to history if authenticated
      console.log("Analysis complete. Authenticated:", isAuthenticated);

      if (isAuthenticated) {
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
          const token = localStorage.getItem('access_token');

          const saveScan = async (scanData: AnalyzeResponse) => {
            console.log("Saving scan to history:", scanData.url);

            const response = await fetch(`${API_BASE_URL}/api/audits/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                url: scanData.url,
                score: scanData.global_score,
                summary: {
                  seo: scanData.seo.scores.seo != null ? Math.round(scanData.seo.scores.seo <= 1 ? scanData.seo.scores.seo * 100 : scanData.seo.scores.seo) : 0,
                  security: Math.round(scanData.security.score),
                  performance: scanData.seo.scores.performance != null ? Math.round(scanData.seo.scores.performance <= 1 ? scanData.seo.scores.performance * 100 : scanData.seo.scores.performance) : 0
                }
              })
            });

            if (response.ok) {
              console.log("Scan saved successfully:", scanData.url);
            } else {
              console.error("Failed to save scan:", await response.text());
            }
          };

          // Save main scan
          await saveScan(data);

          // Save competitor scan if exists
          if (data.competitor) {
            await saveScan(data.competitor);
          }

        } catch (saveError) {
          console.error("Failed to save audit history:", saveError);
          // Don't block the UI, just log the error
        }
      }

      // Mark all steps as completed
      setSteps((prev) => prev.map((s) => ({ ...s, status: "completed" })));

      // Small delay to show completion
      await new Promise((resolve) => setTimeout(resolve, 500));

      setResults(data);
      setState("results");
    } catch (err) {
      console.error("Analysis error:", err);

      // Mark current step as error
      setSteps((prev) => {
        const runningIndex = prev.findIndex((s) => s.status === "running");
        return prev.map((s, i) =>
          i === runningIndex ? { ...s, status: "error" as const } : s
        );
      });

      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t.home.apiUnavailable);
      }
      setState("error");
    }
  }, [getInitialSteps, t.home.apiUnavailable, language, isAuthenticated]);

  const handleBack = useCallback(() => {
    setState("idle");
    setResults(null);
    setError(null);
    setSteps(getInitialSteps());
  }, [getInitialSteps]);

  const handleRescan = useCallback(() => {
    if (results) {
      handleSearch(results.url);
    }
  }, [results, handleSearch]);

  // Show results dashboard
  if (state === "results" && results) {
    return <Dashboard data={results} onBack={handleBack} onRescan={handleRescan} />;
  }

  // Landing page with search
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <AuthHeader />

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-3xl mx-auto text-center">
          {/* Hero text */}
          {state === "idle" && (
            <div className="mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-violet-300">{t.home.badge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  {t.home.title1}
                </span>
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {t.home.title2}
                </span>
              </h1>

              <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                {t.home.subtitle}
              </p>
            </div>
          )}

          {/* Loading title */}
          {state === "loading" && (
            <div className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                {t.home.analyzingTitle}
              </h2>
              <p className="text-zinc-400">
                {t.home.analyzingSubtitle}
              </p>
            </div>
          )}

          {/* Error title */}
          {state === "error" && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-red-400 mb-2">
                {t.home.analysisFailed}
              </h2>
            </div>
          )}

          {/* Search bar - show in idle or error state */}
          {(state === "idle" || state === "error") && (
            <>
              <SearchBar
                onSearch={handleSearch}
                isLoading={false}
                placeholder={t.home.placeholder}
                buttonText={t.common.analyze}
                helperText={t.home.helperText}
                className="mb-6"
              />

              {/* API Status */}
              {isApiHealthy === false && (
                <Alert variant="destructive" className="max-w-xl mx-auto mt-6 bg-red-500/10 border-red-500/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t.home.apiUnavailable}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error message */}
              {error && (
                <Alert variant="destructive" className="max-w-xl mx-auto mt-6 bg-red-500/10 border-red-500/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Loading progress */}
          {state === "loading" && (
            <LoadingProgress steps={steps} className="mt-8" />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-sm text-zinc-600">
        <p>{t.home.footer}</p>
      </footer>
    </div>
  );
}
