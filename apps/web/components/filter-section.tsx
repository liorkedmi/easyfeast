"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { ChevronDown } from "lucide-react";

interface FilterOption {
  id: string;
  name: string;
}

interface FilterSectionProps {
  proteinTypes: FilterOption[];
  dietaryRestrictions: FilterOption[];
  cuisines: FilterOption[];
}

export function FilterSection({
  proteinTypes,
  dietaryRestrictions,
  cuisines,
}: FilterSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const getSelectedCount = (key: string) => {
    const value = searchParams.get(key);
    return value ? value.split(",").length : 0;
  };

  const getSelectedNames = (key: string, options: FilterOption[]) => {
    const selectedIds = searchParams.get(key)?.split(",") || [];
    if (selectedIds.length === 0) return null;

    const selectedNames = options
      .filter((option) => selectedIds.includes(option.id))
      .map((option) => option.name)
      .join(", ");

    return selectedNames;
  };

  return (
    <div className="mt-4 mb-8 p-6 bg-gray-100 rounded-lg border">
      <h2 className="text-xl font-semibold mb-6">Filter Menu</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Protein Type
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                <span className="truncate">
                  {getSelectedNames("proteinTypes", proteinTypes) ||
                    "Protein Type"}
                </span>
                <div className="flex items-center gap-2">
                  {getSelectedCount("proteinTypes") > 0 && (
                    <Badge variant="secondary">
                      {getSelectedCount("proteinTypes")}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <div className="p-2 space-y-2">
                {proteinTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`protein-${type.id}`}
                      checked={
                        searchParams.get("proteinTypes")?.includes(type.id) ||
                        false
                      }
                      onCheckedChange={(checked) => {
                        const currentValues =
                          searchParams.get("proteinTypes")?.split(",") || [];
                        if (checked) {
                          updateFilter(
                            "proteinTypes",
                            [...currentValues, type.id].join(",")
                          );
                        } else {
                          updateFilter(
                            "proteinTypes",
                            currentValues
                              .filter((v) => v !== type.id)
                              .join(",") || null
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={`protein-${type.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type.name}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Dietary Restrictions
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                <span className="truncate">
                  {getSelectedNames(
                    "dietaryRestrictions",
                    dietaryRestrictions
                  ) || "Dietary Restrictions"}
                </span>
                <div className="flex items-center gap-2">
                  {getSelectedCount("dietaryRestrictions") > 0 && (
                    <Badge variant="secondary">
                      {getSelectedCount("dietaryRestrictions")}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <div className="p-2 space-y-2">
                {dietaryRestrictions.map((restriction) => (
                  <div
                    key={restriction.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`restriction-${restriction.id}`}
                      checked={
                        searchParams
                          .get("dietaryRestrictions")
                          ?.includes(restriction.id) || false
                      }
                      onCheckedChange={(checked) => {
                        const currentValues =
                          searchParams.get("dietaryRestrictions")?.split(",") ||
                          [];
                        if (checked) {
                          updateFilter(
                            "dietaryRestrictions",
                            [...currentValues, restriction.id].join(",")
                          );
                        } else {
                          updateFilter(
                            "dietaryRestrictions",
                            currentValues
                              .filter((v) => v !== restriction.id)
                              .join(",") || null
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={`restriction-${restriction.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {restriction.name}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Cuisine
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                <span className="truncate">
                  {getSelectedNames("cuisines", cuisines) || "Cuisine"}
                </span>
                <div className="flex items-center gap-2">
                  {getSelectedCount("cuisines") > 0 && (
                    <Badge variant="secondary">
                      {getSelectedCount("cuisines")}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <div className="p-2 space-y-2">
                {cuisines.map((cuisine) => (
                  <div key={cuisine.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cuisine-${cuisine.id}`}
                      checked={
                        searchParams.get("cuisines")?.includes(cuisine.id) ||
                        false
                      }
                      onCheckedChange={(checked) => {
                        const currentValues =
                          searchParams.get("cuisines")?.split(",") || [];
                        if (checked) {
                          updateFilter(
                            "cuisines",
                            [...currentValues, cuisine.id].join(",")
                          );
                        } else {
                          updateFilter(
                            "cuisines",
                            currentValues
                              .filter((v) => v !== cuisine.id)
                              .join(",") || null
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={`cuisine-${cuisine.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {cuisine.name}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
