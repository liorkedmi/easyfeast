"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Textarea } from "@workspace/ui/components/textarea";
import { useEffect } from "react";
import { useUserPreferences } from "@/contexts/user-preferences-context";
import { useBookingSchedule } from "@/contexts/booking-schedule-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { useCart, type CartItem } from "@/contexts/cart-context";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    menuItem: {
      id: string;
      type: "Main" | "Add-on" | "Side";
      name: string;
      description?: string;
      menu: "Main Menu" | "Kosher";
      mealTypes: string[];
      dietaryRestrictions: string[];
      categories: string[];
      cuisine?: string[];
      tags: string[];
      ingredients?: string;
      restriction_Dairy_Free?: string;
      restriction_Gluten_Free?: string;
      restriction_Tree_Nut_Free?: string;
      restriction_Peanut_Free?: string;
      restriction_Egg_Free?: string;
      restriction_Sesame_Free?: string;
      restriction_Soy_Free?: string;
      restriction_No_Pork?: string;
      restriction_No_Shellfish?: string;
      choices_Select_1?: string[];
      choices_Select_Multiple?: string[];
      sides?: { id: string; name: string; ingredients: string }[];
    };
    selections?: {
      portionSize: string;
      singleChoice?: string;
      multipleChoices: string[];
      sides: { id: string; name: string; ingredients: string }[];
      additionalNotes?: string;
      allergenSelections: {
        dairyFree: boolean;
        glutenFree: boolean;
        treeNutFree: boolean;
        peanutFree: boolean;
        eggFree: boolean;
        sesameFree: boolean;
        soyFree: boolean;
        noPork: boolean;
        noShellfish: boolean;
      };
    };
  };
}

export function OrderDialog({ open, onOpenChange, item }: OrderDialogProps) {
  const { preferences } = useUserPreferences();
  const { schedule } = useBookingSchedule();
  const { addItem, updateItem, items } = useCart();
  const singleChoices = item.menuItem.choices_Select_1 || [];
  const multipleChoices = item.menuItem.choices_Select_Multiple || [];
  const sides = item.menuItem.sides || [];

  // Calculate if adding this item would exceed meal limits
  function wouldExceedMealLimits(): boolean {
    const numberOfMeals = preferences?.numberOfMeals || 0;
    const numberOfAddons = preferences?.numberOfAddons || 0;

    // Get current cart items (excluding the item being edited)
    const currentMainItems = items.filter(
      (cartItem) => cartItem.menuItem.type === "Main" && cartItem.id !== item.id
    );
    const currentAddonItems = items.filter(
      (cartItem) =>
        cartItem.menuItem.type === "Add-on" && cartItem.id !== item.id
    );

    // Calculate what the cart would look like after adding this item
    const newMainItems =
      item.menuItem.type === "Main"
        ? [...currentMainItems, item]
        : currentMainItems;
    const newAddonItems =
      item.menuItem.type === "Add-on"
        ? [...currentAddonItems, item]
        : currentAddonItems;

    // Check main meal limit
    if (newMainItems.length > numberOfMeals) {
      return true;
    }

    // Calculate available add-on slots
    const remainingMainSlots = numberOfMeals - newMainItems.length;
    const availableAddonSlots = numberOfAddons + remainingMainSlots;
    const addonMealSlots = Math.ceil(newAddonItems.length / 2);

    // Check add-on limit
    if (addonMealSlots > availableAddonSlots) {
      return true;
    }

    return false;
  }

  const isAddingNewItem = !item.selections?.portionSize;
  const wouldExceedLimits = isAddingNewItem && wouldExceedMealLimits();

  const formSchema = z.object({
    portionSize: z.string().min(1, "Please select a portion size"),
    singleChoice: z
      .string()
      .optional()
      .superRefine((val, ctx) => {
        // If there are single choices available, a selection is required
        if (singleChoices.length > 0 && !val) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select one option",
          });
        }
      }),
    multipleChoices: z.array(z.string()).optional(),
    sides: z
      .array(
        z.object({ id: z.string(), name: z.string(), ingredients: z.string() })
      )
      .optional(),
    additionalNotes: z.string().optional(),
    allergenSelections: z.object({
      dairyFree: z.boolean(),
      glutenFree: z.boolean(),
      treeNutFree: z.boolean(),
      peanutFree: z.boolean(),
      eggFree: z.boolean(),
      sesameFree: z.boolean(),
      soyFree: z.boolean(),
      noPork: z.boolean(),
      noShellfish: z.boolean(),
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portionSize:
        item.selections?.portionSize || preferences?.preferredPortionSize || "",
      singleChoice:
        item.selections?.singleChoice ||
        (singleChoices.length === 1 ? singleChoices[0] : ""),
      multipleChoices:
        item.selections?.multipleChoices ||
        (multipleChoices.length === 1 ? multipleChoices : []),
      sides: item.selections?.sides || (sides.length === 1 ? sides : []),
      additionalNotes: item.selections?.additionalNotes || "",
      allergenSelections: {
        dairyFree:
          item.selections?.allergenSelections?.dairyFree ||
          preferences?.dietaryRestrictions?.some((restriction) =>
            restriction.name.toLowerCase().includes("dairy")
          ) ||
          false,
        glutenFree:
          item.selections?.allergenSelections?.glutenFree ||
          preferences?.dietaryRestrictions?.some((restriction) =>
            restriction.name.toLowerCase().includes("gluten")
          ) ||
          false,
        treeNutFree:
          item.selections?.allergenSelections?.treeNutFree ||
          preferences?.dietaryRestrictions?.some((restriction) =>
            restriction.name.toLowerCase().includes("tree-nut")
          ) ||
          false,
        peanutFree:
          item.selections?.allergenSelections?.peanutFree ||
          preferences?.dietaryRestrictions?.some((restriction) =>
            restriction.name.toLowerCase().includes("peanut")
          ) ||
          false,
        eggFree:
          item.selections?.allergenSelections?.eggFree ||
          preferences?.dietaryRestrictions?.some((restriction) =>
            restriction.name.toLowerCase().includes("egg")
          ) ||
          false,
        sesameFree:
          item.selections?.allergenSelections?.sesameFree ||
          preferences?.dietaryRestrictions?.some((restriction) =>
            restriction.name.toLowerCase().includes("sesame")
          ) ||
          false,
        soyFree:
          item.selections?.allergenSelections?.soyFree ||
          preferences?.dietaryRestrictions?.some((restriction) =>
            restriction.name.toLowerCase().includes("soy")
          ) ||
          false,
        noPork:
          item.selections?.allergenSelections?.noPork ||
          preferences?.dietaryRestrictions?.some((restriction) =>
            restriction.name.toLowerCase().includes("pork")
          ) ||
          false,
        noShellfish:
          item.selections?.allergenSelections?.noShellfish ||
          preferences?.dietaryRestrictions?.some((restriction) =>
            restriction.name.toLowerCase().includes("shellfish")
          ) ||
          false,
      },
    },
  });

  useEffect(() => {
    if (preferences?.preferredPortionSize && !item.selections?.portionSize) {
      form.setValue("portionSize", preferences.preferredPortionSize);
    }
  }, [preferences, form, item.selections?.portionSize]);

  function prepareCartItem(data: FormValues): CartItem {
    return {
      id: item.id,
      menuItem: {
        id: item.menuItem.id,
        type: item.menuItem.type,
        name: item.menuItem.name,
        description: item.menuItem.description,
        menu: item.menuItem.menu,
        mealTypes: item.menuItem.mealTypes,
        dietaryRestrictions: item.menuItem.dietaryRestrictions,
        categories: item.menuItem.categories,
        cuisine: item.menuItem.cuisine,
        tags: item.menuItem.tags,
        ingredients: item.menuItem.ingredients,
        restriction_Dairy_Free: item.menuItem.restriction_Dairy_Free,
        restriction_Gluten_Free: item.menuItem.restriction_Gluten_Free,
        restriction_Tree_Nut_Free: item.menuItem.restriction_Tree_Nut_Free,
        restriction_Peanut_Free: item.menuItem.restriction_Peanut_Free,
        restriction_Egg_Free: item.menuItem.restriction_Egg_Free,
        restriction_Sesame_Free: item.menuItem.restriction_Sesame_Free,
        restriction_Soy_Free: item.menuItem.restriction_Soy_Free,
        restriction_No_Pork: item.menuItem.restriction_No_Pork,
        restriction_No_Shellfish: item.menuItem.restriction_No_Shellfish,
        choices_Select_1: item.menuItem.choices_Select_1,
        choices_Select_Multiple: item.menuItem.choices_Select_Multiple,
        sides: item.menuItem.sides,
      },
      selections: {
        portionSize: data.portionSize,
        singleChoice: data.singleChoice,
        multipleChoices: data.multipleChoices || [],
        sides: data.sides || [],
        additionalNotes: data.additionalNotes,
        allergenSelections: data.allergenSelections,
      },
    };
  }

  function onSubmit(data: FormValues) {
    if (item.selections?.portionSize) {
      // If we're editing an existing item
      updateItem(item.id, prepareCartItem(data));
    } else {
      // If we're adding a new item
      addItem(prepareCartItem(data));
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item.menuItem.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {item.menuItem.description && (
              <p className="text-gray-600">{item.menuItem.description}</p>
            )}

            {item.menuItem.ingredients && (
              <div>
                <h3 className="font-semibold mb-2">Ingredients</h3>
                <p className="text-gray-600">{item.menuItem.ingredients}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="portionSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portion Size</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select portion size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Small">Small</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(item.menuItem.restriction_Dairy_Free ||
              item.menuItem.restriction_Gluten_Free ||
              item.menuItem.restriction_Tree_Nut_Free ||
              item.menuItem.restriction_Peanut_Free ||
              item.menuItem.restriction_Egg_Free ||
              item.menuItem.restriction_Sesame_Free ||
              item.menuItem.restriction_Soy_Free ||
              item.menuItem.restriction_No_Pork ||
              item.menuItem.restriction_No_Shellfish) && (
              <div>
                <h3 className="font-semibold mb-2">
                  Dietary Restrictions & Allergens
                </h3>
                <div className="space-y-2">
                  {item.menuItem.restriction_Dairy_Free && (
                    <FormField
                      control={form.control}
                      name="allergenSelections.dairyFree"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>
                            Dairy Free: {item.menuItem.restriction_Dairy_Free}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )}
                  {item.menuItem.restriction_Gluten_Free && (
                    <FormField
                      control={form.control}
                      name="allergenSelections.glutenFree"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>
                            Gluten Free: {item.menuItem.restriction_Gluten_Free}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )}
                  {item.menuItem.restriction_Tree_Nut_Free && (
                    <FormField
                      control={form.control}
                      name="allergenSelections.treeNutFree"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>
                            Tree-Nut Free:{" "}
                            {item.menuItem.restriction_Tree_Nut_Free}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )}
                  {item.menuItem.restriction_Peanut_Free && (
                    <FormField
                      control={form.control}
                      name="allergenSelections.peanutFree"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>
                            Peanut Free: {item.menuItem.restriction_Peanut_Free}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )}
                  {item.menuItem.restriction_Egg_Free && (
                    <FormField
                      control={form.control}
                      name="allergenSelections.eggFree"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>
                            Egg Free: {item.menuItem.restriction_Egg_Free}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )}
                  {item.menuItem.restriction_Sesame_Free && (
                    <FormField
                      control={form.control}
                      name="allergenSelections.sesameFree"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>
                            Sesame Free: {item.menuItem.restriction_Sesame_Free}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )}
                  {item.menuItem.restriction_Soy_Free && (
                    <FormField
                      control={form.control}
                      name="allergenSelections.soyFree"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>
                            Soy Free: {item.menuItem.restriction_Soy_Free}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )}
                  {item.menuItem.restriction_No_Pork && (
                    <FormField
                      control={form.control}
                      name="allergenSelections.noPork"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>
                            No Pork: {item.menuItem.restriction_No_Pork}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )}
                  {item.menuItem.restriction_No_Shellfish && (
                    <FormField
                      control={form.control}
                      name="allergenSelections.noShellfish"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>
                            No Shellfish:{" "}
                            {item.menuItem.restriction_No_Shellfish}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            )}

            {singleChoices.length > 0 && (
              <FormField
                control={form.control}
                name="singleChoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select One Option</FormLabel>
                    <div className="space-y-2">
                      {singleChoices.map((choice) => (
                        <FormItem
                          key={choice}
                          className="flex items-center space-x-2"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value === choice}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? choice : "");
                              }}
                            />
                          </FormControl>
                          <FormLabel>{choice}</FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {multipleChoices.length > 0 && (
              <FormField
                control={form.control}
                name="multipleChoices"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Multiple Options</FormLabel>
                    <div className="space-y-2">
                      {multipleChoices.map((choice) => (
                        <FormItem
                          key={choice}
                          className="flex items-center space-x-2"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(choice) || false}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                const newValue = checked
                                  ? [...currentValue, choice]
                                  : currentValue.filter((c) => c !== choice);
                                field.onChange(newValue);
                              }}
                            />
                          </FormControl>
                          <FormLabel>{choice}</FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {sides.length > 0 && (
              <FormField
                control={form.control}
                name="sides"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select One Side</FormLabel>
                    <div className="space-y-2">
                      {sides.map(
                        (side: {
                          id: string;
                          name: string;
                          ingredients: string;
                        }) => (
                          <FormItem
                            key={side.id}
                            className="flex items-center space-x-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={
                                  field.value?.some((s) => s.id === side.id) ||
                                  false
                                }
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  if (checked) {
                                    // If checking this side, uncheck all others (single selection)
                                    field.onChange([side]);
                                  } else {
                                    // If unchecking, remove this side
                                    field.onChange(
                                      currentValue.filter(
                                        (s) => s.id !== side.id
                                      )
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel>
                              <div>
                                {side.name}{" "}
                                <span className="text-xs text-gray-600">
                                  ({side.ingredients})
                                </span>
                              </div>
                            </FormLabel>
                          </FormItem>
                        )
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requests or additional information..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {wouldExceedLimits && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-800">
                  <strong>Cannot add to cart:</strong> This would exceed your
                  meal limits. Please remove some items from your cart or adjust
                  your meal preferences.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!schedule || wouldExceedLimits}
            >
              {item.selections?.portionSize ? "Update" : "Add to Cart"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
