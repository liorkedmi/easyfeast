import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
export default function Page() {
  return (
    <div className="flex flex-col gap-8 h-screen w-screen items-center justify-center">
      <div className="">
        <Image src="/img/logo.png" alt="logo" width={200} height={30} />
      </div>
      <SignIn />
    </div>
  );
}
