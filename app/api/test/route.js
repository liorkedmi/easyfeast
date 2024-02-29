import { fetchNextAvailableBooking } from "@/app/actions";

export async function GET(req, res) {
  try {
    console.log("Testing...");

    const result = await fetchNextAvailableBooking("kedmi.lior@gmail.com");

    return new Response(JSON.stringify(result));
  } catch (error) {
    console.log("Error", error);
    return new Response(JSON.stringify({ error: error }));
  }
}
