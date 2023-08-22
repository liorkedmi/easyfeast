import "../styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import LocalizationProvider from "@/components/localization-provider";
import { Providers } from "@/redux/provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EasyFeast",
  description: "You go conquer the world. We'll worry about dinner.",
};

export default function RootLayout({ children }) {
  return (
    <LocalizationProvider>
      <ClerkProvider>
        <html lang="en">
          <body className={inter.className}>
            <Providers>
              
              {children}
            </Providers>
            <Toaster />
          </body>
        </html>
      </ClerkProvider>
    </LocalizationProvider>
  );
}
