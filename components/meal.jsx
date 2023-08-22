"use client";

import * as z from "zod";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";

import AdditionalRequests from "./additional-requests";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Customizations from "./customizations";
import { Input } from "@/components/ui/input";
import RequiredSelections from "./required-selections";
import Variations from "./variations";
import { addItem } from "@/redux/features/basketSlice";
import { data } from "autoprefixer";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRef } from "react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

export default function Meal({
  id,
  name,
  type,
  ingredients = "",
  shoppingList = {},
  recipes = {},
  portion = "Medium",
  requiredSelections = [],
  requiredSelectionsOptions = [],
  customizations = [],
  customizationsOptions = [],
  variations = [],
  variationsOptions = [],
  additionalRequests = "",
}) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const formRef = useRef(null);
  const [open, setOpen] = useState(false);
  const mealInBasket = useSelector((state) =>
    state.basket.items.some((item) => item.id === id)
  );
  const booking = useSelector((state) => state.booking);
  const numberOfMealsInBasket = useSelector(
    (state) =>
      state.basket.items.filter((item) => item.type !== "extras").length
  );
  const numberOfExtrasInBasket = useSelector(
    (state) =>
      state.basket.items.filter((item) => item.type === "extras").length
  );

  const FormSchema = z.object({
    id: z.string(),
    portion: z.enum(["Large", "Medium", "Small"]),
    requiredSelections:
      requiredSelectionsOptions.length > 0
        ? z
            .string()
            .array()
            .min(1, {
              message: "Please select one option.",
            })
            .max(1, {
              message: "Please select one option.",
            })
            .nullable()
        : z.string().array().optional(),
    customizations: z.string().array(),
    variations: z.string().array().optional(),
    additionalRequests: z.string().nullable(),
  });

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id,
      portion,
      requiredSelections,
      customizations,
      variations,
      additionalRequests,
    },
  });
  const { isValid } = form.formState;

  useEffect(() => {
    if (booking.portionSize) {
      form.setValue("portion", booking.portionSize);
    }
  }, [form, booking]);

  const getShoppingList = (data) => {
    let variation = "primary";

    if (data.variations.length > 0) {
      variation = data.variations[0];
    }

    return shoppingList[variation][data.portion];
  };

  const getRecipes = (data) => {
    let variation = "primary";

    if (data.variations.length > 0) {
      variation = data.variations[0];
    }

    return recipes[variation][data.portion];
  };

  function onSubmit(data) {
    const shoppingList = getShoppingList(data);
    const recipes = getRecipes(data);

    const menuItem = {
      id,
      name,
      type,
      shoppingList,
      recipes,
      portion: data.portion,
      requiredSelections: data.requiredSelections,
      customizations: data.customizations,
      variations: data.variations,
      additionalRequests: data.additionalRequests,
    };

    dispatch(addItem(menuItem));

    toast({
      title: intl.formatMessage({
        id: "components.meal.toast.add.title",
        defaultMessage: "Yum :)",
      }),
      description: (
        <div className="mt-2">
          <em className="italic">{name}</em>
          <FormattedMessage
            id="components.meal.toast.add.message"
            defaultMessage="was added to your basket"
          />
        </div>
      ),
    });
  }

  return (
    <div className="border border-input bg-background p-4">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center">
            <div className="text-sm cursor-pointer grow">{name}</div>
            <div>{mealInBasket ? <Check color="#00a94d" /> : null}</div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-4">
            <div className="text-sm mt-2 pt-4 border-t text-gray-700">
              {ingredients.join(", ")}
            </div>

            <Form {...form}>
              <form
                id={`add-meal-form-${id}`}
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                ref={formRef}
              >
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <FormattedMessage
                          id="components.meal.form.portions.label"
                          defaultMessage="Portions"
                        />
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select portion" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Small">
                            <FormattedMessage
                              id="components.meal.form.portions.small"
                              defaultMessage="Small (2 portions)"
                            />
                          </SelectItem>
                          <SelectItem value="Medium">
                            <FormattedMessage
                              id="components.meal.form.portions.medium"
                              defaultMessage="Medium (4 portions)"
                            />
                          </SelectItem>
                          <SelectItem value="Large">
                            <FormattedMessage
                              id="components.meal.form.portions.large"
                              defaultMessage="Large (6 portions)"
                            />
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {requiredSelectionsOptions.length > 0 && (
                  <div>
                    <div className="text-lg mb-2">
                      <FormattedMessage
                        id="components.requiredSelections.title"
                        defaultMessage="Required selections"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <RequiredSelections
                        form={form}
                        data={requiredSelectionsOptions}
                      />
                    </div>
                  </div>
                )}

                {customizationsOptions.length + variationsOptions.length >
                  0 && (
                  <div>
                    <div className="text-lg mb-2">
                      <FormattedMessage
                        id="components.customizations.title"
                        defaultMessage="Customizations"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      {customizationsOptions.length > 0 && (
                        <Customizations
                          form={form}
                          data={customizationsOptions}
                        />
                      )}
                      {variationsOptions.length > 0 && (
                        <Variations form={form} data={variationsOptions} />
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-lg mb-2">
                    <FormattedMessage
                      id="components.additionalRequests.title"
                      defaultMessage="Additional Requests"
                    />
                  </div>
                  <div>
                    <AdditionalRequests form={form} />
                  </div>
                </div>

                <div>
                  <div className="flex flex-row justify-between">
                    <CollapsibleTrigger asChild>
                      <Button type="button" variant="outline">
                        <FormattedMessage
                          id="components.meal.button.cancel"
                          defaultMessage="Cancel"
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <Button
                      type="submit"
                      onClick={() => {
                        if (isValid) {
                          if (formRef.current) {
                            formRef.current.dispatchEvent(
                              new Event("submit", { bubbles: true })
                            );
                          }
                          setOpen(false);
                        }
                      }}
                      disabled={
                        mealInBasket || type !== "extras"
                          ? booking.numberOfMeals === numberOfMealsInBasket
                          : booking.numberOfExtras === numberOfExtrasInBasket
                      }
                    >
                      <FormattedMessage
                        id="components.meal.button.submit"
                        defaultMessage="Save & Add"
                      />
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
