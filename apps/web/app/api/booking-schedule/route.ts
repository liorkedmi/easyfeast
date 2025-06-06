import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import Airtable from "airtable";

const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID!);

export async function GET() {
  try {
    const user = await currentUser();

    if (!user?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const clientLinks = userRecord.fields["Link to Online_Clients"] as
      | string[]
      | undefined;

    if (!clientLinks || clientLinks.length === 0) {
      return NextResponse.json(
        { error: "No client associated with user" },
        { status: 404 }
      );
    }

    const clientId = clientLinks[0];

    const filterByFormula = `AND(
      {Client ID (from Link to Online_Clients)} = '${clientId}',
      {Status} = 'Pending',
      IS_AFTER({Booking Date & Time}, NOW())
    )`;

    // Get the next pending booking schedule
    const scheduleRecords = await airtable("Online_Bookings_Schedule")
      .select({
        filterByFormula,
        sort: [{ field: "Booking Date & Time", direction: "asc" }],
        maxRecords: 1,
      })
      .all();

    if (scheduleRecords.length === 0) {
      return NextResponse.json({ schedule: null });
    }

    const scheduleRecord = scheduleRecords[0];
    if (!scheduleRecord) {
      return NextResponse.json(
        { error: "Invalid schedule record" },
        { status: 500 }
      );
    }

    const schedule = {
      id: scheduleRecord.id,
      bookingDate: scheduleRecord.fields["Booking Date & Time"] as string,
      status: scheduleRecord.fields["Status"] as "Pending" | "Done",
    };

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Error fetching booking schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking schedule" },
      { status: 500 }
    );
  }
}
