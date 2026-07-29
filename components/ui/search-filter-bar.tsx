import React from "react";
import { Search, Filter, RefreshCw } from "lucide-react";

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status?: string;
  onStatusChange?: (status: string) => void;
  featured?: string;
  onFeaturedChange?: (featured: string) => void;
  onReset?: () => void;
  placeholder?: string;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  status = "",
  onStatusChange,
  featured = "",
  onFeaturedChange,
  onReset,
  placeholder = "Search entities...",
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card">
      <div className="relative w-full sm:w-72">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-background border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        {onStatusChange && (
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs bg-background border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        )}

        {onFeaturedChange && (
          <select
            value={featured}
            onChange={(e) => onFeaturedChange(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs bg-background border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Categories</option>
            <option value="true">Featured Only</option>
            <option value="false">Non-Featured</option>
          </select>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
