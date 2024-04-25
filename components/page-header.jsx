"use client";

import * as React from "react";

import { LogOut, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Basket from "@/components/basket";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import WelcomeMessage from "@/components/welcome-message";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/nextjs";

function PageHeader({ bookingInfo, menu, mode }) {
  const { user } = useUser();
  const [impersonateOther, setImpersonateOther] = React.useState(false);
  const [backdoorEmail, setBackdoorEmail] = React.useState("");
  const userRole = useSelector((state) => state.booking.clientRole);
  const pathname = usePathname();

  React.useEffect(() => {
    if (document.cookie.indexOf("__backdoor") !== -1) {
      const email = document.cookie
        .split("; ")
        .find((row) => row.startsWith("__backdoor"))
        .split("=")[1];
      setBackdoorEmail(email);
    }
  }, []);

  function stopImpersonation() {
    document.cookie =
      "__backdoor=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.location.reload();
  }

  function toggleImpersonateOther() {
    setImpersonateOther(!impersonateOther);
  }

  function handleBackdoorKeyDown(e) {
    if (e.key === "Enter") {
      document.cookie = `__backdoor=${e.target.value}; Path=/;`;
      document.location.reload();
    }
  }

  return (
    <>
      {userRole === "Admin" && (
        <>
          <div className="flex items-center justify-center gap-4 p-2 text-xs bg-slate-200 fixed bottom-0 right-0 h-[38px]">
            <>
              {!impersonateOther && backdoorEmail && (
                <div>
                  <span>Impersonating: </span>
                  <strong className="font-semibold">{backdoorEmail}</strong>
                </div>
              )}
            </>
            <>
              {impersonateOther && (
                <>
                  <span>Impersonate: </span>
                  <Input
                    type="email"
                    placeholder="Email"
                    className="text-sm h-auto p-0"
                    onKeyDown={(e) => handleBackdoorKeyDown(e)}
                  />
                </>
              )}
            </>

            <div className="flex gap-2">
              {backdoorEmail && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <LogOut
                      className="w-4 h-4 hover:opacity-75 transition-opacity cursor-pointer"
                      onClick={() => stopImpersonation()}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Exit</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <User
                    className="w-4 h-4 hover:opacity-75 transition-opacity cursor-pointer"
                    onClick={() => toggleImpersonateOther()}
                  />
                </TooltipTrigger>
                <TooltipContent>Impersonate Other</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </>
      )}
      <header className="w-full">
        <div className="flex items-center justify-between gap-4 mb-4">
          <>
            <div className="w-1/3 flex items-center justify-center">&nbsp;</div>

            <div className="w-1/3 flex items-center justify-center">
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

            <div className="w-1/3 flex items-center justify-center">
              {menu && (
                <div className="w-full print:hidden">
                  <div className="flex items-center justify-end w-full gap-4">
                    {user ? <UserButton afterSignOutUrl="/" /> : null}
                    {pathname.indexOf("/booking/order/shopping-list") ===
                      -1 && <Basket />}
                  </div>
                </div>
              )}
            </div>
          </>
        </div>

        {pathname.indexOf("/booking/order/shopping-list") === -1 && (
          <div
            className="bg-[#004c45] text-white p-2"
            style={{ WebkitPrintColorAdjust: "exact" }}
          >
            <WelcomeMessage bookingInfo={bookingInfo} mode={mode} />
          </div>
        )}
      </header>
    </>
  );
}

export default PageHeader;
