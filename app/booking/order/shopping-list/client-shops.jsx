"use client";

import { Button } from "@/components/ui/button";
import { FormattedMessage } from "react-intl";
import Notes from "./notes";
import { useEffect } from "react";

export default function ClientShops({ booking, notes, shoppingList }) {
  const onPrint = () => {
    window.print();
  };

  function updateShoppingList() {
    const values = shoppingList
      .map((group) => group.ingredients)
      .flat()
      .map((item) => item.id);
    const allShoppingList = [];
    const finalShoppingList = [];

    shoppingList.forEach((group) => {
      group.ingredients.forEach((item) => {
        allShoppingList.push(item.id);

        if (!values.includes(item.id)) {
          finalShoppingList.push(item.id);
        }
      });
    });

    fetch("/api/booking/shopping-list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: booking.id,
        shoppingList: allShoppingList,
        finalShoppingList: finalShoppingList,
      }),
    });
  }

  useEffect(() => {
    updateShoppingList();
  });

  return (
    <>
      <div className="flex flex-col gap-2">
        {notes.length > 0 ? (
          <div>
            <Notes notes={notes} shopper="Client" />
          </div>
        ) : null}

        <div className="mt-4">
          <div className="text-xs tracking-wider">
            <FormattedMessage
              id="components.clientShops.message"
              defaultMessage="Please find your supply list here:"
            />
          </div>
        </div>

        {shoppingList.map((group) => {
          return (
            <div className="mt-4" key={group.section}>
              <div className="font-bold">{group.section}</div>
              <ul>
                {group.ingredients.map((item) => {
                  const id = item.id;

                  return (
                    <ol key={id} className="text-xs tracking-wider">
                      {item.ingredient} - {item.amount} {item.unit}{" "}
                      {item.description}
                    </ol>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex mt-4">
        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={() => onPrint()}
        >
          <FormattedMessage
            id="components.clientShops.button.print"
            defaultMessage="Click to Print"
          />
        </Button>
      </div>
    </>
  );
}
