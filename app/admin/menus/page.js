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

export default async function AdminMenus() {
  const menus = await getMenus();
  const status = [];

  for (const menu of menus) {
    status[menu.fields["Your Menu"]] = {
      menu,
      variations: [],
    };

    if (menu.fields["Link to the Variations of this Meal"]) {
      const variations = await getVariations(
        menu.fields["Link to the Variations of this Meal"]
      );

      for (const variation of variations) {
        if (variation.fields["Variation Name"]) {
          status[menu.fields["Your Menu"]].variations.push({
            id: variation.id,
            name: variation.fields["Your Menu"],
            valid: true,
            status: "",
          });
        } else {
          status[menu.fields["Your Menu"]].variations.push({
            id: variation.id,
            name: variation.fields["Your Menu"],
            valid: false,
            status: "Variation Name is empty",
          });
        }
      }
    }
  }

  return (
    <section className="p-4">
      <div className="font-bold text-2xl mt-4 mb-8 uppercase">Menus</div>

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
                          {variation.name} - {variation.status}
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
  );
}

// 1. Go through all the meals in the database

// 2. For each meal, if it has the "Current Seasonal Menu" tag, then

// 2.1 For each "Link to the Variations of this Meal", fetch variation

// 2.1.1. And make sure the "Variation Name" is not empty
