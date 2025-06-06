import { updateUserPreferences } from "@/lib/airtable";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { email, preferences } = body;

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    await updateUserPreferences(email, preferences);
    return new NextResponse("Preferences updated successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
