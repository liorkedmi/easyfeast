import { Button, Html, Text, Section } from "@react-email/components";
import * as React from "react";

interface NewOrderNotificationEmailProps {
  menuSelections: string;
  clientEmail: string;
}

export const NewOrderNotificationEmail = ({
  menuSelections,
  clientEmail,
}: NewOrderNotificationEmailProps): React.ReactElement => (
  <Html>
    <Section>
      <Text>New Order Received!</Text>
      <Text>From: {clientEmail}</Text>
      <Text>Menu Selections:</Text>
      <Text style={{ whiteSpace: "pre-line" }}>{menuSelections}</Text>
    </Section>
  </Html>
);
