import KidsMenu from "@/components/menus/kids";
import Menus from "@/components/menus";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

export default function KidFavoritesPage({ searchParams }) {
  return (
    <>
      <section className="flex flex-col items-center justify-between px-4 max-w-4xl m-auto">
        <Menus />

        <Separator className="mb-4" />

        <Suspense
          fallback={
            <h2 className="text-sm tracking-wider">Loading menus...</h2>
          }
        >
          <KidsMenu searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
