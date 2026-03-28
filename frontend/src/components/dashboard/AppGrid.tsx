import type { AppStatus } from "@/types/app";
import { CategorySection } from "./CategorySection";

interface AppGridProps {
  apps: AppStatus[];
  categories: string[];
  selectedCategory: string | null;
  searchQuery: string;
  onAppClick: (appId: string) => void;
}

export function AppGrid({
  apps,
  categories,
  selectedCategory,
  searchQuery,
  onAppClick,
}: AppGridProps) {
  const filtered = apps.filter((app) => {
    if (selectedCategory && app.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        app.name.toLowerCase().includes(q) ||
        app.tags.some((t) => t.toLowerCase().includes(q)) ||
        app.app_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const groupedByCategory = categories
    .map((cat) => ({
      category: cat,
      apps: filtered.filter((a) => a.category === cat),
    }))
    .filter((group) => group.apps.length > 0);

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-grv-fg3">
        No apps found
      </div>
    );
  }

  return (
    <div className="p-6">
      {groupedByCategory.map((group) => (
        <CategorySection
          key={group.category}
          category={group.category}
          apps={group.apps}
          onAppClick={onAppClick}
        />
      ))}
    </div>
  );
}
