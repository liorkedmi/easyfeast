"use client";

import { Provider } from "react-redux";
import { TooltipProvider } from "@/components/ui/tooltip";
import { store } from "./store";

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <TooltipProvider>{children}</TooltipProvider>
    </Provider>
  );
}
