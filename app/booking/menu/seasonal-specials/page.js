import Menus from "@/components/menus";
import SeasonalMenu from "@/components/menus/seasonal";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

export default function SeasonalSpecialsPage({ searchParams }) {
  return (
    <>
      <section className="flex flex-col items-center justify-between px-4 max-w-4xl m-auto">
        <Menus />

        <Separator className="mb-4" />

        <Suspense
          fallback={
            <h2 className="text-sm tracking-wider opacity-50">
              Loading menus...
            </h2>
          }
        >
          <SeasonalMenu searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
