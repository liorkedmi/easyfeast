import { Button, Html, Text, Section } from "@react-email/components";
import * as React from "react";

interface NewOrderNotificationEmailProps {
  menuSelections: string;
  clientEmail: string;
  culinaryPreferences?: string[];
  groceryPreferences?: string[];
}

export const NewOrderNotificationEmail = ({
  menuSelections,
  clientEmail,
  culinaryPreferences = [],
  groceryPreferences = [],
}: NewOrderNotificationEmailProps): React.ReactElement => (
  <Html>
    <Section>
      <Text>New Order Received!</Text>
      <Text>From: {clientEmail}</Text>
      <Text>Menu Selections:</Text>
      <Text style={{ whiteSpace: "pre-line" }}>{menuSelections}</Text>
      {culinaryPreferences.length > 0 && (
        <Text>Culinary Preferences: {culinaryPreferences.join(", ")}</Text>
      )}
      {groceryPreferences.length > 0 && (
        <Text>Grocery Preferences: {groceryPreferences.join(", ")}</Text>
      )}
    </Section>
  </Html>
);
