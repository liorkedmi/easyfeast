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

async function fetchMenus(finalMenu) {
  const result = [];

  const filterByFormula =
    "OR(" +
    finalMenu
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

export default async function BookingReheatingTipsPage({ params }) {
  const booking = await fetchBooking(params.id);
  const menus = await fetchMenus(booking.fields["Final Menu"]);

  return (
    <table class="border-collapse table-auto w-full text-sm">
      <thead>
        <tr>
          <th class="border-b font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 text-left">
            Menu
          </th>
          <th class="border-b font-medium p-4 pt-0 pb-3 text-slate-400 text-left">
            Reheating Tips
          </th>
        </tr>
      </thead>
      <tbody class="bg-white">
        {menus.map((menu) => {
          return (
            <tr key={menu}>
              <td class="border-b border-slate-100 p-4 pl-8 text-slate-500">
                {menu.fields["Your Menu"]}
              </td>
              <td class="border-b border-slate-100 p-4 text-slate-500">
                {menu.fields["Reheating Tips"]}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
