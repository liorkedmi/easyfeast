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
    portionSize: string;
    singleChoice?: string;
    multipleChoices: string[];
    sides: string[];
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

    const userEmail = user.emailAddresses[0].emailAddress;
    const {
      items,
      booking,
      culinaryPreferences = [],
      groceryPreferences = [],
    } = (await request.json()) as OrderRequest;

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

    // Create a text representation of the menu selections
    let menuSelections = items
      .map((item) => {
        const selections = [
          `Item: ${item.menuItem.name}`,
          `Portion: ${item.selections.portionSize}`,
        ];

        if (item.selections.singleChoice) {
          selections.push(`Choice: ${item.selections.singleChoice}`);
        }

        if (item.selections.multipleChoices.length > 0) {
          selections.push(
            `Choices: ${item.selections.multipleChoices.join(", ")}`
          );
        }

        if (item.selections.sides.length > 0) {
          selections.push(`Sides: ${item.selections.sides.join(", ")}`);
        }

        if (item.selections.additionalNotes) {
          selections.push(`Notes: ${item.selections.additionalNotes}`);
        }

        return selections.join("\n");
      })
      .join("\n\n");

    // Add culinary and grocery preferences to the menuSelections string
    if (culinaryPreferences.length > 0) {
      menuSelections += `\n\nCulinary Preferences: ${culinaryPreferences.map((p) => p.name).join(", ")}`;
    }
    if (groceryPreferences.length > 0) {
      menuSelections += `\nGrocery Preferences: ${groceryPreferences.map((p) => p.name).join(", ")}`;
    }

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

    // Get the menus email from settings
    const settingsRecords = await airtable("Online_Settings")
      .select({
        maxRecords: 1,
      })
      .all();

    const menusEmail = settingsRecords[0]?.fields["Menus Email"] as
      | string
      | undefined;

    // Send confirmation email to user
    await sendEmail({
      to: userEmail,
      subject: "Your Easyfeast Menu Has Been Received!",
      react: OrderConfirmationEmail({
        bookingDate: new Date(booking).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        menuSelections: items.map((item) => {
          return {
            name: item.menuItem.name,
            portion: item.selections.portionSize,
            singleChoice: item.selections.singleChoice || "",
            multipleChoices: item.selections.multipleChoices,
            sides: item.selections.sides,
            notes: item.selections.additionalNotes || "",
          };
        }),
        culinaryPreferences: culinaryPreferences.map((p) => p.name),
        groceryPreferences: groceryPreferences.map((p) => p.name),
      }),
    });

    // Send notification email to owner
    if (menusEmail) {
      await sendEmail({
        to: menusEmail,
        subject: "New Order Received - EasyFeast",
        react: NewOrderNotificationEmail({
          menuSelections,
          clientEmail: userEmail,
          culinaryPreferences: culinaryPreferences.map((p) => p.name),
          groceryPreferences: groceryPreferences.map((p) => p.name),
        }),
      });
    }

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
