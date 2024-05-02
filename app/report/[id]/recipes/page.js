import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import base from "@/lib/airtable";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "long",
});

export async function fetchClient(email) {
  try {
    const result = [];
    const filterByFormula = `{Email Address}='${email}'`;

    return new Promise((resolve, reject) => {
      base("Clients")
        .select({
          maxRecords: 1,
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
              return reject(err);
            }

            if (!result || result?.length === 0) {
              return reject(err);
            }

            return resolve(result[0]);
          }
        );
    });
  } catch (ex) {
    console.log("Error:", ex);
  }
}

export async function fetchChef(chefId) {
  try {
    const result = [];
    const filterByFormula = `RECORD_ID()='${chefId}'`;

    return new Promise((resolve, reject) => {
      base("Chefs")
        .select({
          maxRecords: 1,
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
              return reject(err);
            }

            if (!result || result?.length === 0) {
              return reject(err);
            }

            return resolve(result[0]);
          }
        );
    });
  } catch (ex) {
    console.log("Error:", ex);
  }
}

export async function fetchBooking(id) {
  try {
    const result = [];
    const filterByFormula = `RECORD_ID()='${id}'`;

    return new Promise((resolve, reject) => {
      base("Bookings")
        .select({
          maxRecords: 1,
          // view: "App View",
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
              return reject(err);
            }

            if (!result || result?.length === 0) {
              return reject(err);
            }

            return resolve(result[0]);
          }
        );
    });
  } catch (ex) {
    console.log("Error:", ex);
  }
}

async function fetchMenus(ids) {
  const result = [];

  const filterByFormula =
    "OR(" +
    ids
      .map((id) => {
        return `RECORD_ID()='${id}'`;
      })
      .join(",") +
    ")";

  const promise = new Promise((resolve, reject) => {
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

  const res = await promise;

  return res;
}

async function fetchRecipes(ids) {
  const result = [];

  const filterByFormula =
    "OR(" +
    ids
      .map((id) => {
        return `RECORD_ID()='${id}'`;
      })
      .join(",") +
    ")";

  const promise = new Promise((resolve, reject) => {
    base("Recipes")
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

  const res = await promise;

  return res;
}

async function fetchRecipeIngredients(ids) {
  const result = [];

  const filterByFormula =
    "OR(" +
    ids
      .map((id) => {
        return `RECORD_ID()='${id}'`;
      })
      .join(",") +
    ")";

  const promise = new Promise((resolve, reject) => {
    base("Recipe Ingredients")
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

  const res = await promise;

  return res;
}

export default async function BookingRecipesPage({ params }) {
  const booking = await fetchBooking(params.id);
  const client = await fetchClient(booking.fields["Email"]);
  const chef = await fetchChef(booking.fields["Chef"]);
  const menus = await fetchMenus(booking.fields["Final Menu"]);
  const recipes = await fetchRecipes(booking.fields["All Recipes for Booking"]);

  return (
    <section className="flex flex-col items-center justify-between px-4 max-w-4xl m-auto text-sm tracking-wider">
      <div className="font-bold text-2xl mt-4 mb-8 uppercase">
        Booking Information
      </div>

      <header className="w-full">
        <div className="text-center text-red-600 mb-4 uppercase">
          All contents of this package (including client information and
          recipes) are confidential, property of EasyFeast.
          <br />
          <strong className="font-bold">DO NOT SHARE, POST OR REUSE.</strong>
        </div>

        <div
          className="text-base bg-yellow-300 p-2 my-8"
          style={{ WebkitPrintColorAdjust: "exact" }}
        >
          Hi{" "}
          <strong className="font-bold">
            Chef {chef.fields["Chef First"]}
          </strong>
          !
          <br />
          <br />
          Here are the details and recipes for your booking on{" "}
          {dateFormatter.format(
            new Date(booking.fields["Booking Date and Arrival Time"])
          )}{" "}
          at {client.fields["Name for Chef Display"]}.
          <br />
          <br />
          Thanks! :)
        </div>
      </header>
      <main className="w-full">
        <table className="w-full mb-8">
          <tbody>
            <tr
              className="text-center text-base font-bold bg-gray-200"
              style={{ WebkitPrintColorAdjust: "exact" }}
            >
              <th className="p-2 text-left" colSpan="2">
                Contact Information
              </th>
            </tr>
            <tr>
              <td className="p-2 w-1/3 border-b border-slate-200 text-bold">
                Client Name:
              </td>
              <td className="p-2 w-2/3 border-b border-slate-200 whitespace-pre-line">
                {client.fields["Name for Chef Display"]}
              </td>
            </tr>
            <tr>
              <td className="p-2 w-1/3 border-b border-slate-200 text-bold">
                Booking Location:
              </td>
              <td className="p-2 w-2/3 border-b border-slate-200 whitespace-pre-line">
                {booking.fields["Booking Address"]}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full mb-8">
          <tbody>
            <tr
              className="text-center text-base font-bold bg-gray-200"
              style={{ WebkitPrintColorAdjust: "exact" }}
            >
              <th className="p-2 text-left" colSpan="2">
                Booking Date & Arrival Time
              </th>
            </tr>
            <tr>
              <td className="p-2 w-1/3 border-b border-slate-200 text-bold">
                Booking Date & Time:
              </td>
              <td className="p-2 w-2/3 border-b border-slate-200 whitespace-pre-line">
                {dateFormatter.format(
                  new Date(booking.fields["Booking Date and Arrival Time"])
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full mb-8">
          <tbody>
            <tr
              className="text-center text-base font-bold bg-gray-200"
              style={{ WebkitPrintColorAdjust: "exact" }}
            >
              <th className="p-2 text-left" colSpan="2">
                Menu for the Booking
              </th>
            </tr>
            <tr>
              <td className="p-2 w-1/3 border-b border-slate-200 text-bold">
                Menu:
              </td>
              <td className="p-2 w-2/3 border-b border-slate-200 whitespace-pre-line">
                <ul className="list-disc pl-8">
                  {/* Make bullets - also, the bullets and the recipes should follow the same order */}
                  {menus?.map((menu) => (
                    <li key={menu.fields["Your Menu"]}>
                      {menu.fields["Your Menu"]}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
            <tr>
              <td className="p-2 w-1/3 border-b border-slate-200 text-bold">
                Notes:
              </td>
              <td className="p-2 w-2/3 border-b border-slate-200 text-red-600 whitespace-pre-line">
                {booking.fields["Notes for chef about the Menu"]}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full mb-8">
          <tbody>
            <tr
              className="text-center text-base font-bold bg-gray-200"
              style={{ WebkitPrintColorAdjust: "exact" }}
            >
              <th className="p-2 text-left" colSpan="2">
                Client Preferences
              </th>
            </tr>
            <tr>
              <td className="p-2 w-1/3 border-b border-slate-200 text-bold">
                Allergies/Aversions:
              </td>
              <td className="p-2 w-2/3 border-b border-slate-200 text-red-600 whitespace-pre-line">
                {client.fields["Allergies/Dislikes:"]}
              </td>
            </tr>
            <tr>
              <td className="p-2 w-1/3 border-b border-slate-200 text-bold">
                Likes:
              </td>
              <td className="p-2 w-2/3 border-b border-slate-200 whitespace-pre-line">
                {client.fields["Likes:"]}
              </td>
            </tr>
            <tr>
              <td className="p-2 w-1/3 border-b border-slate-200 text-bold">
                Can the chef bring their own equipment?
              </td>
              <td className="p-2 w-2/3 border-b border-slate-200 whitespace-pre-line">
                {client.fields["Can the chef bring their own equipment?"]}
              </td>
            </tr>
            <tr>
              <td className="p-2 w-1/3 border-b border-slate-200 text-bold">
                General kitchen instructions, including garbage disposal
              </td>
              <td className="p-2 w-2/3 border-b border-slate-200 whitespace-pre-line">
                {
                  client.fields[
                    "Garbage Disposal Instructions & Other Kitchen Notes"
                  ]
                }
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full mb-8">
          <tbody>
            <tr
              className="text-center text-base font-bold bg-gray-200"
              style={{ WebkitPrintColorAdjust: "exact" }}
            >
              <th className="p-2 text-left" colSpan="2">
                Grocery Shopping Preferences (if applicable)
              </th>
            </tr>
            <tr>
              <td className="p-2 w-1/3 border-b border-slate-200 text-bold">
                Who will buy the groceries for the booking?
              </td>
              <td className="p-2 w-2/3 border-b border-slate-200 whitespace-pre-line">
                {booking.fields["Who Shops?"]}
              </td>
            </tr>
            <tr>
              <td className="p-2 w-1/3 border-b border-slate-200 text-bold">
                Grocery Shopping Requests:
              </td>
              <td className="p-2 w-2/3 border-b border-slate-200 whitespace-pre-line">
                {client.fields["Grocery Shopping Requests (if applicable)"]}
              </td>
            </tr>
            <tr>
              <td className="p-2 w-1/3 border-b border-slate-200 text-bold">
                Recommended Grocery Store:
              </td>
              <td className="p-2 w-2/3 border-b border-slate-200 whitespace-pre-line">
                {client.fields["Recommended Grocery Store"]}
              </td>
            </tr>
          </tbody>
        </table>
      </main>

      <div className="font-bold text-2xl mt-4 mb-8 uppercase">Recipes</div>

      {recipes?.map(async (recipe, index) => {
        const ingredients = await fetchRecipeIngredients(
          recipe.fields["Recipe Ingredients"]
        );

        return (
          <section key={recipe}>
            <div className="mb-4">
              <div className="text-base font-bold mb-4 underline">
                {recipe.fields["Recipe"]}
              </div>
              <div className="mb-4">
                <span className="font-bold">Active Time:</span>{" "}
                {recipe.fields["Active Time (Min)"] ? (
                  <span>{recipe.fields["Active Time (Min)"]} minutes</span>
                ) : (
                  <span>Unknown</span>
                )}
              </div>
              <div className="mb-4">
                <span className="font-bold">Total Time:</span>{" "}
                {recipe.fields["Total Time (Min)"] ? (
                  <span>{recipe.fields["Total Time (Min)"]} minutes</span>
                ) : (
                  <span>Unknown</span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-bold mb-4">Recipe Ingredients:</div>
              <div className="mb-4 whitespace-pre-line">
                <ul className="list-disc pl-8">
                  {ingredients?.map((ingredient) => (
                    <li key={ingredient}>
                      {ingredient.fields["Ingredient List"]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-bold mb-4">Pictures</div>
              <div className="mb-4">
                <div className="flex flex-row flex-wrap justify-start gap-8">
                  {recipe.fields["Picture"]?.map((picture) => {
                    return (
                      <Image
                        key={picture.id}
                        src={picture.thumbnails.large.url}
                        className="mb-4"
                        width={picture.thumbnails.large.width / 2}
                        height={picture.thumbnails.large.height / 2}
                        alt=""
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-bold mb-4">Cooking Directions</div>
              <div className="mb-4 whitespace-pre-line">
                {recipe.fields["Cooking Directions"]}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-bold mb-4">Storage Instructions</div>
              <div className="mb-4 whitespace-pre-line">
                {recipe.fields["Storage Instructions"]}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-bold mb-4">Notes</div>
              <div className="mb-4 whitespace-pre-line">
                {recipe.fields["Notes"]}
              </div>
            </div>

            {index < recipes.length - 1 && <Separator className="my-8" />}
          </section>
        );
      })}
    </section>
  );
}
