import base from "@/lib/airtable";
import { clerkClient } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";

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
          pageSize: 100,
          maxRecords: 1000,
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

            return resolve(result);
          }
        );
    });
  } catch (ex) {
    console.log("Error:", ex);
  }
}

export async function POST(req, res) {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const payload = await req.json();
  const ids = payload.ingredients;
  const fetchedData = await fetchShoppingListIngredients(ids);
  return new Response(JSON.stringify(fetchedData));
}
