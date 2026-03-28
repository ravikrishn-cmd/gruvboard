import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SidebarProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Sidebar({
  categories,
  selectedCategory,
  onCategorySelect,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  return (
    <aside className="w-56 border-r border-grv-bg2 bg-grv-bg1 flex flex-col p-4 gap-4 shrink-0">
      <div>
        <Input
          type="text"
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-grv-bg border-grv-bg2 text-grv-fg placeholder:text-grv-fg3 text-sm"
        />
      </div>
      <nav className="flex flex-col gap-1">
        <button
          onClick={() => onCategorySelect(null)}
          className={cn(
            "text-left px-3 py-1.5 rounded text-sm transition-colors",
            selectedCategory === null
              ? "bg-grv-bg2 text-grv-fg"
              : "text-grv-fg2 hover:bg-grv-bg2 hover:text-grv-fg"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategorySelect(cat)}
            className={cn(
              "text-left px-3 py-1.5 rounded text-sm transition-colors",
              selectedCategory === cat
                ? "bg-grv-bg2 text-grv-fg"
                : "text-grv-fg2 hover:bg-grv-bg2 hover:text-grv-fg"
            )}
          >
            {cat}
          </button>
        ))}
      </nav>
    </aside>
  );
}
