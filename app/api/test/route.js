import { fetchNextAvailableBooking } from "@/app/actions";

export async function GET(req, res) {
  try {
    const result = await fetchNextAvailableBooking("kedmi.lior@gmail.com");

    return new Response(JSON.stringify(result));
  } catch (error) {
    return new Response(JSON.stringify({ error: error }));
  }
}
