"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Checkbox } from "@/components/ui/checkbox";

export default function Variations({ form, data }) {
  return (
    <FormField
      control={form.control}
      name="variations"
      render={() => (
        <FormItem>
          {data.map((item) => {
            const id = item.id;

            if (item.fields["Variation Name"].length > 1) {
              //
            } else {
              const name = item.fields["Variation Name"][0];

              return (
                <FormField
                  key={id}
                  control={form.control}
                  name="variations"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={id}
                        className="flex flex-row items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(name)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, name])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== name
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{name}</FormLabel>
                      </FormItem>
                    );
                  }}
                />
              );
            }
          })}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
