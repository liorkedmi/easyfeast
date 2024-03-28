import { Separator } from "@/components/ui/separator";
import base from "@/lib/airtable";

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

export default async function BookingReheatingTipsPage({ params }) {
  const booking = await fetchBooking(params.id);
  const menus = await fetchMenus(booking.fields["Final Menu"]);

  return (
    <section className="flex flex-col items-center justify-between px-4 max-w-4xl m-auto text-xl tracking-wider font-shadowsIntoLight">
      <div className="font-bold text-2xl mt-4 mb-8 uppercase">
        Reheating Tips
      </div>

      {menus.map((menu, index) => (
        <div key={index} className="w-full">
          <div className="text-2xl font-bold mb-4 underline">
            {menu.fields["Your Menu"]}
          </div>
          <div>{menu.fields["Reheating Tips"]}</div>

          {index < menus.length - 1 && <Separator className="my-8" />}
        </div>
      ))}
    </section>
  );
}
