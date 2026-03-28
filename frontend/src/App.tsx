import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { SystemBar } from "@/components/layout/SystemBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppGrid } from "@/components/dashboard/AppGrid";
import { AppDrawer } from "@/components/drilldown/AppDrawer";
import { useApps } from "@/hooks/useApps";
import { useSystemMetrics } from "@/hooks/useSystemMetrics";
import { useEventStream } from "@/lib/sse";
import type { SSEHealthUpdate, SSEMetricsUpdate, SSEServiceStateChange } from "@/types/events";

export default function App() {
  const { config, apps, loading, error, handleHealthUpdate, handleServiceStateChange } = useApps();
  const { metrics, handleSSEUpdate } = useSystemMetrics();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerAppId, setDrawerAppId] = useState<string | null>(null);

  // SSE event handlers
  useEventStream({
    health_update: (data) => handleHealthUpdate(data as SSEHealthUpdate),
    metrics_update: (data) => handleSSEUpdate(data as SSEMetricsUpdate),
    service_state_change: (data) => handleServiceStateChange(data as SSEServiceStateChange),
  });

  const drawerApp = apps.find((a) => a.app_id === drawerAppId) ?? null;
  const drawerAppConfig = config?.apps.find((a) => a.id === drawerAppId) ?? null;

  const handleCloseDrawer = useCallback(() => setDrawerAppId(null), []);

  if (loading) {
    return (
      <div className="h-screen bg-grv-bg flex items-center justify-center">
        <div className="text-grv-fg2 text-lg">Loading GruvBoard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-grv-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-grv-red text-lg mb-2">Failed to load dashboard</p>
          <p className="text-grv-fg3 text-sm font-mono">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-grv-bg flex flex-col overflow-hidden">
      <SystemBar metrics={metrics} />
      <Header title={config?.title ?? "GruvBoard"} metrics={metrics} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          categories={config?.categories ?? []}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="flex-1 overflow-y-auto">
          <AppGrid
            apps={apps}
            categories={config?.categories ?? []}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onAppClick={setDrawerAppId}
          />
        </main>
      </div>

      <AppDrawer
        app={drawerApp}
        appConfig={drawerAppConfig}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
