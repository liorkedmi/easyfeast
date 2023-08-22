import Image from "next/image";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-between p-24 gap-8">
      <Image
        className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
        src="/logo.png"
        alt="EasyFeast"
        width={182}
        height={27}
        priority
      />

      <SignIn />
    </main>
  );
}
