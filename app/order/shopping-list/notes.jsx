"use client";

import { FormattedMessage } from "react-intl";

export default function ShoppingListNotes({ notes, shopper }) {
  if (!notes) {
    return null;
  }

  return (
    <div>
      <div className="font-medium text-base uppercase">
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
      <div className="text-red-600">
        {notes.map((note, index) => {
          return <div key={`note-${index}`}>- {note}</div>;
        })}
      </div>
    </div>
  );
}
