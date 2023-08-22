import Email from "@/emails/booking-submitted";
import base from "@/lib/airtable";
import { getAuth } from "@clerk/nextjs/server";

export async function updateBooking(booking) {
  const bookingId = booking.id;

  try {
    const payload = {
      id: bookingId,
      fields: {
        "Shopping List": booking.shoppingList,
        "Final Shopping List": booking.finalShoppingList,
      },
    };

    return new Promise((resolve, reject) => {
      base("Bookings").update([payload], function (err, records) {
        if (err) {
          console.error(err);
          reject(err);
        }

        resolve(records[0]);
      });
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

  const body = await req.json();
  const booking = await updateBooking(body);

  try {
    return new Response(JSON.stringify(booking));
  } catch (error) {
    return new Response(JSON.stringify({ error: error }));
  }
}
