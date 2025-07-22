"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { useCart } from "@/contexts/cart-context";
import { useBookingSchedule } from "@/contexts/booking-schedule-context";
import { useUserPreferences } from "@/contexts/user-preferences-context";

const steps = [
  {
    name: "Household Preferences",
    href: "/order/preferences",
  },
  {
    name: "Select Meals",
    href: "/order/meals",
  },
  {
    name: "Submit Your Booking",
    href: "/order/submit",
  },
];

// Calculate if cart meets meal requirements
function calculateMealRequirements(
  mainMenuItems: any[],
  addonsItems: any[],
  preferences: any
): { isValid: boolean; message?: string } {
  const numberOfMeals = preferences?.numberOfMeals || 0;
  const numberOfAddons = preferences?.numberOfAddons || 0;

  // Check if main menu items exceed the limit
  if (mainMenuItems.length > numberOfMeals) {
    return {
      isValid: false,
      message: `You have ${mainMenuItems.length} main meals but only ${numberOfMeals} allowed. Remove some main meals or adjust your preferences.`,
    };
  }

  // Calculate how many add-on slots are available
  // If you select fewer main meals, you can have more add-ons
  const remainingMainSlots = numberOfMeals - mainMenuItems.length;
  const availableAddonSlots = numberOfAddons + remainingMainSlots;

  // Calculate how many add-on slots the current add-ons use
  const addonMealSlots = Math.ceil(addonsItems.length / 2); // 2 add-ons = 1 meal slot

  // Check if add-ons exceed the available slots
  if (addonMealSlots > availableAddonSlots) {
    return {
      isValid: false,
      message: `You have ${addonsItems.length} add-ons (${addonMealSlots} slots) but only ${availableAddonSlots} add-on slots available. Remove some add-ons or select more main meals.`,
    };
  }

  // No minimum requirement - users can submit with fewer items than their preferences
  return { isValid: true };
}

export function OrderStepNextButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { items } = useCart();
  const { schedule } = useBookingSchedule();
  const { preferences } = useUserPreferences();
  const currentStepIdx = steps.findIndex((s) => pathname.startsWith(s.href));
  const nextStep = steps[currentStepIdx + 1];

  if (!nextStep) return null;

  const isSubmitStep = nextStep.href === "/order/submit";
  const mainMenuItems = items.filter((item) => item.menuItem.type === "Main");
  const addonsItems = items.filter((item) => item.menuItem.type === "Add-on");

  // Calculate meal requirements
  const mealRequirements = calculateMealRequirements(
    mainMenuItems,
    addonsItems,
    preferences
  );

  const isDisabled =
    (isSubmitStep && items.length === 0) ||
    (isSubmitStep && !schedule) ||
    (isSubmitStep && !mealRequirements.isValid);

  return (
    <div className="flex justify-end mt-12">
      <Button
        onClick={() => router.push(nextStep.href)}
        size="lg"
        className="px-8"
        disabled={isDisabled}
      >
        {nextStep.name}
      </Button>
    </div>
  );
}
