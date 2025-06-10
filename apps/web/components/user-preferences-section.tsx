"use client";

import { useUserPreferences } from "@/contexts/user-preferences-context";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { Button } from "@workspace/ui/components/button";
import { ChevronDown, Settings2, Pencil } from "lucide-react";
import { useState } from "react";
import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";

export function UserPreferencesSection() {
  const { preferences } = useUserPreferences();
  const [isOpen, setIsOpen] = useState(false);

  if (!preferences) {
    return null;
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2"
    >
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Your Preferences</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/order/preferences" passHref>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isOpen ? "transform rotate-180" : ""
                }`}
              />
              <span className="sr-only">Toggle preferences</span>
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border p-4">
          <dl className="space-y-4">
            {preferences.preferredPortionSize && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Preferred Portion Size
                </dt>
                <dd className="text-sm text-gray-900">
                  {preferences.preferredPortionSize}
                </dd>
              </div>
            )}

            {preferences.proteinPreferences &&
              preferences.proteinPreferences.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Protein Preferences
                  </dt>
                  <dd className="flex flex-wrap gap-2 mt-1">
                    {preferences.proteinPreferences.map((pref) => (
                      <Badge key={pref.id} variant="secondary">
                        {pref.name}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}

            {preferences.categoryPreferences &&
              preferences.categoryPreferences.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Category Preferences
                  </dt>
                  <dd className="flex flex-wrap gap-2 mt-1">
                    {preferences.categoryPreferences.map((pref) => (
                      <Badge key={pref.id} variant="secondary">
                        {pref.name}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}

            {preferences.dietaryRestrictions &&
              preferences.dietaryRestrictions.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Dietary Restrictions
                  </dt>
                  <dd className="flex flex-wrap gap-2 mt-1">
                    {preferences.dietaryRestrictions.map((perf) => (
                      <Badge key={perf.id} variant="secondary">
                        {perf.name}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}

            {preferences.cuisinePreferences &&
              preferences.cuisinePreferences.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Cuisine Preferences
                  </dt>
                  <dd className="flex flex-wrap gap-2 mt-1">
                    {preferences.cuisinePreferences.map((pref) => (
                      <Badge key={pref.id} variant="secondary">
                        {pref.name}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}

            {preferences.culinaryPreferences &&
              preferences.culinaryPreferences.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Culinary Preferences
                  </dt>
                  <dd className="flex flex-wrap gap-2 mt-1">
                    {preferences.culinaryPreferences.map((pref) => (
                      <Badge key={pref.id} variant="secondary">
                        {pref.name}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}

            {preferences.groceryPreferences &&
              preferences.groceryPreferences.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Grocery Preferences
                  </dt>
                  <dd className="flex flex-wrap gap-2 mt-1">
                    {preferences.groceryPreferences.map((pref) => (
                      <Badge key={pref.id} variant="secondary">
                        {pref.name}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}

            {preferences.canChefBringEquipment !== undefined && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Chef Equipment
                </dt>
                <dd className="text-xs text-gray-900">
                  {preferences.canChefBringEquipment
                    ? "Can bring equipment"
                    : "Cannot bring equipment"}
                </dd>
              </div>
            )}

            {preferences.trashDisposal && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Trash Disposal Instructions
                </dt>
                <dd className="text-xs text-gray-900">
                  {preferences.trashDisposal}
                </dd>
              </div>
            )}

            {preferences.notes && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Additional Notes
                </dt>
                <dd className="text-xs text-gray-900">{preferences.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
