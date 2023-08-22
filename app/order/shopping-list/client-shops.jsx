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
    const values = shoppingList.map((item) => item.id);
    const allShoppingList = [];
    const finalShoppingList = [];

    shoppingList.forEach((group) => {
      group.ingredients.forEach((item) => {
        allShoppingList.push(item.id);

        if (!values.ingredients.includes(item.id)) {
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
        <div>
          <FormattedMessage
            id="components.clientShops.message"
            defaultMessage="Please find your supply list below:"
          />
        </div>

        {notes.length > 0 ? (
          <div className="mb-4">
            <Notes notes={notes} shopper="Client" />
          </div>
        ) : null}

        {shoppingList.map((group) => {
          return (
            <div className="mb-4" key={group.section}>
              <div className="font-bold">{group.section}</div>
              <ul>
                {group.ingredients.map((item) => {
                  const id = item.id;

                  return (
                    <>
                      <div>
                        <ol key={id}>
                          {item.ingredient} - {item.amount} {item.unit}{" "}
                          {item.description}
                        </ol>
                      </div>
                    </>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex">
        <Button type="button" variant="default" onClick={() => onPrint()}>
          <FormattedMessage
            id="components.clientShops.button.print"
            defaultMessage="Click to Print"
          />
        </Button>
      </div>
    </>
  );
}
