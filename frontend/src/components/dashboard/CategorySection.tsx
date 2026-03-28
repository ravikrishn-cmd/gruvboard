import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { AppStatus } from "@/types/app";
import { AppCard } from "./AppCard";

interface CategorySectionProps {
  category: string;
  apps: AppStatus[];
  onAppClick: (appId: string) => void;
}

export function CategorySection({ category, apps, onAppClick }: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="mb-6">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 mb-3 text-sm font-medium text-grv-fg2 hover:text-grv-fg transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        <span>{category}</span>
        <span className="text-xs text-grv-fg3">({apps.length})</span>
      </button>
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {apps.map((app) => (
            <AppCard key={app.app_id} app={app} onClick={() => onAppClick(app.app_id)} />
          ))}
        </div>
      )}
    </section>
  );
}
