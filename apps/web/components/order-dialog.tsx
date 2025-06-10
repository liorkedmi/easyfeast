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
      name: string;
      description?: string;
      menu: "Main Menu" | "Kosher";
      proteinTypes: string[];
      dietaryRestrictions: string[];
      categories: string[];
      cuisine?: string[];
      tags: string[];
      ingredients?: string;
      restriction_Tree_Nut_Free?: string;
      restriction_Peanut_Free?: string;
      restriction_Egg_Free?: string;
      restriction_Sesame_Free?: string;
      choices_Select_1?: string[];
      choices_Select_Multiple?: string[];
      sides?: string[];
    };
    selections?: {
      portionSize: string;
      singleChoice?: string;
      multipleChoices: string[];
      sides: string[];
      additionalNotes?: string;
      allergenSelections: {
        treeNutFree: boolean;
        peanutFree: boolean;
        eggFree: boolean;
        sesameFree: boolean;
      };
    };
  };
}

export function OrderDialog({ open, onOpenChange, item }: OrderDialogProps) {
  const { preferences } = useUserPreferences();
  const { schedule } = useBookingSchedule();
  const { addItem, updateItem } = useCart();
  const singleChoices = item.menuItem.choices_Select_1 || [];
  const multipleChoices = item.menuItem.choices_Select_Multiple || [];
  const sides = item.menuItem.sides || [];

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
    multipleChoices: z
      .array(z.string())
      .optional()
      .superRefine((val, ctx) => {
        // If there are single choices available, a selection is required
        if (multipleChoices.length > 0 && (!val || val.length === 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select at least one option",
          });
        }
      }),
    sides: z
      .array(z.string())
      .optional()
      .superRefine((val, ctx) => {
        // If there are single choices available, a selection is required
        if (sides.length > 0 && (!val || val.length === 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select at least one option",
          });
        }
      }),
    additionalNotes: z.string().optional(),
    allergenSelections: z.object({
      treeNutFree: z.boolean(),
      peanutFree: z.boolean(),
      eggFree: z.boolean(),
      sesameFree: z.boolean(),
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
        treeNutFree:
          item.selections?.allergenSelections?.treeNutFree ||
          preferences?.dietaryRestrictions?.some((restriction) =>
            restriction.name.toLowerCase().includes("tree nut")
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
        name: item.menuItem.name,
        description: item.menuItem.description,
        menu: item.menuItem.menu,
        proteinTypes: item.menuItem.proteinTypes,
        dietaryRestrictions: item.menuItem.dietaryRestrictions,
        categories: item.menuItem.categories,
        cuisine: item.menuItem.cuisine,
        tags: item.menuItem.tags,
        ingredients: item.menuItem.ingredients,
        restriction_Tree_Nut_Free: item.menuItem.restriction_Tree_Nut_Free,
        restriction_Peanut_Free: item.menuItem.restriction_Peanut_Free,
        restriction_Egg_Free: item.menuItem.restriction_Egg_Free,
        restriction_Sesame_Free: item.menuItem.restriction_Sesame_Free,
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
          <DialogTitle>
            {item.selections?.portionSize ? "Edit" : "Add"} {item.menuItem.name}
          </DialogTitle>
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

            <div className="flex flex-wrap gap-2">
              {item.menuItem.proteinTypes.map((type) => (
                <Badge key={type} variant="outline">
                  {type}
                </Badge>
              ))}
              {item.menuItem.dietaryRestrictions.map((restriction) => (
                <Badge key={restriction} variant="outline">
                  {restriction}
                </Badge>
              ))}
              {item.menuItem.categories.map((category) => (
                <Badge key={category} variant="outline">
                  {category}
                </Badge>
              ))}
              {item.menuItem.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
              {item.menuItem.cuisine && (
                <Badge variant="outline">{item.menuItem.cuisine}</Badge>
              )}
            </div>

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

            {(item.menuItem.restriction_Tree_Nut_Free ||
              item.menuItem.restriction_Peanut_Free ||
              item.menuItem.restriction_Egg_Free ||
              item.menuItem.restriction_Sesame_Free) && (
              <div>
                <h3 className="font-semibold mb-2">Allergen Info</h3>
                <div className="space-y-2">
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
                            Tree Nut Free -{" "}
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
                            Peanut Free -{" "}
                            {item.menuItem.restriction_Peanut_Free}
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
                            Egg Free - {item.menuItem.restriction_Egg_Free}
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
                            Sesame Free -{" "}
                            {item.menuItem.restriction_Sesame_Free}
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
                    <FormLabel>Sides</FormLabel>
                    <div className="space-y-2">
                      {sides.map((side) => (
                        <FormItem
                          key={side}
                          className="flex items-center space-x-2"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(side) || false}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                const newValue = checked
                                  ? [...currentValue, side]
                                  : currentValue.filter((s) => s !== side);
                                field.onChange(newValue);
                              }}
                            />
                          </FormControl>
                          <FormLabel>{side}</FormLabel>
                        </FormItem>
                      ))}
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

            <Button type="submit" className="w-full" disabled={!schedule}>
              {item.selections?.portionSize ? "Update" : "Add to Cart"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
