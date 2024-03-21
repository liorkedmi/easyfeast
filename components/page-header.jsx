"use client";

import * as React from "react";

import Basket from "@/components/basket";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import WelcomeMessage from "@/components/welcome-message";
import { useUser } from "@clerk/nextjs";

function PageHeader({ bookingInfo, menu, mode }) {
  const { user } = useUser();

  return (
    <header className="w-full">
      <div className="flex items-center justify-between gap-4 mb-4">
        <>
          <div className="w-1/2 flex items-center justify-start">
            <Link href="/" className="hover:opacity-75 transition-all">
              <Image
                className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
                src="/logo.png"
                alt="EasyFeast"
                width={118}
                height={18}
                priority
              />
            </Link>
          </div>

          <div className="w-1/2 flex items-center justify-center">
            {menu && (
              <div className="w-full print:hidden">
                <div className="flex items-center justify-end w-full gap-4">
                  {user ? <UserButton afterSignOutUrl="/" /> : null}
                  <Basket />
                </div>
              </div>
            )}
          </div>
        </>
      </div>

      <div
        className="bg-[#004c45] text-white p-2"
        style={{ WebkitPrintColorAdjust: "exact" }}
      >
        <WelcomeMessage bookingInfo={bookingInfo} mode={mode} />
      </div>
    </header>
  );
}

export default PageHeader;
