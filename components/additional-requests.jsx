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
              placeholder="Tell us if you have any additional requests..."
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
