"use client";

import { createContext, useContext, ReactNode, useState } from "react";

interface BookingSchedule {
  id: string;
  bookingDate: string;
  status: "Pending" | "Done";
}

interface BookingScheduleContextType {
  schedule: BookingSchedule | null;
  isLoading: boolean;
  error: Error | null;
  refreshSchedule: () => Promise<void>;
}

const BookingScheduleContext = createContext<
  BookingScheduleContextType | undefined
>(undefined);

export function BookingScheduleProvider({
  children,
  initialSchedule,
}: {
  children: ReactNode;
  initialSchedule: BookingSchedule | null;
}) {
  const [schedule, setSchedule] = useState<BookingSchedule | null>(
    initialSchedule
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshSchedule = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/booking-schedule");
      if (!response.ok) {
        throw new Error("Failed to fetch booking schedule");
      }
      const data = await response.json();
      setSchedule(data.schedule);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BookingScheduleContext.Provider
      value={{ schedule, isLoading, error, refreshSchedule }}
    >
      {children}
    </BookingScheduleContext.Provider>
  );
}

export function useBookingSchedule() {
  const context = useContext(BookingScheduleContext);
  if (context === undefined) {
    throw new Error(
      "useBookingSchedule must be used within a BookingScheduleProvider"
    );
  }
  return context;
}
