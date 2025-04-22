import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
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
  const [menuItems, filterOptions] = await Promise.all([
    getMenuItems(type),
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

  const filteredMenuItems = menuItems.filter((item) => {
    // If no filters are selected, show all items
    if (
      !selectedProteinType &&
      !selectedDietaryRestriction &&
      !selectedCuisine
    ) {
      return true;
    }

    // Check if item matches all selected filters
    const matchesProteinType =
      !selectedProteinType || item.proteinTypes.includes(selectedProteinType);

    const matchesDietaryRestriction =
      !selectedDietaryRestriction ||
      item.dietaryRestrictions.includes(selectedDietaryRestriction);

    const matchesCuisine = !selectedCuisine || item.cuisine === selectedCuisine;

    return matchesProteinType && matchesDietaryRestriction && matchesCuisine;
  });

  return (
    <>
      <FilterSection
        proteinTypes={filterOptions.proteinTypes}
        dietaryRestrictions={filterOptions.dietaryRestrictions}
        cuisines={filterOptions.cuisines}
      />

      {/* Menu Items Grid */}
      {filteredMenuItems.length === 0 ? (
        <EmptyState type={type} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-lg transition-shadow flex flex-col"
            >
              <CardHeader>
                <CardTitle className="text-xl">{item.name}</CardTitle>
                <CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.proteinTypes.map((proteinType) => (
                      <span
                        key={proteinType}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {proteinTypeMap.get(proteinType)}
                      </span>
                    ))}
                    {item.dietaryRestrictions.map((restriction) => (
                      <span
                        key={restriction}
                        className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs"
                      >
                        {dietaryRestrictionMap.get(restriction)}
                      </span>
                    ))}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="font-medium mb-1">Ingredients</h3>
                    <p className="text-sm text-gray-600">{item.ingredients}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.categories.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs"
                      >
                        {categoryMap.get(category)}
                      </span>
                    ))}
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                      >
                        {tagMap.get(tag)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <Button className="w-full">Order Now</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export default async function OrderPage({ searchParams }: PageProps) {
  const { proteinTypes, dietaryRestrictions, cuisines } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="max-w-7xl w-full mx-auto">
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
                searchParams={{ proteinTypes, dietaryRestrictions, cuisines }}
                type="Main"
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="addon">
            <Suspense fallback={<LoadingSpinner />}>
              <MenuItems
                searchParams={{ proteinTypes, dietaryRestrictions, cuisines }}
                type="Add-on"
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
