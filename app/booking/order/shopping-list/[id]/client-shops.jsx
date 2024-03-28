"use client";

import { FormattedMessage, useIntl } from "react-intl";

import { Button } from "@/components/ui/button";
import Notes from "./notes";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientShops({ booking, notes, shoppingList }) {
  const router = useRouter();
  const intl = useIntl();

  const onPrint = () => {
    window.print();
  };

  const onSubmit = () => {
    toast({
      title: intl.formatMessage({
        id: "components.booking.toast.add.title",
        defaultMessage: "You are all set!",
      }),
      description: (
        <div className="mt-2">
          <em className="italic">{name}</em>{" "}
          <FormattedMessage
            id="components.booking.toast.add.message"
            defaultMessage="Your booking for {bookingDate} has been confirmed."
            values={{
              bookingDate: (
                <span className="font-bold">
                  {new Date(booking.datetime).toLocaleDateString("en-US", {
                    dateStyle: "full",
                  })}
                </span>
              ),
            }}
          />
        </div>
      ),
    });

    router.push(`/`);
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
        <div className="mt-4">
          <div className="text-sm tracking-wider">
            <p className="mb-4">
              <FormattedMessage
                id="components.clientShops.message"
                defaultMessage="Please find the grocery shopping list for your booking on {bookingDate}. Please purchase each of the items on the list or check that you have the items already in stock at home"
                values={{
                  bookingDate: (
                    <span className="font-bold">
                      {new Date(booking.datetime).toLocaleDateString("en-US", {
                        dateStyle: "full",
                      })}
                    </span>
                  ),
                }}
              />
            </p>

            {notes.length > 0 ? (
              <div className="mb-4">
                <Notes notes={notes} shopper="Client" />
              </div>
            ) : null}

            <p className="mb-4">
              <FormattedMessage
                id="components.clientShops.message2"
                defaultMessage="Don't hesitate to reach out if you have any questions. Thank you and  Easy Feasting!"
              />
            </p>
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
                    <ol key={id} className="text-sm tracking-wider">
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

      <div className="flex justify-center gap-2 mt-10 print:hidden">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onPrint()}
        >
          <FormattedMessage
            id="components.clientShops.button.print"
            defaultMessage="Print"
          />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={() => onSubmit()}
        >
          <FormattedMessage
            id="components.clientShops.button.submit"
            defaultMessage="Submit"
          />
        </Button>
      </div>
    </>
  );
}
