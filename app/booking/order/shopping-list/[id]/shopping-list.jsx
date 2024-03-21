"use client";

import { selectIngredients, selectNotes } from "@/redux/features/basketSlice";
import { useEffect, useState } from "react";

import ChefShops from "./chef-shops";
import ClientShops from "./client-shops";
import { useSelector } from "react-redux";

// TODO:
//  V Show a clear error message when there are no available bookings
//  - How to configure a variation with both a required selection and other type of customizations? Each one will have their own menu...
//  - Strings
//  - Design (mobile compatible)
//  - Handoff:
//    - Write a guide on how to structure the database for the different options
//    - Clerk
//    - Vercel
//    - Github
//    - Axiom

export default function ShoppingList() {
  const [shoppingList, setShoppingList] = useState(null);
  const ingredients = useSelector(selectIngredients);
  const notes = useSelector(selectNotes);
  const booking = useSelector((state) => state.booking);

  function updateShoppingList() {
    const allShoppingList = [];
    const finalShoppingList = [];

    shoppingList.forEach((group) => {
      group.ingredients.forEach((item) => {
        allShoppingList.push(item.id);
        finalShoppingList.push(item.id);
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
    fetch("/api/shopping-list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ingredients,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const sortedList = data.sort((a, b) => {
          if (
            a.fields["Ingredient Display"][0] <
            b.fields["Ingredient Display"][0]
          ) {
            return -1;
          }

          if (
            a.fields["Ingredient Display"][0] >
            b.fields["Ingredient Display"][0]
          ) {
            return 1;
          }

          return 0;
        });

        const shoppingListMap = new Map();
        sortedList.forEach((item) => {
          if (item.fields["Ingredient Display"] && item.fields.Amount) {
            const id = item.id;
            const ingredient = item.fields["Ingredient Display"][0];
            const unit = item.fields["Unit"][0];
            const section = item.fields["Section of Grocery Store"][0];
            const description = item.fields["Description"];
            const amount = item.fields.Amount;

            if (!shoppingListMap.has(ingredient)) {
              shoppingListMap.set(ingredient, {
                id,
                ingredient,
                unit,
                description,
                section,
                amount,
              });
            } else {
              shoppingListMap.set(ingredient, {
                id,
                ingredient,
                unit,
                description,
                section,
                amount: shoppingListMap.get(ingredient).amount + amount,
              });
            }
          }
        });

        const array = Array.from(
          shoppingListMap,
          ([ingredient, value]) => value
        );

        const groups = [];

        groups["PRODUCE"] = [];
        groups["PANTRY"] = [];
        groups["MEAT"] = [];
        groups["DAIRY"] = [];
        groups["SUPPLIES"] = [];

        array.forEach((item) => {
          if (!groups[item.section]) {
            groups[item.section] = [];
          }

          groups[item.section].push(item);
        });

        const keys = Object.keys(groups);
        const result = [];
        keys.forEach((key) => {
          if (groups[key] && groups[key].length > 0) {
            result.push({
              section: key,
              ingredients: groups[key],
            });
          }
        });

        setShoppingList(result);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [ingredients]);

  useEffect(() => {
    if (booking && shoppingList) {
      const formData = new FormData();

      const reheatingTipsUrl = `${document.location.origin}/report/${booking.id}/reheating-tips`;
      const shoppingListUrl = `${document.location.origin}/report/${booking.id}/shopping-list`;
      const recipesUrl = `${document.location.origin}/report/${booking.id}/recipes`;
      const clientName = booking.clientName;
      const clientAddress = booking.clientAddress;
      const chefEmail = booking.chefEmail;
      const startTime = new Date(booking.datetime);
      const endTime = new Date(booking.datetime);
      endTime.setHours(startTime.getHours() + 4);

      formData.append("reheating_tips_url", reheatingTipsUrl);
      formData.append("shopping_list_url", shoppingListUrl);
      formData.append("recipes_url", recipesUrl);
      formData.append("client", clientName);
      formData.append("location", clientAddress);
      formData.append("recipient", chefEmail);
      formData.append("start_time", startTime.getTime());
      formData.append("end_time", endTime.getTime());

      updateShoppingList();

      fetch(process.env.NEXT_PUBLIC_ZAPIER_BOOKING_WEBHOOK_URL, {
        method: "post",
        body: formData,
      });
    }
  }, [booking, shoppingList]);

  if (!booking || !shoppingList) {
    return (
      <h2 className="text-xs tracking-wider opacity-50">
        Loading shopping list...
      </h2>
    );
  }

  return (
    <>
      <div>
        {booking.shopper === "Chef" && (
          <ChefShops
            booking={booking}
            notes={notes}
            shoppingList={shoppingList}
          />
        )}
        {booking.shopper === "Client" && (
          <ClientShops
            booking={booking}
            notes={notes}
            shoppingList={shoppingList}
          />
        )}
      </div>
    </>
  );
}
