"use client";

import { IntlProvider } from "react-intl";
import messages from "../compiled-lang/en.json";

export default function LocalizationProvider({ children }) {
  return (
    <IntlProvider messages={messages} locale="en" defaultLocale="en">
      {children}
    </IntlProvider>
  );
}
