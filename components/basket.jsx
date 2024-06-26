"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDispatch, useSelector } from "react-redux";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormattedMessage } from "react-intl";
import { PopoverClose } from "@radix-ui/react-popover";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { removeItem } from "@/redux/features/basketSlice";
import { useRouter } from "next/navigation";

export default function Basket() {
  const dispatch = useDispatch();
  const router = useRouter();
  const booking = useSelector((state) => state.booking);
  const basket = useSelector((state) => state.basket);
  const numberOfMealsInBasket = useSelector(
    (state) =>
      state.basket.items.filter((item) => item.type !== "extras").length
  );
  const numberOfExtrasInBasket = useSelector(
    (state) =>
      state.basket.items.filter((item) => item.type === "extras").length
  );

  function removeMenuItem(id) {
    dispatch(removeItem(id));
  }

  function submitMenu() {
    fetch("/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: booking.id,
        selections: basket.items.map((item) => ({
          id: item.id,
          name: item.name,
          portion: item.portion,
          requiredSelections: item.requiredSelections,
          variations: item.variations,
          additionalRequests: item.additionalRequests,
          recipes: item.recipes,
        })),
        reheatingTipsUrl: `${document.location.origin}/report/${booking.id}/reheating-tips`,
        shoppingListUrl: `${document.location.origin}/report/${booking.id}/shopping-list`,
        recipesUrl: `${document.location.origin}/report/${booking.id}/recipes`,
      }),
    })
      .then(() => {
        router.push(`/booking/order/shopping-list/${booking.id}`);
      })
      .catch((error) => {
        console.error("Error submitting booking:", error);
      });
  }

  return (
    <Popover>
      <PopoverTrigger>
        <div className="relative">
          <div className="hover:opacity-50 transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.2"
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>

          <Badge
            variant="destructive"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[3px] scale-75"
          >
            {basket.items.length}
          </Badge>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <>
          <div className="text-center text-sm font-semibold tracking-wider mb-6">
            <FormattedMessage
              id="components.basket.title"
              defaultMessage="Selections for your booking {bookingDate}"
              values={{
                bookingDate: (
                  <span>
                    {new Date(booking.datetime).toLocaleDateString("en-US", {
                      dateStyle: "full",
                    })}
                  </span>
                ),
              }}
            />
          </div>
          <div className="text-center text-xs tracking-wider mb-6">
            <FormattedMessage
              id="components.basket.selectionsLeft"
              defaultMessage="You may select {numberOfMeals} more meals and {numberOfExtras} more extras"
              values={{
                numberOfMeals: booking.numberOfMeals - numberOfMealsInBasket,
                numberOfExtras: booking.numberOfExtras - numberOfExtrasInBasket,
              }}
            />
          </div>
          {basket.items.length === 0 ? (
            <div className="text-center text-sm">
              <FormattedMessage
                id="components.basket.empty.message"
                defaultMessage="Your basket is empty"
              />
            </div>
          ) : (
            <div>
              <div className="mb-6">
                {basket.items.map((item, index) => {
                  return (
                    <div key={`basket-${item.id}`}>
                      <div className="flex justify-between">
                        <div className="grow shrink-1 pr-2">
                          <div className="text-sm mb-2">{item.name}</div>
                          {item.requiredSelections.map((item) => (
                            <div
                              key={`basket-menu-item-${item.id}`}
                              className="text-sm pl-2"
                            >
                              - {item}
                            </div>
                          ))}
                          {item.variations.map((item) => (
                            <div
                              key={`basket-menu-item-${item.id}`}
                              className="text-sm pl-2"
                            >
                              - {item}
                            </div>
                          ))}
                          {item.additionalRequests && (
                            <div className="text-sm pl-2">
                              - {item.additionalRequests}
                            </div>
                          )}
                        </div>
                        <div className="grow-0 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeMenuItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {index < basket.items.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <PopoverClose asChild>
                  <Button size="sm" onClick={() => submitMenu()}>
                    <FormattedMessage
                      id="components.basket.submit"
                      defaultMessage="Proceed to grocery shopping list"
                    />
                  </Button>
                </PopoverClose>
              </div>
            </div>
          )}
        </>
      </PopoverContent>
    </Popover>
  );
}
