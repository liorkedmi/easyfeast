"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { createUrl } from "@/lib/utils";

export default function Filters({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <>
      {categories.map((category) => (
        <div key={`filter-${category}`} className="items-top flex space-x-2">
          <Checkbox
            id={`filter-${category}`}
            checked={searchParams?.get("filter")?.indexOf(category) > -1}
            onCheckedChange={(checked) => {
              const newParams = new URLSearchParams(searchParams.toString());
              const currentFilter = (newParams.get("filter") || "")?.split(",");
              let newFilter = currentFilter;

              if (checked) {
                newFilter.push(category);
                newParams.set("filter", newFilter.join(","));
              } else {
                newFilter = newFilter.filter((item) => item !== category);
                newParams.set("filter", newFilter.join(","));
              }

              router.push(createUrl("/", newParams));
            }}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor={`filter-${category}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {category}
            </label>
          </div>
        </div>
      ))}
    </>
  );
}
