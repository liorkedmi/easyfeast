"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { FormattedMessage, useIntl } from "react-intl";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Notes from "./notes";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function ChefShops({ booking, notes, shoppingList }) {
  const router = useRouter();
  const intl = useIntl();

  const form = useForm({
    defaultValues: {
      ingredients: [],
    },
  });
  const { getValues } = form;

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
        <>
          <div className="flex flex-col gap-2">
            <div className="mt-4">
              <div className="text-sm tracking-wider">
                <p className="mb-4">
                  <FormattedMessage
                    id="components.clientShops.message"
                    defaultMessage="Please mark off each of the items below that you already have in stock at home. That way, we won't purchase more than you need. Otherwise, we'll do our best to only purchase the items we think you need."
                    values={{
                      bookingDate: (
                        <span className="font-bold">
                          {new Date(booking.datetime).toLocaleDateString(
                            "en-US",
                            {
                              dateStyle: "full",
                            }
                          )}
                        </span>
                      ),
                    }}
                  />
                </p>

                {notes.length > 0 ? (
                  <div className="mb-4">
                    <Notes notes={notes} shopper="Chef" />
                  </div>
                ) : null}
              </div>
            </div>

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
                              <FormLabel className="text-lg">
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

          <div className="flex justify-center gap-2 mt-10 print:hidden">
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={() => onSubmit()}
            >
              <FormattedMessage
                id="components.chefShops.button.submit"
                defaultMessage="Submit"
              />
            </Button>
          </div>
        </>
      )}
    </>
  );
}
