"use client";

import { useBookingSchedule } from "@/contexts/booking-schedule-context";
import { UserPreferencesSection } from "@/components/user-preferences-section";
import { UserCart } from "@/components/cart-section";
import { Separator } from "@workspace/ui/components/separator";
import { OrderStepNextButton } from "@/components/order-step-next-button";
import { AlertCircle } from "lucide-react";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: true,
});

export function CartSidebar() {
  const { schedule, isLoading, error } = useBookingSchedule();

  return (
    <aside className="w-full h-full border-l bg-background p-6 flex flex-col justify-between bg-white">
      <div className="space-y-4">
        {/* Booking Date */}
        <div className="rounded-lg">
          <h3 className="text-sm font-medium mb-1">Next Booking</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : error ? (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to load booking schedule</span>
            </div>
          ) : schedule ? (
            <p className="text-sm text-muted-foreground">
              {dateFormatter.format(new Date(schedule.bookingDate))}
            </p>
          ) : (
            <div className="bg-red-50 border border-red-300 rounded-md px-3 py-2 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>No upcoming bookings scheduled</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Preferences Section */}
        <UserPreferencesSection />

        <Separator />

        {/* Cart Section */}
        <UserCart />
      </div>
      <OrderStepNextButton />
    </aside>
  );
}
