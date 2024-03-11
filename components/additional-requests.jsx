"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { FormattedMessage } from "react-intl";
import { Textarea } from "@/components/ui/textarea";

export default function AdditionalRequests({ form }) {
  return (
    <FormField
      control={form.control}
      name="additionalRequests"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            <FormattedMessage
              id="components.additionalRequests.form.message.label"
              defaultMessage="Your message"
            />
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder={`Anything else you'd like to request for this dish? (e.g., "omit cilantro" or "cook salmon to medium rare")`}
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
