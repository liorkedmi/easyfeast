"use client";

import { createContext, useContext, ReactNode, useState } from "react";

interface UserPreferences {
  preferredPortionSize?: string;
  proteinPreferences?: { id: string; name: string }[];
  categoryPreferences?: { id: string; name: string }[];
  dietaryRestrictions?: { id: string; name: string }[];
  cuisinePreferences?: { id: string; name: string }[];
  culinaryPreferences?: { id: string; name: string }[];
  groceryPreferences?: { id: string; name: string }[];
  canChefBringEquipment?: boolean;
  trashDisposal?: string;
  notes?: string;
}

interface UserPreferencesContextType {
  preferences: UserPreferences | null;
  updatePreferences: (
    newPreferences: Partial<UserPreferences>
  ) => Promise<void>;
}

const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
>(undefined);

export function UserPreferencesProvider({
  children,
  preferences: initialPreferences,
}: {
  children: ReactNode;
  preferences: UserPreferences | null;
}) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(
    initialPreferences
  );

  const updatePreferences = async (
    newPreferences: Partial<UserPreferences>
  ) => {
    try {
      // Here you would typically make an API call to update preferences in your database
      // For example:
      // await fetch('/api/preferences', {
      //   method: 'PUT',
      //   body: JSON.stringify(newPreferences),
      // });

      // For now, we'll just update the local state
      setPreferences((prev) =>
        prev
          ? { ...prev, ...newPreferences }
          : (newPreferences as UserPreferences)
      );
    } catch (error) {
      console.error("Failed to update preferences:", error);
      throw error;
    }
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useUserPreferences must be used within a UserPreferencesProvider"
    );
  }
  return context;
}
