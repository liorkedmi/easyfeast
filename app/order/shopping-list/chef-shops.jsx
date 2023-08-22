"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormattedMessage } from "react-intl";
import Notes from "./notes";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";

export default function ChefShops({ booking, notes, shoppingList }) {
  const form = useForm({
    defaultValues: {
      ingredients: [],
    },
  });
  const { getValues } = form;

  async function updateShoppingList() {
    const values = getValues();
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

  // async function onSubmit(data) {
  //   const formData = new FormData();

  //   const reheatingTips = `${document.location.origin}/booking/${booking.id}/reheating-tips`;
  //   const shoppingList = `${document.location.origin}/booking/${booking.id}/shopping-list`;
  //   const recipes = `${document.location.origin}/booking/${booking.id}/recipes`;
  //   const clientName = booking.clientName;
  //   const clientAddress = booking.clientAddress;
  //   const chefEmail = booking.chefEmail;
  //   const startTime = new Date(booking.datetime).getTime();
  //   const endTime = new Date(
  //     new Date(booking.datetime).getTime() + 4 * 60 * 60 * 1000
  //   ); // 4 hours later

  //   formData.append("reheating_tips_url", reheatingTips);
  //   formData.append("shopping_list_url", shoppingList);
  //   formData.append("recipes_url", recipes);
  //   formData.append("client", clientName);
  //   formData.append("location", clientAddress);
  //   formData.append("recipient", chefEmail);
  //   formData.append("start_time", startTime);
  //   formData.append("end_time", endTime);

  //   updateShoppingList();

  //   const response = await fetch(
  //     process.env.NEXT_PUBLIC_ZAPIER_BOOKING_WEBHOOK_URL,
  //     {
  //       method: "post",
  //       body: formData,
  //     }
  //   );

  //   console.log(response);
  // }

  return (
    <>
      {shoppingList && (
        <div className="flex flex-col gap-2">
          <div>
            <FormattedMessage
              id="components.chefShops.message"
              defaultMessage="Let us know which ingredients you already have at home, so we don't buy more than you need."
            />
          </div>

          {notes.length > 0 ? (
            <div className="mb-4">
              <Notes notes={notes} shopper="Chef" />
            </div>
          ) : null}

          <div id="shopping-list">
            <Form {...form}>
              <form
                // onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="ingredients"
                  render={() => (
                    <>
                      {shoppingList.map((group) => (
                        <FormItem key={group.section}>
                          <div className="mb-4">
                            <FormLabel className="text-base">
                              {group.section}
                            </FormLabel>
                          </div>
                          {group.ingredients.map((item) => {
                            const id = item.id;

                            return (
                              <FormField
                                key={id}
                                control={form.control}
                                name="ingredients"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(id)}
                                          onCheckedChange={(checked) => {
                                            const result = checked
                                              ? field.onChange([
                                                  ...field.value,
                                                  id,
                                                ])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== id
                                                  )
                                                );

                                            updateShoppingList();

                                            return result;
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel
                                        className={cn(
                                          "font-normal",
                                          field.value?.includes(id)
                                            ? "line-through"
                                            : ""
                                        )}
                                      >
                                        {item.ingredient} - {item.amount}{" "}
                                        {item.unit} {item.description}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            );
                          })}
                        </FormItem>
                      ))}
                    </>
                  )}
                />

                <Button type="submit">
                  <FormattedMessage
                    id="components.chefShops.button.submit"
                    defaultMessage="Submit"
                  />
                </Button>
              </form>
            </Form>
          </div>
        </div>
      )}
    </>
  );
}
