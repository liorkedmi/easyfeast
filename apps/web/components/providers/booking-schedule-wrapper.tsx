import { getBookingSchedule } from "@/lib/airtable";
import { currentUser } from "@clerk/nextjs/server";
import { BookingScheduleProvider } from "@/contexts/booking-schedule-context";

export async function BookingScheduleWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user's email from Clerk
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  // Fetch booking schedule if email is available
  let bookingSchedule = null;
  if (email) {
    bookingSchedule = await getBookingSchedule(email);
  }

  return (
    <BookingScheduleProvider initialSchedule={bookingSchedule}>
      {children}
    </BookingScheduleProvider>
  );
}
