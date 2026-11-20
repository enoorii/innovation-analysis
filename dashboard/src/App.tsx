import { ChatProvider } from "@/chat/chat-dock";
import { AppShell } from "@/components/layout/shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import AnalysisDlmPage from "@/pages/analysis-dlm";
import AnalysisGiiPage from "@/pages/analysis-gii";
import AnalysisVifPage from "@/pages/analysis-vif";
import MethodologyPage from "@/pages/methodology";
import MetricPage from "@/pages/metric";
import NotFoundPage from "@/pages/not-found";
import OverviewPage from "@/pages/overview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="innovation-atlas-theme"
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ChatProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<AppShell />}>
                  <Route index element={<OverviewPage />} />
                  <Route
                    path="metrics"
                    element={<Navigate to="/metrics/hitech-exports" replace />}
                  />
                  <Route path="metrics/:metricId" element={<MetricPage />} />
                  <Route path="analysis/vif" element={<AnalysisVifPage />} />
                  <Route path="analysis/dlm" element={<AnalysisDlmPage />} />
                  <Route path="analysis/gii" element={<AnalysisGiiPage />} />
                  <Route path="methodology" element={<MethodologyPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ChatProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
