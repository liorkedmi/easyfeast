"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@workspace/ui/components/badge";
import { X } from "lucide-react";

interface FilterOption {
  id: string;
  name: string;
}

interface FilterSummaryBarProps {
  filterOptions: {
    [key: string]: FilterOption[];
  };
  resultCount: number;
}

export function FilterSummaryBar({
  filterOptions,
  resultCount,
}: FilterSummaryBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Collect all selected filters
  const selected: { key: string; id: string; name: string }[] = [];
  Object.entries(filterOptions).forEach(([key, options]) => {
    const selectedIds = searchParams.get(key)?.split(",") || [];
    options.forEach((opt) => {
      if (selectedIds.includes(opt.id)) {
        selected.push({ key, id: opt.id, name: opt.name });
      }
    });
  });

  if (selected.length === 0) {
    return (
      <div className="flex justify-end mb-4 min-w-[100px] text-right">
        <span className="text-sm text-gray-600">{resultCount} Results</span>
      </div>
    );
  }

  // Remove a filter and update the URL
  const removeFilter = (key: string, id: string) => {
    const params = new URLSearchParams(searchParams);
    const ids = (params.get(key)?.split(",") || []).filter((v) => v !== id);
    if (ids.length > 0) {
      params.set(key, ids.join(","));
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams);
    Object.keys(filterOptions).forEach((key) => {
      params.delete(key);
    });
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex justify-between items-start mb-4">
      <div className="flex flex-wrap gap-2">
        {selected.map(({ key, id, name }) => (
          <Badge
            key={key + id}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {name}
            <button
              type="button"
              className="ml-1"
              onClick={() => removeFilter(key, id)}
              aria-label={`Remove ${name}`}
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="grow" />
      <span className="text-sm text-gray-600 min-w-[100px] text-right">
        {resultCount} Results
      </span>
    </div>
  );
}
