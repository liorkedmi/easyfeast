"use client";

import * as React from "react";

import Basket from "@/components/basket";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import WelcomeMessage from "@/components/welcome-message";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/nextjs";

function PageHeader({ bookingInfo, menu, mode }) {
  const { user } = useUser();
  const [backdoorEmail, setBackdoorEmail] = React.useState("");
  const userRole = useSelector((state) => state.booking.clientRole);

  React.useEffect(() => {
    if (document.cookie.indexOf("__backdoor") !== -1) {
      const email = document.cookie
        .split("; ")
        .find((row) => row.startsWith("__backdoor"))
        .split("=")[1];
      setBackdoorEmail(email);
    }
  }, []);

  return (
    <>
      {userRole === "Admin" && (
        <>
          {backdoorEmail && (
            <div className="w-full flex items-center justify-center my-4">
              <div className="p-4 bg-slate-200">
                Impersonating{" "}
                <strong className="font-semibold">{backdoorEmail}</strong>
              </div>
            </div>
          )}
        </>
      )}
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
    </>
  );
}

export default PageHeader;
