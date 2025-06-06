import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Airtable from "airtable";
import { sendEmail } from "@/lib/email";
import { OrderConfirmationEmail } from "@workspace/transactional/emails/OrderConfirmationEmail";
import { NewOrderNotificationEmail } from "@workspace/transactional/emails/NewOrderNotificationEmail";

// Initialize Airtable
const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID!);

export async function POST(request: Request) {
  try {
    const user = await currentUser();

    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0].emailAddress;
    const { items, booking } = await request.json();

    // First, find the user in Online_Users table
    const userRecords = await airtable("Online_Users")
      .select({
        filterByFormula: `{Email} = '${userEmail}'`,
        maxRecords: 1,
      })
      .all();

    if (userRecords.length === 0) {
      console.log("User not found in Online_Users table");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userRecord = userRecords[0];
    if (!userRecord) {
      console.log("User record is undefined");
      return NextResponse.json(
        { error: "Invalid user record" },
        { status: 500 }
      );
    }

    if (
      !userRecord.fields["Link to Online_Clients"] ||
      !Array.isArray(userRecord.fields["Link to Online_Clients"])
    ) {
      console.log("No client link found in user record");
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
      console.log("Client record not found for user");
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const clientRecord = clientRecords[0];
    if (!clientRecord) {
      console.log("Client record is undefined");
      return NextResponse.json(
        { error: "Invalid client record" },
        { status: 500 }
      );
    }

    // Create a text representation of the menu selections
    const menuSelections = items
      .map((item: any) => {
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
      subject: "Order Confirmation - EasyFeast",
      react: OrderConfirmationEmail({ menuSelections }),
    });

    // Send notification email to owner
    if (menusEmail) {
      await sendEmail({
        to: menusEmail,
        subject: "New Order Received - EasyFeast",
        react: NewOrderNotificationEmail({
          menuSelections,
          clientEmail: userEmail,
        }),
      });
    }

    return NextResponse.json({ success: true, bookingId: bookingRecord.id });
  } catch (error) {
    console.error("Error submitting order:", error);
    return NextResponse.json(
      { error: "Failed to submit order" },
      { status: 500 }
    );
  }
}
