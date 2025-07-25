"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  // Menu item data
  menuItem: {
    id: string;
    type: "Main" | "Add-on" | "Side";
    name: string;
    description?: string;
    menu: "Main Menu" | "Kosher";
    mealTypes: string[];
    dietaryRestrictions: string[];
    categories: string[];
    cuisine?: string[];
    tags: string[];
    ingredients?: string;
    restriction_Dairy_Free?: string;
    restriction_Gluten_Free?: string;
    restriction_Tree_Nut_Free?: string;
    restriction_Peanut_Free?: string;
    restriction_Egg_Free?: string;
    restriction_Sesame_Free?: string;
    restriction_Soy_Free?: string;
    restriction_No_Pork?: string;
    restriction_No_Shellfish?: string;
    choices_Select_1?: string[];
    choices_Select_Multiple?: string[];
    sides?: { id: string; name: string; ingredients: string }[];
  };
  // Order selections
  selections: {
    portionSize: string;
    singleChoice?: string;
    multipleChoices: string[];
    sides: { id: string; name: string; ingredients: string }[];
    additionalNotes?: string;
    allergenSelections: {
      dairyFree: boolean;
      glutenFree: boolean;
      treeNutFree: boolean;
      peanutFree: boolean;
      eggFree: boolean;
      sesameFree: boolean;
      soyFree: boolean;
      noPork: boolean;
      noShellfish: boolean;
    };
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateItem: (id: string, updatedItem: CartItem) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems((prevItems) => [...prevItems, item]);
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const updateItem = (id: string, updatedItem: CartItem) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? updatedItem : item))
    );
  };

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, updateItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
