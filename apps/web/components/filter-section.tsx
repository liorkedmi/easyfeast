"use client";

import {
  useCallback,
  useTransition,
  useRef,
  useLayoutEffect,
  useState,
  useEffect,
} from "react";
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
import { useUserPreferences } from "../contexts/user-preferences-context";

interface FilterOption {
  id: string;
  name: string;
}

interface FilterSectionProps {
  proteinTypes: FilterOption[];
  dietaryRestrictions: FilterOption[];
  cuisines: FilterOption[];
  categories: FilterOption[];
  tags: FilterOption[];
  seasons: FilterOption[];
  currentSeason: string;
}

// Custom scrollable popover with gradient indicators
function ScrollablePopover({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const handleScroll = () => {
      setShowTop(el.scrollTop > 0);
      setShowBottom(el.scrollTop + el.clientHeight < el.scrollHeight);
    };
    handleScroll();
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [children]);

  return (
    <div className={`relative ${className || ""}`}>
      {showTop && (
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/90 to-transparent z-10" />
      )}
      <div ref={areaRef} className="max-h-64 overflow-y-auto">
        {children}
      </div>
      {showBottom && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/90 to-transparent z-10" />
      )}
    </div>
  );
}

export function FilterSection({
  proteinTypes,
  dietaryRestrictions,
  cuisines,
  categories,
  tags,
  seasons,
  currentSeason,
}: FilterSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { preferences } = useUserPreferences();
  const proteinButtonRef = useRef<HTMLButtonElement>(null);
  const dietaryButtonRef = useRef<HTMLButtonElement>(null);
  const cuisineButtonRef = useRef<HTMLButtonElement>(null);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  const tagButtonRef = useRef<HTMLButtonElement>(null);
  const seasonButtonRef = useRef<HTMLButtonElement>(null);

  const [proteinWidth, setProteinWidth] = useState<number>();
  const [dietaryWidth, setDietaryWidth] = useState<number>();
  const [cuisineWidth, setCuisineWidth] = useState<number>();
  const [categoryWidth, setCategoryWidth] = useState<number>();
  const [tagWidth, setTagWidth] = useState<number>();
  const [seasonWidth, setSeasonWidth] = useState<number>();

  useLayoutEffect(() => {
    if (proteinButtonRef.current) {
      setProteinWidth(proteinButtonRef.current.offsetWidth);
    }
    if (dietaryButtonRef.current) {
      setDietaryWidth(dietaryButtonRef.current.offsetWidth);
    }
    if (cuisineButtonRef.current) {
      setCuisineWidth(cuisineButtonRef.current.offsetWidth);
    }
    if (categoryButtonRef.current) {
      setCategoryWidth(categoryButtonRef.current.offsetWidth);
    }
    if (tagButtonRef.current) {
      setTagWidth(tagButtonRef.current.offsetWidth);
    }
    if (seasonButtonRef.current) {
      setSeasonWidth(seasonButtonRef.current.offsetWidth);
    }
  }, [proteinTypes, dietaryRestrictions, cuisines, categories, tags, seasons]);

  // Initialize filters with user preferences if available
  // useEffect(() => {
  //   if (!preferences) return;

  //   const params = new URLSearchParams(searchParams);
  //   let hasChanges = false;

  //   // Helper function to update params if not already set
  //   const updateParamIfNotSet = (
  //     key: string,
  //     ids: { id: string }[] | undefined
  //   ) => {
  //     if (ids && ids.length > 0 && !params.has(key)) {
  //       params.set(key, ids.map((item) => item.id).join(","));
  //       hasChanges = true;
  //     }
  //   };

  //   // Update each filter type if not already set in URL
  //   updateParamIfNotSet("proteinTypes", preferences.proteinPreferences);
  //   updateParamIfNotSet("dietaryRestrictions", preferences.dietaryRestrictions);
  //   updateParamIfNotSet("cuisines", preferences.cuisinePreferences);
  //   updateParamIfNotSet("categories", preferences.categoryPreferences);

  //   // Set default season if not set
  //   if (!params.has("seasons")) {
  //     params.set("seasons", currentSeason);
  //     hasChanges = true;
  //   }

  //   // Only update URL if we made changes
  //   if (hasChanges) {
  //     startTransition(() => {
  //       router.push(`?${params.toString()}`);
  //     });
  //   }
  // }, [preferences, currentSeason]);

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Preserve the tab selection
      const currentTab = searchParams.get("tab") || "main";
      params.set("tab", currentTab);
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

  const handleSelectAll = (key: string, options: FilterOption[]) => {
    const allIds = options.map((option) => option.id).join(",");
    updateFilter(key, allIds);
  };

  const handleUnselectAll = (key: string) => {
    updateFilter(key, null);
  };

  return (
    <div className="mt-4 mb-8 p-6 bg-gray-100 rounded-lg border">
      <h2 className="text-xl font-semibold mb-6">Filter Menu</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Season
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                ref={seasonButtonRef}
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                <span className="truncate">
                  {getSelectedNames("seasons", seasons) || "Season"}
                </span>
                <div className="flex items-center gap-2">
                  {getSelectedCount("seasons") > 0 && (
                    <Badge variant="secondary">
                      {getSelectedCount("seasons")}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              sideOffset={0}
              style={seasonWidth ? { width: seasonWidth } : undefined}
              className="p-0 mt-1 shadow-lg border border-gray-200 rounded-lg bg-white"
            >
              <ScrollablePopover>
                <div className="p-2 space-y-2">
                  <div className="flex gap-2 mb-2 pb-2 border-b">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const selected =
                          searchParams.get("seasons")?.split(",") || [];
                        if (selected.length === seasons.length) {
                          handleUnselectAll("seasons");
                        } else {
                          handleSelectAll("seasons", seasons);
                        }
                      }}
                    >
                      {(searchParams.get("seasons")?.split(",") || [])
                        .length === seasons.length
                        ? "Unselect All"
                        : "Select All"}
                    </Button>
                  </div>
                </div>
                <div className="p-2 space-y-2">
                  {seasons.map((season) => (
                    <div
                      key={season.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`season-${season.id}`}
                        checked={
                          searchParams.get("seasons")?.includes(season.id) ||
                          false
                        }
                        onCheckedChange={(checked) => {
                          const currentValues =
                            searchParams.get("seasons")?.split(",") || [];
                          if (checked) {
                            updateFilter(
                              "seasons",
                              [...currentValues, season.id].join(",")
                            );
                          } else {
                            updateFilter(
                              "seasons",
                              currentValues
                                .filter((v) => v !== season.id)
                                .join(",") || null
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`season-${season.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {season.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollablePopover>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Protein Type
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                ref={proteinButtonRef}
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
            <PopoverContent
              sideOffset={0}
              style={proteinWidth ? { width: proteinWidth } : undefined}
              className="p-0 mt-1 shadow-lg border border-gray-200 rounded-lg bg-white"
            >
              <ScrollablePopover>
                <div className="p-2 space-y-2">
                  <div className="flex gap-2 mb-2 pb-2 border-b">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const selected =
                          searchParams.get("proteinTypes")?.split(",") || [];
                        if (selected.length === proteinTypes.length) {
                          handleUnselectAll("proteinTypes");
                        } else {
                          handleSelectAll("proteinTypes", proteinTypes);
                        }
                      }}
                    >
                      {(searchParams.get("proteinTypes")?.split(",") || [])
                        .length === proteinTypes.length
                        ? "Unselect All"
                        : "Select All"}
                    </Button>
                  </div>
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
              </ScrollablePopover>
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
                ref={dietaryButtonRef}
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
            <PopoverContent
              sideOffset={0}
              style={dietaryWidth ? { width: dietaryWidth } : undefined}
              className="p-0 mt-1 shadow-lg border border-gray-200 rounded-lg bg-white"
            >
              <ScrollablePopover>
                <div className="p-2 space-y-2">
                  <div className="flex gap-2 mb-2 pb-2 border-b">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const selected =
                          searchParams.get("dietaryRestrictions")?.split(",") ||
                          [];
                        if (selected.length === dietaryRestrictions.length) {
                          handleUnselectAll("dietaryRestrictions");
                        } else {
                          handleSelectAll(
                            "dietaryRestrictions",
                            dietaryRestrictions
                          );
                        }
                      }}
                    >
                      {(
                        searchParams.get("dietaryRestrictions")?.split(",") ||
                        []
                      ).length === dietaryRestrictions.length
                        ? "Unselect All"
                        : "Select All"}
                    </Button>
                  </div>
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
                            searchParams
                              .get("dietaryRestrictions")
                              ?.split(",") || [];
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
              </ScrollablePopover>
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
                ref={cuisineButtonRef}
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
            <PopoverContent
              sideOffset={0}
              style={cuisineWidth ? { width: cuisineWidth } : undefined}
              className="p-0 mt-1 shadow-lg border border-gray-200 rounded-lg bg-white"
            >
              <ScrollablePopover>
                <div className="p-2 space-y-2">
                  <div className="flex gap-2 mb-2 pb-2 border-b">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const selected =
                          searchParams.get("cuisines")?.split(",") || [];
                        if (selected.length === cuisines.length) {
                          handleUnselectAll("cuisines");
                        } else {
                          handleSelectAll("cuisines", cuisines);
                        }
                      }}
                    >
                      {(searchParams.get("cuisines")?.split(",") || [])
                        .length === cuisines.length
                        ? "Unselect All"
                        : "Select All"}
                    </Button>
                  </div>
                  {cuisines.map((cuisine) => (
                    <div
                      key={cuisine.id}
                      className="flex items-center space-x-2"
                    >
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
              </ScrollablePopover>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Category
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                ref={categoryButtonRef}
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                <span className="truncate">
                  {getSelectedNames("categories", categories) || "Category"}
                </span>
                <div className="flex items-center gap-2">
                  {getSelectedCount("categories") > 0 && (
                    <Badge variant="secondary">
                      {getSelectedCount("categories")}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              sideOffset={0}
              style={categoryWidth ? { width: categoryWidth } : undefined}
              className="p-0 mt-1 shadow-lg border border-gray-200 rounded-lg bg-white"
            >
              <ScrollablePopover>
                <div className="p-2 space-y-2">
                  <div className="flex gap-2 mb-2 pb-2 border-b">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const selected =
                          searchParams.get("categories")?.split(",") || [];
                        if (selected.length === categories.length) {
                          handleUnselectAll("categories");
                        } else {
                          handleSelectAll("categories", categories);
                        }
                      }}
                    >
                      {(searchParams.get("categories")?.split(",") || [])
                        .length === categories.length
                        ? "Unselect All"
                        : "Select All"}
                    </Button>
                  </div>
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={
                          searchParams
                            .get("categories")
                            ?.includes(category.id) || false
                        }
                        onCheckedChange={(checked) => {
                          const currentValues =
                            searchParams.get("categories")?.split(",") || [];
                          if (checked) {
                            updateFilter(
                              "categories",
                              [...currentValues, category.id].join(",")
                            );
                          } else {
                            updateFilter(
                              "categories",
                              currentValues
                                .filter((v) => v !== category.id)
                                .join(",") || null
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollablePopover>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Tags
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                ref={tagButtonRef}
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                <span className="truncate">
                  {getSelectedNames("tags", tags) || "Tags"}
                </span>
                <div className="flex items-center gap-2">
                  {getSelectedCount("tags") > 0 && (
                    <Badge variant="secondary">
                      {getSelectedCount("tags")}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              sideOffset={0}
              style={tagWidth ? { width: tagWidth } : undefined}
              className="p-0 mt-1 shadow-lg border border-gray-200 rounded-lg bg-white"
            >
              <ScrollablePopover>
                <div className="p-2 space-y-2">
                  <div className="flex gap-2 mb-2 pb-2 border-b">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const selected =
                          searchParams.get("tags")?.split(",") || [];
                        if (selected.length === tags.length) {
                          handleUnselectAll("tags");
                        } else {
                          handleSelectAll("tags", tags);
                        }
                      }}
                    >
                      {(searchParams.get("tags")?.split(",") || []).length ===
                      tags.length
                        ? "Unselect All"
                        : "Select All"}
                    </Button>
                  </div>
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={
                          searchParams.get("tags")?.includes(tag.id) || false
                        }
                        onCheckedChange={(checked) => {
                          const currentValues =
                            searchParams.get("tags")?.split(",") || [];
                          if (checked) {
                            updateFilter(
                              "tags",
                              [...currentValues, tag.id].join(",")
                            );
                          } else {
                            updateFilter(
                              "tags",
                              currentValues
                                .filter((v) => v !== tag.id)
                                .join(",") || null
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`tag-${tag.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {tag.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollablePopover>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
