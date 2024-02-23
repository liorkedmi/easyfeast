"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRouter, useSearchParams } from "next/navigation";

import { Checkbox } from "@/components/ui/checkbox";
import { createUrl } from "@/lib/utils";

export default function Filters({ filters }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearchParams = new URLSearchParams(searchParams.toString());
  let currentFilters = "";

  if (urlSearchParams.get("filter")) {
    currentFilters = urlSearchParams.get("filter").split(",");
  }

  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <span className="text-xs tracking-wider underline">Filters By:</span>
      <div className="flex items-center justify-center gap-1">
        <ToggleGroup
          type="multiple"
          size="sm"
          variant="outline"
          defaultValue={currentFilters}
          onValueChange={(value) => {
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set("filter", value.join(","));
            router.push(createUrl(document.location.pathname, newParams));
          }}
        >
          {filters.map((filter) => (
            <ToggleGroupItem
              key={`filter-${filter}`}
              value={filter}
              aria-label={`Toggle ${filter}`}
            >
              <span className="text-xs tracking-wider">{filter}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
