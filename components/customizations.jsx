"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Checkbox } from "@/components/ui/checkbox";

export default function Customizations({ form, data }) {
  return (
    <FormField
      control={form.control}
      name="customizations"
      render={() => (
        <FormItem>
          {data.map((item) => {
            const id = item;

            return (
              <FormField
                key={id}
                control={form.control}
                name="customizations"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, id])
                              : field.onChange(
                                  field.value?.filter((value) => value !== id)
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{item}</FormLabel>
                    </FormItem>
                  );
                }}
              />
            );
          })}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
