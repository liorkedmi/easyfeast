import { getMenuItems, getFilterOptions } from "@/lib/airtable";
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
import { MenuItem } from "@/components/menu-item";
import { FilterSummaryBar } from "@/components/filter-summary-bar";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
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
}: PageProps & { type: "Main" | "Add-on" }) {
  const [filterOptions] = await Promise.all([
    getFilterOptions(),
  ]);

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

  // Filter menu items based on URL params
  const selectedProteinType =
    typeof searchParams.proteinTypes === "string"
      ? searchParams.proteinTypes
      : "";
  const selectedDietaryRestriction =
    typeof searchParams.dietaryRestrictions === "string"
      ? searchParams.dietaryRestrictions
      : "";
  const selectedCuisine =
    typeof searchParams.cuisines === "string" ? searchParams.cuisines : "";
  const selectedCategories =
    typeof searchParams.categories === "string" ? searchParams.categories : "";
  const selectedTags =
    typeof searchParams.tags === "string" ? searchParams.tags : "";

  // Get menu items based on Kosher preference
  const menu = await getMenuItems(type, isKosher);

  const filteredMenuItems = menu.filter((item) => {
    // If no filters are selected, show all items
    if (
      !selectedProteinType &&
      !selectedDietaryRestriction &&
      !selectedCuisine &&
      !selectedCategories &&
      !selectedTags
    ) {
      return true;
    }

    // Check if item matches all selected filters
    const matchesProteinType =
      !selectedProteinType ||
      selectedProteinType
        .split(",")
        .some((type) => item.proteinTypes.includes(type));

    const matchesDietaryRestriction =
      !selectedDietaryRestriction ||
      !item.dietaryRestrictions.includes(selectedDietaryRestriction);

    const matchesCuisine =
      !selectedCuisine ||
      selectedCuisine
        .split(",")
        .some((cuisine) => item.cuisine.includes(cuisine));

    const matchesCategories =
      !selectedCategories ||
      item.categories.some((category) =>
        selectedCategories.split(",").includes(category)
      );

    const matchesTags =
      !selectedTags ||
      item.tags.some((tag) => selectedTags.split(",").includes(tag));

    return (
      matchesProteinType &&
      matchesDietaryRestriction &&
      matchesCuisine &&
      matchesCategories &&
      matchesTags
    );
  });

  return (
    <>
      <FilterSection
        proteinTypes={filterOptions.proteinTypes}
        dietaryRestrictions={filterOptions.dietaryRestrictions}
        cuisines={filterOptions.cuisines}
        categories={filterOptions.categories}
        tags={filterOptions.tags}
      />
      <FilterSummaryBar
        filterOptions={{
          proteinTypes: filterOptions.proteinTypes,
          dietaryRestrictions: filterOptions.dietaryRestrictions,
          cuisines: filterOptions.cuisines,
          categories: filterOptions.categories,
          tags: filterOptions.tags,
        }}
        resultCount={filteredMenuItems.length}
      />
      {/* Menu Items Grid */}
      {filteredMenuItems.length === 0 ? (
        <EmptyState type={type} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map((item) => (
            <MenuItem
              key={item.id}
              item={{
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
                tags: item.tags
                  ? item.tags.map((id) => tagMap.get(id) || id)
                  : [],
                cuisine: item.cuisine
                  ? item.cuisine.map((id) => cuisineMap.get(id) || id)
                  : [],
                picture: Array.isArray(item.picture)
                  ? item.picture[0]?.url || "/img/placeholder.png"
                  : item.picture || "/img/placeholder.png",
                restriction_Dairy_Free: item.restriction_Dairy_Free,
                restriction_Gluten_Free: item.restriction_Gluten_Free,
                restriction_Tree_Nut_Free: item.restriction_Tree_Nut_Free,
                restriction_Peanut_Free: item.restriction_Peanut_Free,
                restriction_Egg_Free: item.restriction_Egg_Free,
                restriction_Sesame_Free: item.restriction_Sesame_Free,
                choices_Select_1: item.choices_Select_1,
                choices_Select_Multiple: item.choices_Select_Multiple,
                sides: item.sides
                  ? item.sides.map((id) => sideMap.get(id) || id)
                  : [],
              }}
            />
          ))}
        </div>
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
