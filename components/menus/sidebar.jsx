"use client";

import Link from "next/link";

export default function Sidebar({ categories }) {
  const order = ["Poultry", "Meat", "Fish", "Vegetarian", "Vegan"];
  categories.sort((a, b) => {
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);

    if (aIndex === -1 && bIndex === -1) {
      return 0;
    }

    if (aIndex === -1) {
      return 1;
    }

    if (bIndex === -1) {
      return -1;
    }

    return aIndex - bIndex;
  });

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-start justify-center gap-4 sticky top-4">
      {categories.map((category) => (
        <div
          key={`category-${category.label}`}
          className="w-full"
          aria-label={`Jump to ${category.label}`}
        >
          <Link
            href={`#${category.label}`}
            className="block text-xs tracking-wider hover:underline"
          >
            {category.label} ({category.count})
          </Link>
        </div>
      ))}
    </div>
  );
}
