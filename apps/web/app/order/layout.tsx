"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import { CartSidebar } from "@/components/cart-sidebar";
import { OrderWizard } from "@/components/order-wizard";
import Link from "next/link";

export default function OrderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid grid-rows-[auto_1fr] h-screen min-h-0">
      <header className="sticky top-0 z-30 flex items-center justify-between p-4 h-16 bg-white border-b">
        <div className="flex items-center gap-8 min-w-0">
          <div className="w-[120px] h-[18px] flex items-center justify-center text-lg font-bold text-gray-400 flex-shrink-0">
            <Link href="/">
              <Image src="/img/logo.png" alt="logo" width={120} height={18} />
            </Link>
          </div>
          <div className="min-w-0 flex-1">
            <OrderWizard />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://www.easyfeast.com/contact-2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-700 hover:text-primary transition-colors px-3 py-2 rounded"
          >
            Contact Us
          </a>
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      <div className="grid grid-cols-[1fr_24rem] h-full min-h-0">
        <div className="overflow-y-auto min-h-0">{children}</div>
        <CartSidebar />
      </div>
    </div>
  );
}
