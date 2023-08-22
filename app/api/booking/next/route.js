import base from "@/lib/airtable";
import { clerkClient } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";

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

export async function fetchNextAvailableBooking(email) {
  try {
    const result = [];
    const filterByFormula = `AND({Final Menu}=BLANK(), {Email}='${email}')`;

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

export async function GET(req, res) {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = userId ? await clerkClient.users.getUser(userId) : null;
  const email = user.emailAddresses[0].emailAddress;
  const booking = await fetchNextAvailableBooking(email);
  const client = await fetchClient(email);
  const chef = await fetchChef(booking.fields["Chef"][0]);

  const result = {
    booking,
    numberOfMeals: client.fields["Number of Meals"],
    numberOfExtras: client.fields["Number of Extras"],
    portionSize: client.fields["Portion Size Requested"]?.[0],
    clientAddress: client.fields["Address"],
    clientName: client.fields["Name for Chef Display"],
    chefEmail: chef.fields["Email Address"],
  };

  return new Response(JSON.stringify(result));
}
