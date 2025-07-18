"use client";

import { useCart } from "@/contexts/cart-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { useBookingSchedule } from "@/contexts/booking-schedule-context";
import { useUserPreferences } from "@/contexts/user-preferences-context";

export default function ReviewPage() {
  const { items, clearCart } = useCart();
  const { schedule, refreshSchedule } = useBookingSchedule();
  const { preferences } = useUserPreferences();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!schedule?.id) {
      toast.error("No booking selected");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/order/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          booking: schedule.id,
          culinaryPreferences: preferences?.culinaryPreferences || [],
          groceryPreferences: preferences?.groceryPreferences || [],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit order");
      }

      // Clear the cart and redirect to success page
      clearCart();
      // Add a small delay to ensure Airtable update has completed
      await refreshSchedule();
      router.push("/order/success");
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit order"
      );
      router.push("/order/error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Review Your Order</h1>
          <Button
            variant="outline"
            onClick={() => router.push("/order/meals")}
            className="flex items-center gap-2"
          >
            ← Back to Menu
          </Button>
        </div>
        <p className="text-lg mb-8">
          Please review your selections before submitting your order.
        </p>

        {items.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>Your cart is empty</p>
            <Button
              onClick={() => router.push("/order/meals")}
              className="mt-4"
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {items.map((item) => {
                const choices = [
                  ...(item.selections.singleChoice
                    ? [item.selections.singleChoice]
                    : []),
                  ...item.selections.multipleChoices,
                ];

                return (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <h3 className="font-medium">{item.menuItem.name}</h3>
                    <p className="text-sm text-gray-500">
                      Portion: {item.selections.portionSize}
                    </p>
                    {choices.length > 0 && (
                      <p className="text-sm">Choices: {choices.join(", ")}</p>
                    )}
                    {item.selections.sides.length > 0 && (
                      <p className="text-sm">
                        Sides:{" "}
                        {item.selections.sides
                          .map((side) => side.name)
                          .join(", ")}
                      </p>
                    )}
                    {item.selections.additionalNotes && (
                      <p className="text-sm text-gray-500">
                        Notes: {item.selections.additionalNotes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !schedule?.bookingDate}
                size="lg"
                className="px-8"
              >
                {isSubmitting ? "Submitting..." : "Submit Order"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
