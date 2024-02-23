"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    name: "Seasonal Specials",
    href: "/booking/menu/seasonal-specials",
  },
  {
    name: "Main Menu",
    href: "/booking/menu/main-menu",
  },
  {
    name: "Kid Favorites",
    href: "/booking/menu/kid-favorites",
  },
  {
    name: "Your History",
    href: "/booking/menu/your-history",
  },
  {
    name: "Extras",
    href: "/booking/menu/extras",
  },
];

export default function Menus() {
  const pathname = usePathname();

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="mb-4 flex justify-center items-center">
        {menuItems.map((menuItem, index) => (
          <Link
            href={menuItem.href}
            key={menuItem.href}
            className={cn(
              "flex p-2 items-center justify-center px-4 text-center text-xs tracking-wider transition-colors hover:text-primary",
              pathname?.startsWith(menuItem.href) ||
                (index === 0 && pathname === "/")
                ? "bg-muted font-medium text-primary"
                : "text-muted-foreground"
            )}
          >
            {menuItem.name}
          </Link>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
