import base from "@/lib/airtable";
import { currentUser } from "@clerk/nextjs";
import { isLoggedInUserAdmin } from "@/app/actions";

async function getMenus() {
  const result = [];

  const promise = new Promise((resolve, reject) => {
    const filterByFormula = `OR({Variation Name}=BLANK(), {Recipes - Small}=BLANK(), {Recipes - Medium}=BLANK(),  {Recipes - Large}=BLANK())`;

    base("Menus")
      .select({
        pageSize: 100,
        maxRecords: 10000,
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

  const res = await promise;

  return res;
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

export default async function AdminMenus() {
  // if (!(await isLoggedInUserAdmin())) {
  //   return <div>Unauthorized</div>;
  // }

  const menus = await getMenus();
  const status = [];

  for (const variation of menus) {
    const variationStatus = {
      id: variation.id,
      name: variation.fields["Your Menu"],
      valid: true,
      error: [],
    };

    if (!variation.fields["Variation Name"]) {
      variationStatus.valid = false;
      variationStatus.error.push("`Variation Name` is missing");
    }

    if (!variation.fields["Recipes - Small"]) {
      variationStatus.valid = false;
      variationStatus.error.push("`Recipes - Small` is missing");
    }

    if (!variation.fields["Recipes - Medium"]) {
      variationStatus.valid = false;
      variationStatus.error.push("`Recipes - Medium` is missing");
    }

    if (!variation.fields["Recipes - Large"]) {
      variationStatus.valid = false;
      variationStatus.error.push("`Recipes - Large` is missing");
    }

    status.push(variationStatus);
  }

  return (
    <section className="p-4">
      <div className="font-bold text-2xl mt-4 mb-8 uppercase">Menus</div>

      {status.map((variation) => {
        return (
          <li key={variation.id}>
            {variation.valid ? "✅" : "❌"}
            <span className="ml-2">
              {variation.valid ? (
                <>{variation.name}</>
              ) : (
                <>
                  {variation.name} - {variation.error.join(", ")}
                </>
              )}
            </span>
          </li>
        );
      })}
    </section>
  );
}
