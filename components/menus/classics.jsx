import Filters from "./filters";
import Meals from "@/components/meals";
import base from "@/lib/airtable";

async function getData() {
  const result = [];

  return new Promise((resolve, reject) => {
    base("Menus")
      .select({
        maxRecords: 100,
        view: "Menu Master",
        filterByFormula: "FIND('Family Classics', {Tag}) > 0",
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
            reject(err);
          }

          resolve(result);
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
        maxRecords: 100,
        view: "Menu Master",
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
            reject(err);
          }

          resolve(result);
        }
      );
  });
}

function getCategories(data) {
  const categories = [];

  data.forEach((item) => {
    const category = item.fields["Category"];
    if (categories.indexOf(category) === -1) {
      categories.push(category);
    }
  });

  return categories;
}

export default async function ClassicsMenu() {
  let data = await getData();
  const categories = getCategories(data);

  const result = JSON.parse(JSON.stringify(data));

  for (const item of result) {
    if (item.fields["Link to the Variations of this Meal"]?.length > 0) {
      const variations = await getVariations(
        item.fields["Link to the Variations of this Meal"]
      );
      item.fields["Link to the Variations of this Meal"] = variations;
    }
  }

  return (
    <div className="flex gap-4">
      <div className="flex gap-4 flex-col">
        <Filters categories={categories} />
      </div>
      <div className="grow">
        <Meals type="classics" data={result} />
      </div>
    </div>
  );
}
