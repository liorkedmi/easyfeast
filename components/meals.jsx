"use client";

import { useRouter, useSearchParams } from "next/navigation";

import Meal from "@/components/meal";

export default function Meals({ type, data }) {
  const searchParams = useSearchParams();

  const groupByCategory = (meals) => {
    const mealsMap = [];

    meals.forEach((meal) => {
      if (!mealsMap[meal.fields["Category"]]) {
        mealsMap[meal.fields["Category"]] = [];
      }

      mealsMap[meal.fields["Category"]].push(meal);
    });

    return mealsMap;
  };

  const params = new URLSearchParams(searchParams.toString());
  const filter = (params.get("filter") || "")?.split(",");

  const filteredMeals = data.filter((meal) => {
    if (filter.length === 1) {
      return true;
    }

    return filter?.indexOf(meal.fields["Category"]) > -1;
  });

  const meals = groupByCategory(filteredMeals);
  const groups = Object.keys(meals);

  return (
    <>
      {groups.map((group) => (
        <div key={`group-${group}`} className="pb-4">
          <div className="text-lg mb-2">{group}</div>
          {meals[group].map((menu) => {
            const shoppingList = {
              primary: {
                Small: menu.fields["Shopping List Ingredients - Small"],
                Medium: menu.fields["Shopping List Ingredients - Medium"],
                Large: menu.fields["Shopping List Ingredients - Large"],
              },
            };

            if (menu.fields["Link to the Variations of this Meal"]) {
              for (const variation of menu.fields[
                "Link to the Variations of this Meal"
              ]) {
                shoppingList[variation.fields["Variation Name"]] = {
                  Small: variation.fields["Shopping List Ingredients - Small"],
                  Medium:
                    variation.fields["Shopping List Ingredients - Medium"],
                  Large: variation.fields["Shopping List Ingredients - Large"],
                };
              }
            }

            const recipes = {
              primary: {
                Small: menu.fields["Recipes - Small"],
                Medium: menu.fields["Recipes - Medium"],
                Large: menu.fields["Recipes - Large"],
              },
            };

            if (menu.fields["Link to the Variations of this Meal"]) {
              for (const variation of menu.fields[
                "Link to the Variations of this Meal"
              ]) {
                recipes[variation.fields["Variation Name"]] = {
                  Small: variation.fields["Recipes - Small"],
                  Medium: variation.fields["Recipes - Medium"],
                  Large: variation.fields["Recipes - Large"],
                };
              }
            }

            return (
              <div key={`menu-${menu.id}`} className="pb-4">
                <Meal
                  id={menu.id}
                  name={menu.fields["Your Menu"]}
                  type={type}
                  ingredients={menu.fields["Ingredients"]}
                  shoppingList={shoppingList}
                  recipes={recipes}
                  requiredSelectionsOptions={menu.fields["Required Selections"]}
                  customizationsOptions={
                    menu.fields[
                      "Meal Customizations (NO recipe for the customization)"
                    ]
                  }
                  variationsOptions={
                    menu.fields["Link to the Variations of this Meal"]
                  }
                />
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
