"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { Button } from "@workspace/ui/components/button";
import { ChevronDown, ShoppingCart, X, Pencil } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { useUserPreferences } from "@/contexts/user-preferences-context";
import { OrderDialog } from "./order-dialog";

// Calculate meal slot usage
function calculateMealSlots(
  mainMenuItems: any[],
  addonsItems: any[],
  preferences: any
) {
  const mainMealSlots = mainMenuItems.length;
  const addonMealSlots = Math.ceil(addonsItems.length / 2); // 2 add-ons = 1 meal slot
  const numberOfMeals = preferences?.numberOfMeals || 0;
  const numberOfAddons = preferences?.numberOfAddons || 0;

  // Calculate available add-on slots (can exceed base add-on limit if fewer main meals)
  const remainingMainSlots = numberOfMeals - mainMealSlots;
  const availableAddonSlots = numberOfAddons + remainingMainSlots;

  return {
    mainSlots: mainMealSlots,
    addonSlots: addonMealSlots,
    totalUsed: mainMealSlots + addonMealSlots,
    addonsCount: addonsItems.length,
    mainLimit: numberOfMeals,
    addonLimit: availableAddonSlots,
    isMainOverLimit: mainMealSlots > numberOfMeals,
    isAddonOverLimit: addonMealSlots > availableAddonSlots,
  };
}

export function UserCart() {
  const [isOpen, setIsOpen] = useState(true);
  const { items, removeItem } = useCart();
  const { preferences } = useUserPreferences();
  const [editingItem, setEditingItem] = useState<(typeof items)[0] | null>(
    null
  );

  const mainMenuItems = items.filter((item) => item.menuItem.type === "Main");
  const addonsItems = items.filter((item) => item.menuItem.type === "Add-on");
  const mealSlots = calculateMealSlots(mainMenuItems, addonsItems, preferences);

  const numberOfMeals = preferences?.numberOfMeals || 0;
  const numberOfAddons = preferences?.numberOfAddons || 0;
  const totalAvailableSlots = numberOfMeals + numberOfAddons;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2"
    >
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Your Order</h2>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
            <span className="sr-only">Toggle cart</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border p-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>Your cart is empty</p>
              <p className="text-sm">Add items to your cart to see them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${Math.random()}`}
                  className="space-y-2 border-b last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{item.menuItem.name}</h3>
                      <p className="text-sm text-gray-500">
                        Portion: {item.selections.portionSize}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingItem(item)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {item.selections.singleChoice && (
                    <p className="text-sm">
                      Choice: {item.selections.singleChoice}
                    </p>
                  )}

                  {item.selections.multipleChoices.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <p className="text-sm font-bold text-gray-500">
                        Choices:
                      </p>
                      {item.selections.multipleChoices.map((choice) => (
                        <div key={choice} className="text-sm">
                          {choice}
                        </div>
                      ))}
                    </div>
                  )}

                  {item.selections.sides.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <p className="text-sm font-bold text-gray-500">Sides:</p>
                      {item.selections.sides.map((side, index) => (
                        <span key={side.id} className="text-sm">
                          {side.name}
                          {index < item.selections.sides.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.selections.additionalNotes && (
                    <p className="text-sm text-gray-500">
                      Notes: {item.selections.additionalNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
      {editingItem && (
        <OrderDialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
        />
      )}
    </Collapsible>
  );
}
