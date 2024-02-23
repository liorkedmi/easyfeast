"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

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

  return (
    <>
      {shoppingList && (
        <div className="flex flex-col gap-2">
          {notes.length > 0 ? (
            <div>
              <Notes notes={notes} shopper="Chef" />
            </div>
          ) : null}

          <div id="shopping-list" className="mt-4">
            <Form {...form}>
              <form className="space-y-6">
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
                                      className="flex flex-row items-center space-x-3 space-y-0"
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
              </form>
            </Form>
          </div>
        </div>
      )}
    </>
  );
}
