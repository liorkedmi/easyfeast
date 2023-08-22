import base from "@/lib/airtable";

export async function fetchBooking(id) {
  try {
    const result = [];
    const filterByFormula = `RECORD_ID()='${id}'`;

    return new Promise((resolve, reject) => {
      base("Bookings")
        .select({
          maxRecords: 1,
          view: "Booking Master",
          filterByFormula,
        })
        .eachPage(
          function page(records, fetchNextPage) {
            records.forEach((record) => {
              result.push(record);
            });

            fetchNextPage();
          },
          function done(err) {
            if (err) {
              reject(err);
            }

            if (result?.length === 0) {
              reject(err);
            }

            resolve(result[0]);
          }
        );
    });
  } catch (ex) {
    console.log("Error:", ex);
  }
}

export async function fetchShoppingListIngredients(ids) {
  try {
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
      base("Shopping List Ingredients")
        .select({
          maxRecords: 100,
          view: "Shopping List Master",
          filterByFormula,
        })
        .eachPage(
          function page(records, fetchNextPage) {
            records.forEach((record) => {
              result.push(record);
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
  } catch (ex) {
    console.log("Error:", ex);
  }
}

export default async function BookingShoppingListPage({ params }) {
  const booking = await fetchBooking(params.id);
  const shoppingList = await fetchShoppingListIngredients(
    booking.fields["Shopping List"]
  );

  const sortedList = shoppingList.sort((a, b) => {
    if (a.fields["Ingredient Display"][0] < b.fields["Ingredient Display"][0]) {
      return -1;
    }

    if (a.fields["Ingredient Display"][0] > b.fields["Ingredient Display"][0]) {
      return 1;
    }

    return 0;
  });

  const shoppingListMap = new Map();
  sortedList.forEach((item) => {
    if (item.fields["Ingredient Display"] && item.fields.Amount) {
      const id = item.id;
      const ingredient = item.fields["Ingredient Display"][0];
      const unit = item.fields["Unit"][0];
      const section = item.fields["Section of Grocery Store"][0];
      const description = item.fields["Description"];
      const amount = item.fields.Amount;

      if (!shoppingListMap.has(ingredient)) {
        shoppingListMap.set(ingredient, {
          id,
          ingredient,
          unit,
          description,
          section,
          amount,
        });
      } else {
        shoppingListMap.set(ingredient, {
          id,
          ingredient,
          unit,
          description,
          section,
          amount: shoppingListMap.get(ingredient).amount + amount,
        });
      }
    }
  });

  const array = Array.from(shoppingListMap, ([ingredient, value]) => value);

  const groups = [];

  groups["PRODUCE"] = [];
  groups["PANTRY"] = [];
  groups["MEAT"] = [];
  groups["DAIRY"] = [];
  groups["SUPPLIES"] = [];

  array.forEach((item) => {
    if (!groups[item.section]) {
      groups[item.section] = [];
    }

    groups[item.section].push(item);
  });

  const keys = Object.keys(groups);
  const result = [];
  keys.forEach((key) => {
    if (groups[key] && groups[key].length > 0) {
      result.push({
        section: key,
        ingredients: groups[key],
      });
    }
  });

  return (
    <div>
      {result.map((group) => {
        return (
          <div className="mb-4" key={group.section}>
            <div className="font-bold">{group.section}</div>
            <ul>
              {group.ingredients.map((item) => {
                const id = item.id;

                return (
                  <>
                    <div>
                      <ol
                        key={id}
                        className={
                          booking.fields["Final Shopping List"].indexOf(
                            item.id
                          ) === -1
                            ? "line-through"
                            : ""
                        }
                      >
                        {item.ingredient} - {item.amount} {item.unit}{" "}
                        {item.description}
                      </ol>
                    </div>
                  </>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
