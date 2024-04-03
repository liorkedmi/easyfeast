export async function GET(request) {
  console.log("Hey, I'm the backdoor route!");
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const email = searchParams.get("email");

  return new Response("Backdoor enter success!", {
    status: 200,
    headers: { "Set-Cookie": `__backdoor=${email}; Path=/` },
  });
}
