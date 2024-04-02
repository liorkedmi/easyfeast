"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { createUrl } from "@/lib/utils";

export default function Filters({ filters }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearchParams = new URLSearchParams(searchParams.toString());
  const [currentFilters, setCurrentFilters] = useState("");

  useEffect(() => {
    if (urlSearchParams.get("filter")) {
      setCurrentFilters(urlSearchParams.get("filter").split(","));
    }
  }, []);

  const resetFilters = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("filter", "");
    router.push(createUrl(document.location.pathname, newParams));
    setCurrentFilters("");
  };

  if (filters.length === 0) {
    return null;
  }

  return (
    // <div className="flex items-center justify-center gap-4">
    //   <span className="shrink-0 text-sm tracking-wider underline">
    //     Filters By:
    //   </span>
    //   <div className="flex items-center justify-center gap-1">
    //   </div>
    // </div>
    <>
      <ScrollArea className="w-full whitespace-nowrap">
        <ToggleGroup
          type="multiple"
          size="sm"
          variant="outline"
          value={currentFilters}
          onValueChange={(value) => {
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set("filter", value);
            router.push(createUrl(document.location.pathname, newParams));
            setCurrentFilters(value);
          }}
        >
          {filters.map((filter) => (
            <ToggleGroupItem
              key={`filter-${filter}`}
              value={filter}
              aria-label={`Toggle ${filter}`}
            >
              <span className="text-sm tracking-wider">{filter}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Button variant="ghost" size="sm" onClick={() => resetFilters()}>
        <Trash2 className="h-4 w-4 mr-1" />
        <span className="text-sm tracking-wider">Reset</span>
      </Button>
    </>
  );
}
