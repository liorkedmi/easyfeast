import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import Airtable from "airtable";
import { sendEmail } from "@/lib/email";
import { OrderConfirmationEmail } from "@workspace/transactional/emails/OrderConfirmationEmail";
import { NewOrderNotificationEmail } from "@workspace/transactional/emails/NewOrderNotificationEmail";

// Initialize Airtable
const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID!);

interface MenuItemSelection {
  menuItem: {
    name: string;
  };
  selections: {
    allergenSelections: {
      dairyFree: boolean;
      eggFree: boolean;
      glutenFree: boolean;
      noPork: boolean;
      noShellfish: boolean;
      peanutFree: boolean;
      sesameFree: boolean;
      soyFree: boolean;
      treeNutFree: boolean;
    };
    portionSize: string;
    singleChoice?: string;
    multipleChoices: string[];
    sides: { id: string; name: string; ingredients: string }[];
    additionalNotes?: string;
  };
}

interface Preference {
  name: string;
}

interface OrderRequest {
  items: MenuItemSelection[];
  booking: string;
  culinaryPreferences?: Preference[];
  groceryPreferences?: Preference[];
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();

    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, booking } = (await request.json()) as OrderRequest;

    const userEmail = user.emailAddresses[0].emailAddress;

    // First, find the user in Online_Users table
    const userRecords = await airtable("Online_Users")
      .select({
        filterByFormula: `{Email} = '${userEmail}'`,
        maxRecords: 1,
      })
      .all();

    if (userRecords.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userRecord = userRecords[0];
    if (!userRecord) {
      return NextResponse.json(
        { error: "Invalid user record" },
        { status: 500 }
      );
    }

    if (
      !userRecord.fields["Link to Online_Clients"] ||
      !Array.isArray(userRecord.fields["Link to Online_Clients"])
    ) {
      return NextResponse.json(
        { error: "No client associated with user" },
        { status: 500 }
      );
    }

    const clientId = userRecord.fields["Link to Online_Clients"][0];

    // Then, find the corresponding client record
    const clientRecords = await airtable("Online_Clients")
      .select({
        filterByFormula: `RECORD_ID() = '${clientId}'`,
        maxRecords: 1,
      })
      .all();

    if (clientRecords.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const clientRecord = clientRecords[0];
    if (!clientRecord) {
      return NextResponse.json(
        { error: "Invalid client record" },
        { status: 500 }
      );
    }

    const clientUsers = await airtable("Online_Users")
      .select({
        filterByFormula: `{Client ID (from Link to Online_Clients)} = '${clientId}'`,
      })
      .all();

    // Create a text representation of the menu selections
    let menuSelections = items
      .map((item) => {
        const name = item.menuItem.name;
        let dietaryRestrictions = [];

        if (item.selections.allergenSelections.dairyFree) {
          dietaryRestrictions.push("Dairy-Free");
        }
        if (item.selections.allergenSelections.eggFree) {
          dietaryRestrictions.push("Egg-Free");
        }
        if (item.selections.allergenSelections.glutenFree) {
          dietaryRestrictions.push("Gluten-Free");
        }
        if (item.selections.allergenSelections.noPork) {
          dietaryRestrictions.push("No Pork");
        }
        if (item.selections.allergenSelections.noShellfish) {
          dietaryRestrictions.push("No Shellfish");
        }
        if (item.selections.allergenSelections.peanutFree) {
          dietaryRestrictions.push("Peanut-Free");
        }
        if (item.selections.allergenSelections.sesameFree) {
          dietaryRestrictions.push("Sesame-Free");
        }
        if (item.selections.allergenSelections.soyFree) {
          dietaryRestrictions.push("Soy-Free");
        }
        if (item.selections.allergenSelections.treeNutFree) {
          dietaryRestrictions.push("Tree Nut-Free");
        }

        const sides = item.selections.sides.map((side) => side.name).join(", ");
        const singleChoice = item.selections.singleChoice;
        const multipleChoices = item.selections.multipleChoices.join(", ");
        const notes = item.selections.additionalNotes;
        const portionSize = item.selections.portionSize;

        let result = `- ${name}`;

        if (dietaryRestrictions.length > 0) {
          result += ` (${dietaryRestrictions.join(", ")})`;
        }

        if (sides) {
          result += `, ${sides}`;
        }

        if (singleChoice) {
          result += `, ${singleChoice}`;
        }

        if (multipleChoices) {
          result += `, ${multipleChoices}`;
        }

        if (notes) {
          result += `, ${notes}`;
        }

        result += ` (${portionSize})`;

        return result;
      })
      .join("\n");

    // Create the booking record
    const bookingRecord = await airtable("Online_Bookings").create({
      "Link to Online_Clients": [clientId],
      "Link to Online_Bookings_Schedule": [booking],
      "Time Menu Submitted": new Date().toISOString(),
      "Menu Selections": menuSelections,
      Status: "Pending",
    });

    // Update the linked schedule record to mark it as Submitted
    await airtable("Online_Bookings_Schedule").update(booking, {
      Status: "Submitted",
    });

    clientUsers.forEach(async (user) => {
      const userFirstName = user.fields["First Name"];
      const userLastName = user.fields["Last Name"];
      let clientName = clientRecord.fields["Display Name"];
      const bookingDate = new Date(
        bookingRecord.fields["Booking Date & Time"] as string
      ).toLocaleString("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
      const culinaryPreferenceIds = clientRecord.fields[
        "Culinary Preferences"
      ] as string[];
      const groceryPreferenceIds = clientRecord.fields[
        "Grocery Preferences"
      ] as string[];
      const notes = clientRecord.fields["Notes"] as string;

      let fullNotes = "";
      if (culinaryPreferenceIds && culinaryPreferenceIds.length > 0) {
        const culinaryPreferenceRecords = await airtable(
          "Online_Filter_Culinary_Preferences"
        )
          .select({
            filterByFormula: `OR(${culinaryPreferenceIds.map((id) => `RECORD_ID() = '${id}'`).join(", ")})`,
          })
          .all();
        const culinaryPreferenceNames = culinaryPreferenceRecords
          .map((record) => record.fields.Name)
          .join(", ");
        fullNotes += `- ${culinaryPreferenceNames}\n`;
      }
      if (groceryPreferenceIds && groceryPreferenceIds.length > 0) {
        const groceryPreferenceRecords = await airtable(
          "Online_Filter_Grocery_Preferences"
        )
          .select({
            filterByFormula: `OR(${groceryPreferenceIds.map((id) => `RECORD_ID() = '${id}'`).join(", ")})`,
          })
          .all();
        const groceryPreferenceNames = groceryPreferenceRecords
          .map((record) => record.fields.Name)
          .join(", ");
        fullNotes += `- ${groceryPreferenceNames}\n`;
      }
      if (notes) {
        fullNotes += `- ${notes}\n`;
      }

      if (Array.isArray(clientName) && clientName.length > 0) {
        clientName = clientName[0];
      }

      await fetch(process.env.ZAPIER_WEBHOOK_URL!, {
        method: "POST",
        body: JSON.stringify({
          userEmail: userEmail,
          userFirstName: userFirstName,
          userLastName: userLastName,
          clientName: clientName,
          bookingDate: bookingDate,
          menuSelections: menuSelections,
          notes: fullNotes,
        }),
      });
    });

    return NextResponse.json({ success: true, bookingId: bookingRecord.id });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to submit order", details: errorMessage },
      { status: 500 }
    );
  }
}
