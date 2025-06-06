import { Geist, Geist_Mono } from "next/font/google";
import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { UserPreferencesWrapper } from "@/components/providers/user-preferences-wrapper";
import { CartProvider } from "@/contexts/cart-context";
import { Toaster } from "@workspace/ui/components/sonner";
import { BookingScheduleWrapper } from "@/components/providers/booking-schedule-wrapper";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <CartProvider>
          <UserPreferencesWrapper>
            <BookingScheduleWrapper>
              <Providers>{children}</Providers>
            </BookingScheduleWrapper>
          </UserPreferencesWrapper>
        </CartProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
