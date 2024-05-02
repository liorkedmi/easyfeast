import base from "@/lib/airtable";

async function getMenus() {
  const result = [];

  const promise = new Promise((resolve, reject) => {
    base("Menus")
      .select({
        pageSize: 100,
        maxRecords: 10000,
        // view: "App View",
        filterByFormula: "FIND('Current Seasonal Menu', {Tag}) > 0",
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

async function validateMenu(menu) {
  const result = [];

  if (menu.fields["Link to the Variations of this Meal"]) {
    const variations = await getVariations(
      menu.fields["Link to the Variations of this Meal"]
    );

    for (const variation of variations) {
      const variationStatus = {
        id: variation.id,
        name: variation.fields["Your Menu"],
        valid: true,
        error: [],
      };

      if (!variation.fields["Variation Name"]) {
        variationStatus.valid = false;
        variationStatus.error.push("Variation Name is empty");
      }

      if (!variation.fields["Recipes - Small"]) {
        variationStatus.valid = false;
        variationStatus.error.push("Variation Small Recipes missing");
      }

      if (!variation.fields["Recipes - Medium"]) {
        variationStatus.valid = false;
        variationStatus.error.push("Variation Medium Recipes missing");
      }

      if (!variation.fields["Recipes - Large"]) {
        variationStatus.valid = false;
        variationStatus.error.push("Variation Large Recipes missing");
      }

      result.push(variationStatus);
    }
  }
}

export default async function AdminMenus() {
  const menus = await getMenus();
  const status = [];

  for (const menu of menus) {
    status[menu.fields["Your Menu"]] = {
      menu,
      variations: await validateMenu(menu),
    };
  }

  return (
    <>
      <section className="p-4">
        <div className="font-bold text-2xl mt-4 mb-8 uppercase">
          Current Seasonal Menus
        </div>

        {Object.keys(status).map((key) => {
          return (
            <div key={key} className="mb-4">
              <h2 className="text-lg font-bold">{key}</h2>
              <ul>
                {status[key].variations.map((variation) => {
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
              </ul>
            </div>
          );
        })}
      </section>
    </>
  );
}
