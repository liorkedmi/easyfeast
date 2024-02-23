import ExtrasMenu from "@/components/menus/extras";
import Menus from "@/components/menus";
import { Suspense } from "react";

export default function ExtrasPage({ searchParams }) {
  return (
    <>
      <section className="flex flex-col items-center justify-between px-4 max-w-4xl m-auto">
        <Menus />

        <Suspense
          fallback={
            <h2 className="text-xs tracking-wider opacity-50">
              Loading menus...
            </h2>
          }
        >
          <ExtrasMenu searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
