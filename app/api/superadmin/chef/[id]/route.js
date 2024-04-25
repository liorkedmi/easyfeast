import base from "@/lib/airtable";

const fetchChef = async (chefId) => {
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
};

export async function GET(request) {
  const id = request.url.split("/").pop();

  try {
    const chef = await fetchChef(id);

    return new Response(JSON.stringify(chef), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (ex) {
    return new Response(JSON.stringify(ex), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
