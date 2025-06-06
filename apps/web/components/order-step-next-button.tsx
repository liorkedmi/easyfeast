"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { useCart } from "@/contexts/cart-context";

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

export function OrderStepNextButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { items } = useCart();
  const currentStepIdx = steps.findIndex((s) => pathname.startsWith(s.href));
  const nextStep = steps[currentStepIdx + 1];

  if (!nextStep) return null;

  const isSubmitStep = nextStep.href === "/order/submit";
  const isDisabled = isSubmitStep && items.length === 0;

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
