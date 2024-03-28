
export async function GET(request) {
  return new Response("Backdoor exit success!", {
    status: 200,
    headers: { "Set-Cookie": "__backdoor=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT" },
  });
}
