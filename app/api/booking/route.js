import Email from "@/emails/booking-submitted";
import base from "@/lib/airtable";
import { getAuth } from "@clerk/nextjs/server";

export async function submitBooking(booking) {
  const bookingId = booking.id;
  const finalMenu = [];
  const portionSize = [];
  const recipes = [];
  let notes = "";

  booking.selections.forEach((item) => {
    finalMenu.push(item.id);
    portionSize.push(`${item.name} - ${item.portion}`);

    item.recipes.forEach((recipe) => {
      recipes.push(recipe);
    });

    const itemNotes = [];

    item.customizations.forEach((selection) => {
      itemNotes.push(selection);
    });

    if (item.additionalRequests) {
      itemNotes.push(item.additionalRequests);
    }

    if (itemNotes.length > 0) {
      notes += `${item.name} - ${itemNotes.join(", ")}\n`;
    }
  });

  try {
    const payload = {
      id: bookingId,
      fields: {
        "Final Menu": finalMenu,
        "Portion Size": portionSize.join("\n"),
        "Notes for chef about the Menu": notes,
        "All Recipes for Booking": recipes,
        "Recipes URL": booking.recipesUrl,
        "Reheating Tips URL": booking.reheatingTipsUrl,
        "Shopping List URL": booking.shoppingListUrl,
      },
    };

    for (let i = 0; i < 11; i++) {
      if (recipes[i]) {
        let fieldName = `${i + 1}th Recipe`;

        if (i === 0) {
          fieldName = `1st Recipe`;
        } else if (i === 1) {
          fieldName = `2nd Recipe`;
        } else if (i === 2) {
          fieldName = `3rd Recipe`;
        }

        payload.fields[fieldName] = [recipes[i]];
      }
    }

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
  const booking = await submitBooking(body);

  try {
    return new Response(JSON.stringify(booking));
  } catch (error) {
    return new Response(JSON.stringify({ error: error }));
  }
}
