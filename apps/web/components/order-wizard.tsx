"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import { ChevronRight } from "lucide-react";
import { useBookingSchedule } from "@/contexts/booking-schedule-context";

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

export function OrderWizard() {
  const pathname = usePathname();
  const { schedule } = useBookingSchedule();
  const currentStepIdx = steps.findIndex((s) => pathname.startsWith(s.href));

  return (
    <nav
      aria-label="Progress"
      className="w-full px-4 py-3 rounded-none flex items-center"
    >
      <ol className="flex items-center w-full">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          const isSubmitStep = step.href === "/order/submit";
          const isDisabled = isSubmitStep && !schedule;

          return (
            <li key={step.name} className="flex items-center">
              {isCompleted ? (
                <Link
                  href={step.href}
                  className={cn(
                    "font-bold text-sm text-gray-700 transition-colors cursor-pointer hover:underline focus:underline",
                    isDisabled && "pointer-events-none opacity-50"
                  )}
                  tabIndex={0}
                >
                  {step.name}
                </Link>
              ) : (
                <span
                  className={cn(
                    "font-bold text-sm transition-colors",
                    isCurrent ? "text-gray-700" : "text-gray-400",
                    isDisabled && "opacity-50"
                  )}
                >
                  {step.name}
                </span>
              )}
              {idx < steps.length - 1 && (
                <ChevronRight className="mx-4 text-gray-300 w-5 h-5" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
