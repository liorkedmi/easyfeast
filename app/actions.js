"use server";

import base from "@/lib/airtable";
import { currentUser } from "@clerk/nextjs";

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

export async function fetchNextAvailableBooking(email) {
  try {
    const result = [];
    const filterByFormula = `AND({Final Menu}=BLANK(), {Email}='${email}', IS_AFTER({Booking Date and Arrival Time}, NOW()))`;

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
              return reject(new Error("No bookings found"));
            }

            return resolve(result[0]);
          }
        );
    });
  } catch (ex) {
    console.log("Error:", ex);
  }
}

export async function getSessionInfo(id = null, backdoorEmail = null) {
  // For testing purposes, we allow passing the user email address as a parameter
  try {
    let user;
    let email;

    user = await currentUser();

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (backdoorEmail) {
      email = backdoorEmail;
    } else {
      email = user.emailAddresses[0].emailAddress;
    }

    let booking = null;

    if (id) {
      booking = await fetchBooking(id);
    } else {
      booking = await fetchNextAvailableBooking(email);
    }

    const client = await fetchClient(email);
    const chef = await fetchChef(booking.fields["Chef"][0]);

    console.log("Booking:" + JSON.stringify(booking.fields));
    console.log("Client:" + JSON.stringify(client.fields));
    console.log("Chef:" + JSON.stringify(chef.fields));

    const result = {
      booking: {
        id: booking.id,
        fields: {
          ...booking.fields,
        },
      },
      numberOfMeals: client.fields["Number of Meals"],
      numberOfExtras: client.fields["Number of Extras"],
      portionSize: client.fields["Portion Size Requested"]?.[0],
      clientAddress: client.fields["Address"],
      clientName: client.fields["Name for Chef Display"],
      clientRole: client.fields["Role"],
      chefName: chef.fields["Name"],
      chefEmail: chef.fields["Email Address"],
    };

    return result;
  } catch (ex) {
    // console.log("Error.toString:" + ex.toString());
    // console.log("Error.message:" + ex.message);
    return { error: true, error: ex.message };
  }
}
