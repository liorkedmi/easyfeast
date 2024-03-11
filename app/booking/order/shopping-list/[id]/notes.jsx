"use client";

import { FormattedMessage } from "react-intl";

export default function ShoppingListNotes({ notes, shopper }) {
  if (!notes) {
    return null;
  }

  return (
    <div className="text-xs tracking-wider">
      <div className="font-medium">
        {shopper === "Chef" ? (
          <FormattedMessage
            id="components.notes.chef.title"
            defaultMessage="You also requested the following adjustments be made to your recipes, your chef will update the grocery shopping list accordingly and omit irrelevant ingredients."
          />
        ) : (
          <FormattedMessage
            id="components.notes.client.title"
            defaultMessage="You requested the following adjustments be made to your meals, please make sure to update your grocery shopping list accordingly and omit irrelevant ingredients."
          />
        )}
      </div>
      <div className="mt-2">
        {notes.map((note, index) => {
          return (
            <div key={`note-${index}`} className="text-destructive">
              - <span className="underline">{note.name}</span>:{" "}
              {note.description}
            </div>
          );
        })}
      </div>
    </div>
  );
}
