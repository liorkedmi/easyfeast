import { getFilterOptions, getFilteredMenuItems } from "@/lib/airtable";
import { FilterSection } from "@/components/filter-section";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { UtensilsCrossed } from "lucide-react";
import { FilterSummaryBar } from "@/components/filter-summary-bar";
import { VirtualizedMenuGrid } from "@/components/virtualized-menu-grid";

interface PageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
  params: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

function EmptyState({ type }: { type: "Main" | "Add-on" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-gray-100 p-4 mb-4">
        <UtensilsCrossed className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No {type === "Main" ? "Main Catalog" : "Add-ons"} Found
      </h3>
      <p className="text-sm text-gray-500 max-w-md">
        {type === "Main"
          ? "We couldn't find any main dishes matching your filters. Try adjusting your filters or check back later for new menu items."
          : "We couldn't find any add-ons matching your filters. Try adjusting your filters or check back later for new menu items."}
      </p>
    </div>
  );
}

async function MenuItems({
  searchParams,
  type,
}: {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
  type: "Main" | "Add-on";
}) {
  const [filterOptions] = await Promise.all([getFilterOptions()]);

  // Create maps for lookups
  const proteinTypeMap = new Map(
    filterOptions.proteinTypes.map((type) => [type.id, type.name])
  );

  const dietaryRestrictionMap = new Map(
    filterOptions.dietaryRestrictions.map((restriction) => [
      restriction.id,
      restriction.name,
    ])
  );

  const categoryMap = new Map(
    filterOptions.categories.map((category) => [category.id, category.name])
  );

  const cuisineMap = new Map(
    filterOptions.cuisines.map((cuisine) => [cuisine.id, cuisine.name])
  );

  const tagMap = new Map(filterOptions.tags.map((tag) => [tag.id, tag.name]));

  const sideMap = new Map(
    filterOptions.sides.map((side) => [side.id, side.name])
  );

  // Check if Kosher is selected in dietary restrictions
  const isKosher =
    typeof searchParams.dietaryRestrictions === "string" &&
    searchParams.dietaryRestrictions.split(",").some((id) => {
      const restrictionName = dietaryRestrictionMap.get(id);
      return restrictionName?.toLowerCase().includes("kosher");
    });

  // Get filtered menu items using server-side filtering
  const filteredMenuItems = await getFilteredMenuItems(type, isKosher, {
    proteinTypes:
      typeof searchParams.proteinTypes === "string"
        ? searchParams.proteinTypes
        : undefined,
    dietaryRestrictions:
      typeof searchParams.dietaryRestrictions === "string"
        ? searchParams.dietaryRestrictions
        : undefined,
    cuisines:
      typeof searchParams.cuisines === "string"
        ? searchParams.cuisines
        : undefined,
    categories:
      typeof searchParams.categories === "string"
        ? searchParams.categories
        : undefined,
    tags: typeof searchParams.tags === "string" ? searchParams.tags : undefined,
    seasons:
      typeof searchParams.seasons === "string"
        ? searchParams.seasons
        : undefined,
  });

  // Transform the items to include mapped names
  const transformedItems = filteredMenuItems.map((item) => ({
    ...item,
    proteinTypes: item.proteinTypes
      ? item.proteinTypes.map((id) => proteinTypeMap.get(id) || id)
      : [],
    dietaryRestrictions: item.dietaryRestrictions
      ? item.dietaryRestrictions.map(
          (id) => dietaryRestrictionMap.get(id) || id
        )
      : [],
    categories: item.categories
      ? item.categories.map((id) => categoryMap.get(id) || id)
      : [],
    tags: item.tags ? item.tags.map((id) => tagMap.get(id) || id) : [],
    cuisine: item.cuisine
      ? item.cuisine.map((id) => cuisineMap.get(id) || id)
      : [],
    picture: Array.isArray(item.picture)
      ? item.picture[0]?.url || "/img/logo.png"
      : item.picture || "/img/logo.png",
    sides: item.sides ? item.sides.map((id) => sideMap.get(id) || id) : [],
  }));

  return (
    <>
      <FilterSection
        proteinTypes={filterOptions.proteinTypes}
        dietaryRestrictions={filterOptions.dietaryRestrictions}
        cuisines={filterOptions.cuisines}
        categories={filterOptions.categories}
        tags={filterOptions.tags}
        seasons={filterOptions.seasons}
        currentSeason={filterOptions.currentSeason}
      />
      <FilterSummaryBar
        filterOptions={{
          proteinTypes: filterOptions.proteinTypes,
          dietaryRestrictions: filterOptions.dietaryRestrictions,
          cuisines: filterOptions.cuisines,
          categories: filterOptions.categories,
          tags: filterOptions.tags,
          seasons: filterOptions.seasons,
        }}
        resultCount={transformedItems.length} // This will be updated by each tab
      />
      {filteredMenuItems.length === 0 ? (
        <EmptyState type={type} />
      ) : (
        <VirtualizedMenuGrid items={transformedItems} />
      )}
    </>
  );
}

export default async function OrderPage({ searchParams }: PageProps) {
  const { proteinTypes, dietaryRestrictions, cuisines, categories, tags } =
    await searchParams;

  return (
    <main className="">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Weekly Menu</h1>
            <p className="text-gray-600">
              Browse our selection of delicious meals for the week
            </p>
          </div>

          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="main">Main Dishes</TabsTrigger>
              <TabsTrigger value="addon">Add-ons</TabsTrigger>
            </TabsList>
            <TabsContent value="main">
              <Suspense fallback={<LoadingSpinner />}>
                <MenuItems
                  searchParams={{
                    proteinTypes,
                    dietaryRestrictions,
                    cuisines,
                    categories,
                    tags,
                  }}
                  type="Main"
                />
              </Suspense>
            </TabsContent>
            <TabsContent value="addon">
              <Suspense fallback={<LoadingSpinner />}>
                <MenuItems
                  searchParams={{
                    proteinTypes,
                    dietaryRestrictions,
                    cuisines,
                    categories,
                    tags,
                  }}
                  type="Add-on"
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
