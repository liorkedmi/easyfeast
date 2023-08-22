import Image from "next/image";
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
        maxRecords: 100,
        view: "Recipes Master",
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
        maxRecords: 100,
        view: "Recipe Ingredients Master",
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
    <>
      <header>
        <div className="text-right text-red-600 text-sm mb-8">
          All contents of this package (including client information and
          recipes) are confidential, property of EasyFeast. DO NOT SHARE, POST
          OR REUSE.
        </div>

        <div className="text-lg bg-yellow-300 p-4 mb-8">
          Hi Chef {chef.fields["Chef First"]}! Here are the details and recipes
          for your booking on
          {dateFormatter.format(
            new Date(booking.fields["Booking Date and Arrival Time"])
          )}{" "}
          at {client.fields["Name for Chef Display"]}. Thanks! :)
        </div>
      </header>
      <main>
        <div className="text-center text-2xl font-bold mb-8">
          Details for Your Booking
        </div>

        <table className="w-full">
          <tr className="text-center text-lg font-bold uppercase bg-gray-400">
            <th colSpan="2">CONTACT INFORMATION</th>
          </tr>
          <tr>
            <td className="text-bold">Client Name:</td>
            <td className="whitespace-pre-line">
              {client.fields["Name for Chef Display"]}
            </td>
          </tr>
          <tr>
            <td className="text-bold">Booking Location:</td>
            <td className="whitespace-pre-line">
              {booking.fields["Booking Address"]}
            </td>
          </tr>

          <tr className="text-center text-lg font-bold uppercase bg-gray-400">
            <th colSpan="2">BOOKING DATE & ARRIVAL TIME</th>
          </tr>
          <tr>
            <td className="text-bold">Booking Date & Time:</td>
            <td className="whitespace-pre-line">
              {dateFormatter.format(
                new Date(booking.fields["Booking Date and Arrival Time"])
              )}
            </td>
          </tr>

          <tr className="text-center text-lg font-bold uppercase bg-gray-400">
            <th colSpan="2">MENU FOR THE BOOKING</th>
          </tr>
          <tr>
            <td className="text-bold">Menu:</td>
            <td className="whitespace-pre-line">
              {menus
                .map((menu) => {
                  return menu.fields["Your Menu"];
                })
                .join(", ")}
            </td>
          </tr>
          <tr>
            <td className="text-bold">Notes:</td>
            <td className="text-red-600 whitespace-pre-line">
              {booking.fields["Notes for chef about the Menu"]}
            </td>
          </tr>

          <tr className="text-center text-lg font-bold uppercase bg-gray-400">
            <th colSpan="2">CLIENT PREFERENCES</th>
          </tr>
          <tr>
            <td className="text-bold">Allergies/Aversions:</td>
            <td className="whitespace-pre-line">
              {client.fields["Allergies/Dislikes:"]}
            </td>
          </tr>
          <tr>
            <td className="text-bold">Likes:</td>
            <td className="whitespace-pre-line">{client.fields["Likes:"]}</td>
          </tr>
          <tr>
            <td className="text-bold">
              Can the chef bring their own equipment?
            </td>
            <td className="whitespace-pre-line">
              {client.fields["Can the chef bring their own equipment?"]}
            </td>
          </tr>
          <tr>
            <td className="text-bold">
              General kitchen instructions, including garbage disposal
            </td>
            <td className="whitespace-pre-line">
              {
                client.fields[
                  "Garbage Disposal Instructions & Other Kitchen Notes"
                ]
              }
            </td>
          </tr>

          <tr className="text-center text-lg font-bold uppercase bg-gray-400">
            <th colSpan="2">GROCERY SHOPPING PREFERENCES (IF APPLICABLE)</th>
          </tr>
          <tr>
            <td className="text-bold">
              Who will buy the groceries for the booking?
            </td>
            <td className="whitespace-pre-line">
              {booking.fields["Who Shops?"]}
            </td>
          </tr>
          <tr>
            <td className="text-bold">Grocery Shopping Requests:</td>
            <td className="whitespace-pre-line">
              {client.fields["Grocery Shopping Requests (if applicable)"]}
            </td>
          </tr>
          <tr>
            <td className="text-bold">Recommended Grocery Store:</td>
            <td className="whitespace-pre-line">
              {client.fields["Recommended Grocery Store"]}
            </td>
          </tr>
        </table>
      </main>

      {recipes.map(async (recipe) => {
        const ingredients = await fetchRecipeIngredients(
          recipe.fields["Recipe Ingredients"]
        );

        return (
          <section key={recipe}>
            <div className="mb-8">
              <div className="text-2xl font-bold mb-8">
                {recipe.fields["Recipe"]}
              </div>
              <div className="mb-8">
                <span className="font-bold">Active Time:</span>{" "}
                {recipe.fields["Active Time (Min)"] ? (
                  <span>{recipe.fields["Active Time (Min)"]} minutes</span>
                ) : (
                  <span>Unknown</span>
                )}
              </div>
              <div className="mb-8">
                <span className="font-bold">Active Time:</span>{" "}
                {recipe.fields["Total Time (Min)"] ? (
                  <span>{recipe.fields["Total Time (Min)"]} minutes</span>
                ) : (
                  <span>Unknown</span>
                )}
              </div>
            </div>

            <div className="mb-8">
              <div className="text-lg font-bold mb-8">Recipe Ingredients</div>
              <div className="mb-8 whitespace-pre-line">
                {ingredients
                  .map((ingredient) => ingredient.fields["Ingredient List"])
                  .join(", ")}
              </div>
            </div>

            <div className="mb-8">
              <div className="text-lg font-bold mb-8">Pictures</div>
              <div className="mb-8">
                <div className="flex flex-row flex-wrap justify-start gap-8">
                  {recipe.fields["Picture"]?.map((picture) => {
                    return (
                      <Image
                        key={picture.id}
                        src={picture.thumbnails.large.url}
                        className="mb-8"
                        width={picture.thumbnails.large.width}
                        height={picture.thumbnails.large.height}
                        alt=""
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-lg font-bold mb-8">Cooking Directions</div>
              <div className="mb-8 whitespace-pre-line">
                {recipe.fields["Cooking Directions"]}
              </div>
            </div>

            <div className="mb-8">
              <div className="text-lg font-bold mb-8">Storage Instructions</div>
              <div className="mb-8 whitespace-pre-line">
                {recipe.fields["Storage Instructions"]}
              </div>
            </div>

            <div className="mb-8">
              <div className="text-lg font-bold mb-8">Notes</div>
              <div className="mb-8 whitespace-pre-line">
                {recipe.fields["Notes"]}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
