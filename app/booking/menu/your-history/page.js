import History from "@/components/menus/history";
import Menus from "@/components/menus";
import { Suspense } from "react";

export default function YourHistoryPage({ searchParams }) {
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
          <History searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
