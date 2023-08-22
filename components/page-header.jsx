"use client";

import * as React from "react";

import Basket from "@/components/basket";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import WelcomeMessage from "@/components/welcome-message";
import { useUser } from "@clerk/nextjs";

function PageHeader() {
  const { user } = useUser();

  return (
    <header className="flex items-center justify-start w-full mb-8 gap-4">
      <div>
        <Link href="/">
          <Image
            className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
            src="/logo.png"
            alt="EasyFeast"
            width={182}
            height={27}
            priority
          />
        </Link>
      </div>

      {user ? (
        <>
          <div className="grow">
            <WelcomeMessage />
          </div>

          <div>
            <UserButton afterSignOutUrl="/" />
          </div>

          <div>
            <Basket />
          </div>
        </>
      ) : null}
    </header>
  );
}

export default PageHeader;
