import KidsMenu from "@/components/menus/kids";
import Menus from "@/components/menus";
import { Suspense } from "react";

export default function KidFavoritesPage({ searchParams }) {
  return (
    <>
      <section className="flex flex-col items-center justify-between px-4 max-w-4xl m-auto">
        <Menus />

        <Suspense
          fallback={
            <h2 className="text-xs tracking-wider">Loading menus...</h2>
          }
        >
          <KidsMenu searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
