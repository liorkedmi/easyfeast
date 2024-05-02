import base from "@/lib/airtable";

async function getMenus() {
  const result = [];

  const promise = new Promise((resolve, reject) => {
    base("Menus")
      .select({
        pageSize: 100,
        maxRecords: 1000,
        // view: "App View",
        // filterByFormula: "FIND('Current Seasonal Menu', {Tag}) > 0",
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

export async function GET(request) {
  try {
    const menus = await getMenus();

    return new Response(JSON.stringify(menus), {
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
