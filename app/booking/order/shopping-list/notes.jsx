"use client";

import { FormattedMessage } from "react-intl";

export default function ShoppingListNotes({ notes, shopper }) {
  if (!notes) {
    return null;
  }

  return (
    <div className="text-xs tracking-wider text-destructive">
      <div className="font-medium uppercase">
        {shopper === "Chef" ? (
          <FormattedMessage
            id="components.notes.chef.title"
            defaultMessage="Client requested the following adjustments, please update the grocery shopping list accordingly"
          />
        ) : (
          <FormattedMessage
            id="components.notes.client.title"
            defaultMessage="You requested the following adjustments, please update the grocery shopping list accordingly"
          />
        )}
      </div>
      <div className="mt-2">
        {notes.map((note, index) => {
          return (
            <div key={`note-${index}`}>
              - <span className="underline">{note.name}</span>:{" "}
              {note.description}
            </div>
          );
        })}
      </div>
    </div>
  );
}
