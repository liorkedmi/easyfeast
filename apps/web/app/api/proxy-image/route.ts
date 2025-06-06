import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();

    // Return the buffer with the original content type
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType || "application/pdf",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error proxying file:", error);
    return new NextResponse("Error proxying file", { status: 500 });
  }
}
 