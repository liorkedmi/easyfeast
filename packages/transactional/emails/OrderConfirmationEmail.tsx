import { Button, Html, Text, Section } from "@react-email/components";
import * as React from "react";

interface OrderConfirmationEmailProps {
  menuSelections: string;
  culinaryPreferences?: string[];
  groceryPreferences?: string[];
}

export const OrderConfirmationEmail = ({
  menuSelections,
  culinaryPreferences = [],
  groceryPreferences = [],
}: OrderConfirmationEmailProps): React.ReactElement => (
  <Html>
    <Section>
      <Text>Thank you for your order!</Text>
      <Text>Here are your menu selections:</Text>
      <Text style={{ whiteSpace: "pre-line" }}>{menuSelections}</Text>
      {culinaryPreferences.length > 0 && (
        <Text>Culinary Preferences: {culinaryPreferences.join(", ")}</Text>
      )}
      {groceryPreferences.length > 0 && (
        <Text>Grocery Preferences: {groceryPreferences.join(", ")}</Text>
      )}
      <Text>We'll process your order shortly.</Text>
    </Section>
  </Html>
);
