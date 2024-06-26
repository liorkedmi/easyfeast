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

  const getRequiredSelections = (menu) => {
    return menu.fields["Required Selections"];
  };

  const getVariations = (menu) => {
    const variations = menu.fields["Link to the Variations of this Meal"];
    const requiredSelections = menu.fields["Required Selections"];

    let result = variations;

    if (variations && requiredSelections) {
      result = variations.filter((record) => {
        if (record.fields["Variation Name"]?.length === 1) {
          if (
            requiredSelections.indexOf(record.fields["Variation Name"][0]) !==
            -1
          ) {
            return false;
          }
        }

        return true;
      });
    }

    return result;
  };

  const params = new URLSearchParams(searchParams.toString());

  let filter;
  if (params.get("filter")) {
    filter = (params.get("filter") || "")?.split(",");
  }

  const filteredMeals = data.filter((meal) => {
    let result = false;

    if (!filter && !filter) {
      result = true;
    }

    if (filter) {
      result ||= filter?.indexOf(meal.fields["Category"]) > -1;
    }

    if (filter) {
      for (const sub of filter) {
        result ||= meal.fields["Filters"]?.indexOf(sub) > -1;
      }
    }

    return result;
  });

  const meals = groupByCategory(filteredMeals);
  const groups = Object.keys(meals);

  return (
    <>
      {groups.map((group) => {
        const list = meals[group].sort((a, b) => {
          a.fields["Your Menu"] < b.fields["Your Menu"];
        });

        return (
          <div key={`group-${group}`} className="pb-4">
            <div
              id={group}
              className="text-base font-semibold tracking-wider mb-2"
            >
              {group}
            </div>
            {list.map((menu) => {
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
                    Small:
                      variation.fields["Shopping List Ingredients - Small"],
                    Medium:
                      variation.fields["Shopping List Ingredients - Medium"],
                    Large:
                      variation.fields["Shopping List Ingredients - Large"],
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

              const requiredSelectionsOptions = getRequiredSelections(menu);
              const variationsOptions = getVariations(menu);

              return (
                <div key={`menu-${menu.id}`} className="pb-4">
                  <Meal
                    id={menu.id}
                    name={menu.fields["Your Menu"]}
                    type={type}
                    ingredients={menu.fields["Ingredients"]}
                    shoppingList={shoppingList}
                    recipes={recipes}
                    requiredSelectionsOptions={requiredSelectionsOptions}
                    variationsOptions={variationsOptions}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
