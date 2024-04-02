import Filters from "./filters";
import Image from "next/image";
import Meals from "@/components/meals";
import Sidebar from "./sidebar";
import base from "@/lib/airtable";
import { cn } from "@/lib/utils";

const order = ["Poultry", "Meat", "Fish", "Vegetarian", "Vegan"];

async function getData() {
  const result = [];

  return new Promise((resolve, reject) => {
    base("Menus")
      .select({
        pageSize: 100,
        maxRecords: 1000,
        // view: "App View",
        filterByFormula: "FIND('Main Menu', {Tag}) > 0",
      })
      .eachPage(
        function page(records, fetchNextPage) {
          records.forEach((record) => {
            result.push({
              id: record.id,
              fields: record.fields,
            });
          });

          fetchNextPage();
        },
        function done(err) {
          if (err) {
            return reject(err);
          }

          return resolve(result);
        }
      );
  });
}

async function getVariations(ids) {
  const result = [];

  let filterByFormula =
    "OR(" +
    ids
      .map((id) => {
        return `RECORD_ID()='${id}'`;
      })
      .join(",") +
    ")";

  return new Promise((resolve, reject) => {
    base("Menus")
      .select({
        pageSize: 100,
        maxRecords: 1000,
        // view: "App View",
        filterByFormula,
      })
      .eachPage(
        function page(records, fetchNextPage) {
          records.forEach((record) => {
            result.push({
              id: record.id,
              fields: record.fields,
            });
          });

          fetchNextPage();
        },
        function done(err) {
          if (err) {
            return reject(err);
          }

          return resolve(result);
        }
      );
  });
}

function getCategories(data) {
  let categories = [];

  data.forEach((item) => {
    const category = item.fields["Category"];

    if (categories[category] === undefined) {
      categories[category] = {
        label: category,
        count: 0,
      };
    }

    categories[category].count++;
  });

  categories = Object.values(categories);

  const order = ["Poultry", "Meat", "Fish", "Vegetarian", "Vegan"];
  categories.sort((a, b) => {
    const aIndex = order.indexOf(a.label);
    const bIndex = order.indexOf(b.label);

    if (aIndex === -1 && bIndex === -1) {
      return 0;
    }

    if (aIndex === -1) {
      return 1;
    }

    if (bIndex === -1) {
      return -1;
    }

    return aIndex - bIndex;
  });

  return categories;
}

function getFilters(data) {
  const result = [];

  data.forEach((item) => {
    const filters = item.fields["Filters"];

    filters?.forEach((filter) => {
      if (result.indexOf(filter) === -1) {
        result.push(filter);
      }
    });
  });

  return result;
}

export default async function ClassicsMenu({ searchParams }) {
  let data = await getData();

  data = data.filter((item) => {
    if (searchParams?.filter) {
      const params = searchParams?.filter
        ?.split(",")
        .map((item) => item.trim());

      return params.some((filter) => item.fields["Filters"]?.includes(filter));
    }

    return true;
  });

  const categories = getCategories(data);
  const filters = getFilters(data);
  const result = JSON.parse(JSON.stringify(data));

  for (const item of result) {
    if (item.fields["Link to the Variations of this Meal"]?.length > 0) {
      const variations = await getVariations(
        item.fields["Link to the Variations of this Meal"]
      );
      item.fields["Link to the Variations of this Meal"] = variations;
    }
  }

  result.sort((a, b) => {
    const aIndex = order.indexOf(a.fields["Category"]);
    const bIndex = order.indexOf(b.fields["Category"]);

    if (aIndex === -1 && bIndex === -1) {
      return 0;
    }

    if (aIndex === -1) {
      return 1;
    }

    if (bIndex === -1) {
      return -1;
    }

    return aIndex - bIndex;
  });

  if (result.length === 0) {
    return (
      <div className="flex items-center justify-normal flex-col gap-4 w-full mt-8">
        <Image
          src="/chef.svg"
          width="450"
          height="350"
          alt="No items available at this point"
        />
        <h2 className="mt-8 text-xl tracking-wider">
          No items available at this point
        </h2>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-4 w-full mt-4">
      {categories?.length > 0 && (
        <div className="w-1/5">
          <Sidebar categories={categories} />
        </div>
      )}

      <div className={cn(categories?.length > 0 ? "w-4/5" : "w-full")}>
        <div className="flex flex-col gap-4 w-full">
          {filters?.length > 0 && (
            <div className="flex items-center justify-start gap-4 flex-row">
              <Filters filters={filters} />
            </div>
          )}

          <div className={cn("grow", filters?.length > 0 ? "mt-4" : "")}>
            <Meals type="main" data={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
