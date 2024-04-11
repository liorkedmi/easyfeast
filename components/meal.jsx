"use client";

import * as z from "zod";

import { Check, ChevronDown, ChevronUp } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import RequiredSelections from "./required-selections";
import Variations from "./variations";
import { addItem } from "@/redux/features/basketSlice";
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
  variations = [],
  variationsOptions = [],
  additionalRequests = "",
}) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const formRef = useRef(null);
  const [open, setOpen] = useState(false);
  const mealInBasket = useSelector((state) =>
    state.basket.items.some((item) => item.id === id || item.originalId === id)
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
    variations: z.string().array().optional(),
    additionalRequests: z.string().nullable(),
  });

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id,
      portion,
      requiredSelections,
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

  const getMealInfo = (data) => {
    let meal = {
      id,
      name,
      type,
      shoppingList: shoppingList["primary"][data.portion],
      recipes: recipes["primary"][data.portion],
      portion: data.portion,
      requiredSelections: data.requiredSelections,
      variations: data.variations,
      additionalRequests: data.additionalRequests,
    };

    let variationName = [];

    if (data.requiredSelections.length > 0) {
      variationName = [...variationName, ...data.requiredSelections];
    }

    if (data.variations.length > 0) {
      variationName = [...variationName, ...data.variations];
    }

    const selectedVariation = variationName.sort().join();

    for (let i = 0; i < variationsOptions.length; i++) {
      const currentVariation = variationsOptions[i].fields["Variation Name"]
        .sort()
        .join();

      if (selectedVariation === currentVariation) {
        meal.id = variationsOptions[i].id;
        meal.name = variationsOptions[i].fields["Your Menu"];
        meal.shoppingList = shoppingList[currentVariation][data.portion];
        meal.recipes = recipes[currentVariation][data.portion];
        meal.originalId = id;
        break;
      }
    }

    return meal;
  };

  function getLimitNote() {
    if (mealInBasket) {
      return;
    }

    if (type !== "extras") {
      if (booking.numberOfMeals === numberOfMealsInBasket) {
        return intl.formatMessage({
          id: "components.meal.note.meals.limit",
          defaultMessage: "You have reached the limit of meals",
        });
      }
    } else {
      if (booking.numberOfExtras === numberOfExtrasInBasket) {
        return intl.formatMessage({
          id: "components.meal.note.extras.limit",
          defaultMessage: "You have reached the limit of extras",
        });
      }
    }
  }

  function onSubmit(data) {
    const meal = getMealInfo(data);

    dispatch(addItem(meal));

    toast({
      title: intl.formatMessage({
        id: "components.meal.toast.add.title",
        defaultMessage: "Yum :)",
      }),
      description: (
        <div className="mt-2">
          <em className="italic">{name}</em>{" "}
          <FormattedMessage
            id="components.meal.toast.add.message"
            defaultMessage="was added to your basket"
          />
        </div>
      ),
    });
  }

  return (
    <div className="border border-input bg-background p-4 hover:border-primary/70 transition-all">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="flex items-center gap-2 grow">
              <div className="text-sm tracking-wider">{name}</div>
              <div>
                {mealInBasket ? <Check color="#00a94d" size={16} /> : null}
              </div>
            </div>
            <div>
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-4 w-full">
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
                      <div className="text-base">
                        <FormattedMessage
                          id="components.meal.form.portions.label"
                          defaultMessage="Portions"
                        />
                      </div>

                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select portion" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Small">
                            <FormattedMessage
                              id="components.meal.form.portions.small"
                              defaultMessage="Small (~2 servings)"
                            />
                          </SelectItem>
                          <SelectItem value="Medium">
                            <FormattedMessage
                              id="components.meal.form.portions.medium"
                              defaultMessage="Medium (~4 servings)"
                            />
                          </SelectItem>
                          <SelectItem value="Large">
                            <FormattedMessage
                              id="components.meal.form.portions.large"
                              defaultMessage="Large (~6 servings)"
                            />
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {requiredSelectionsOptions.length > 0 && (
                  <div>
                    <div className="text-base mb-2">
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

                {variationsOptions.length > 0 && (
                  <div>
                    <div className="text-base mb-2">
                      <FormattedMessage
                        id="components.customizations.title"
                        defaultMessage="Customizations"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      {variationsOptions.length > 0 && (
                        <Variations form={form} data={variationsOptions} />
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-base mb-2">
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
                  <div className="flex flex-row justify-between gap-4">
                    <CollapsibleTrigger asChild>
                      <Button type="button" size="sm" variant="outline">
                        <FormattedMessage
                          id="components.meal.button.cancel"
                          defaultMessage="Cancel"
                        />
                      </Button>
                    </CollapsibleTrigger>

                    <div className="flex justify-end items-center grow">
                      <span className="text-sm tracking-wider font-medium text-destructive">
                        {getLimitNote()}
                      </span>
                    </div>

                    <Button
                      type="submit"
                      size="sm"
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
                        mealInBasket ||
                        (type !== "extras"
                          ? booking.numberOfMeals === numberOfMealsInBasket
                          : booking.numberOfExtras === numberOfExtrasInBasket)
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
