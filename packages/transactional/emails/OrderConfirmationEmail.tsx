import { Button, Html, Text, Section } from "@react-email/components";
import * as React from "react";

interface OrderConfirmationEmailProps {
  menuSelections: string;
}

export const OrderConfirmationEmail = ({
  menuSelections,
}: OrderConfirmationEmailProps): React.ReactElement => (
  <Html>
    <Section>
      <Text>Thank you for your order!</Text>
      <Text>Here are your menu selections:</Text>
      <Text style={{ whiteSpace: "pre-line" }}>{menuSelections}</Text>
      <Text>We'll process your order shortly.</Text>
    </Section>
  </Html>
);
