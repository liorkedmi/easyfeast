"use client";

import Image from "next/image";
import { Card, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { useState } from "react";
import { OrderDialog } from "./order-dialog";

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    picture: string;
    description?: string;
    menu: "Main Menu" | "Kosher";
    proteinTypes: string[];
    dietaryRestrictions: string[];
    categories: string[];
    cuisine?: string[];
    tags: string[];
    ingredients?: string;
    restriction_Dairy_Free?: string;
    restriction_Gluten_Free?: string;
    restriction_Tree_Nut_Free?: string;
    restriction_Peanut_Free?: string;
    restriction_Egg_Free?: string;
    restriction_Sesame_Free?: string;
    choices_Select_1?: string[];
    choices_Select_Multiple?: string[];
    sides?: string[];
  };
}

export function MenuItem({ item }: MenuItemProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer bg-gray-100 py-0"
        onClick={() => setDialogOpen(true)}
      >
        <div className="flex">
          <div className="relative w-32 h-32 bg-white border-r border-gray-200 overflow-hidden">
            <Image
              src={item.picture}
              alt={item.name}
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 768px) 100vw, 33vw"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPj4+Oj5CQkJCQkJCQkJCQkJCQkJCQkJCQkL/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </div>
          <CardHeader className="flex-1 p-3">
            <CardTitle className="text-sm">{item.name}</CardTitle>
          </CardHeader>
        </div>
      </Card>
      <OrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={{
          id: item.id,
          menuItem: {
            id: item.id,
            name: item.name,
            description: item.description,
            menu: item.menu,
            proteinTypes: item.proteinTypes,
            dietaryRestrictions: item.dietaryRestrictions,
            categories: item.categories,
            cuisine: item.cuisine,
            tags: item.tags,
            ingredients: item.ingredients,
            restriction_Tree_Nut_Free: item.restriction_Tree_Nut_Free,
            restriction_Peanut_Free: item.restriction_Peanut_Free,
            restriction_Egg_Free: item.restriction_Egg_Free,
            restriction_Sesame_Free: item.restriction_Sesame_Free,
            choices_Select_1: item.choices_Select_1,
            choices_Select_Multiple: item.choices_Select_Multiple,
            sides: item.sides,
          },
        }}
      />
    </>
  );
}
