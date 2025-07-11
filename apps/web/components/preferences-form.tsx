"use client";

import { useUserPreferences } from "@/contexts/user-preferences-context";
import { useState, useRef } from "react";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
// @ts-expect-error: No type definitions for lodash.debounce
import debounce from "lodash.debounce";
import { UserPreferences } from "@/contexts/user-preferences-context";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";

interface FilterOption {
  id: string;
  name: string;
}

interface PreferencesFormProps {
  filterOptions: {
    mealTypes: FilterOption[];
    dietaryRestrictions: FilterOption[];
    categories: FilterOption[];
    cuisines: FilterOption[];
    culinaryPreferences: FilterOption[];
    groceryPreferences: FilterOption[];
  };
}

export function PreferencesForm({ filterOptions }: PreferencesFormProps) {
  const { preferences, updatePreferences } = useUserPreferences();
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  const savePreferences = async (user: any, newPrefs: any) => {
    toast.dismiss();
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (!user?.emailAddresses?.[0]?.emailAddress) return;
    try {
      setIsSaving(true);
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.emailAddresses[0].emailAddress,
          preferences: newPrefs,
        }),
      });
      if (!response.ok) throw new Error("Failed to save preferences");
      toast.success("Preferences saved");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save function
  const debouncedSave = useRef(
    debounce((user: any, newPrefs: UserPreferences) => {
      savePreferences(user, newPrefs);
    }, 800)
  ).current;

  // Wrap updatePreferences to also trigger save
  const handleUpdatePreferences = (newPrefs: Partial<UserPreferences>) => {
    updatePreferences(newPrefs);
    debouncedSave(user, { ...preferences, ...newPrefs } as UserPreferences);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              How many servings should each meal include?{" "}
              <p className="mt-2 text-sm font-normal text-gray-500">
                This sets your household's default portion size. You'll still
                have the flexibility to adjust it each week based on your needs.
                Your selection won't affect our service fee, but grocery costs
                will vary accordingly.
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={preferences?.preferredPortionSize || ""}
              onValueChange={(value) =>
                handleUpdatePreferences({ preferredPortionSize: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your preferred portion size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Small">Small: feeds 2 people</SelectItem>
                <SelectItem value="Medium">Medium: feeds 4 people</SelectItem>
                <SelectItem value="Large">Large: feeds 6 people</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              What types of meals would you like to see in your menu?{" "}
              <p className="mt-2 text-sm font-normal text-gray-500">
                These broader categories reflect how you like to eat - whether
                that's adventurous, extra-clean, or picky eater approved. Your
                choices will help us highlight meals that fit your overall
                lifestyle and preferences. If you'd like to see our full
                collection of recipes, simply select "I'd like to see
                everything!"
              </p>
              <p className="mt-2 text-sm font-normal text-gray-500">
                Select all that apply. You can update these filters at any time.
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="category-see-everything"
                  checked={
                    !(
                      preferences?.categoryPreferences &&
                      preferences.categoryPreferences.length > 0
                    )
                  }
                  onCheckedChange={() => {
                    // Clear all selections
                    handleUpdatePreferences({ categoryPreferences: [] });
                  }}
                />
                <Label
                  htmlFor="category-see-everything"
                  className="cursor-pointer hover:text-primary transition-colors"
                >
                  I'd like to see everything!
                </Label>
              </div>
              {filterOptions.categories
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={preferences?.categoryPreferences?.some(
                        (c) => c.id === category.id
                      )}
                      onCheckedChange={(checked) => {
                        const currentPreferences =
                          preferences?.categoryPreferences || [];
                        const newPreferences = checked
                          ? [...currentPreferences, category]
                          : currentPreferences.filter(
                              (c) => c.id !== category.id
                            );
                        handleUpdatePreferences({
                          categoryPreferences: newPreferences,
                        });
                      }}
                    />
                    <Label htmlFor={`category-${category.id}`}>
                      {category.name}
                    </Label>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              What kinds of dishes and main ingredients do you want included?{" "}
              <p className="mt-2 text-sm font-normal text-gray-500">
                Your selections will help shape your menu around the types of
                dishes, proteins and main ingredients your household enjoys
                most. If you'd like to see our full collection of recipes,
                simply select "I'd like to see everything!"
              </p>
              <p className="mt-2 text-sm font-normal text-gray-500">
                Select all that apply. You can update these filters at any time.
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="meal-type-see-everything"
                  checked={
                    !(
                      preferences?.mealTypePreferences &&
                      preferences.mealTypePreferences.length > 0
                    )
                  }
                  onCheckedChange={() => {
                    handleUpdatePreferences({ mealTypePreferences: [] });
                  }}
                />
                <Label
                  htmlFor="meal-type-see-everything"
                  className="cursor-pointer hover:text-primary transition-colors"
                >
                  I'd like to see everything!
                </Label>
              </div>
              {filterOptions.mealTypes
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((mealType) => (
                  <div
                    key={mealType.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`meal-type-${mealType.id}`}
                      checked={preferences?.mealTypePreferences?.some(
                        (p) => p.id === mealType.id
                      )}
                      onCheckedChange={(checked) => {
                        const currentPreferences =
                          preferences?.mealTypePreferences || [];
                        const newPreferences = checked
                          ? [...currentPreferences, mealType]
                          : currentPreferences.filter(
                              (p) => p.id !== mealType.id
                            );
                        handleUpdatePreferences({
                          mealTypePreferences: newPreferences,
                        });
                      }}
                    />
                    <Label htmlFor={`meal-type-${mealType.id}`}>
                      {mealType.name}
                    </Label>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Which cuisines would you like included in your menu?{" "}
              <p className="mt-2 text-sm font-normal text-gray-500">
                If you'd like to see our full collection of recipes, simply
                select "I'd like to see everything!"
              </p>
              <p className="mt-2 text-sm font-normal text-gray-500">
                Select all that apply. You can update these filters at any time.
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cuisine-see-everything"
                  checked={
                    !(
                      preferences?.cuisinePreferences &&
                      preferences.cuisinePreferences.length > 0
                    )
                  }
                  onCheckedChange={() => {
                    handleUpdatePreferences({ cuisinePreferences: [] });
                  }}
                />
                <Label
                  htmlFor="cuisine-see-everything"
                  className="cursor-pointer hover:text-primary transition-colors"
                >
                  I'd like to see everything!
                </Label>
              </div>
              {filterOptions.cuisines
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((cuisine) => (
                  <div key={cuisine.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cuisine-${cuisine.id}`}
                      checked={preferences?.cuisinePreferences?.some(
                        (c) => c.id === cuisine.id
                      )}
                      onCheckedChange={(checked) => {
                        const currentPreferences =
                          preferences?.cuisinePreferences || [];
                        const newPreferences = checked
                          ? [...currentPreferences, cuisine]
                          : currentPreferences.filter(
                              (c) => c.id !== cuisine.id
                            );
                        handleUpdatePreferences({
                          cuisinePreferences: newPreferences,
                        });
                      }}
                    />
                    <Label htmlFor={`cuisine-${cuisine.id}`}>
                      {cuisine.name}
                    </Label>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Please let us know if anyone in your household has an allergy or
              dietary restriction.{" "}
              <p className="mt-2 text-sm font-normal text-gray-500">
                If none, you can leave this blank. Choose all that apply:
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filterOptions.dietaryRestrictions.map((restriction) => (
                <div
                  key={restriction.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`restriction-${restriction.id}`}
                    checked={preferences?.dietaryRestrictions?.some(
                      (r) => r.id === restriction.id
                    )}
                    onCheckedChange={(checked) => {
                      const currentPreferences =
                        preferences?.dietaryRestrictions || [];
                      const newPreferences = checked
                        ? [...currentPreferences, restriction]
                        : currentPreferences.filter(
                            (r) => r.id !== restriction.id
                          );
                      handleUpdatePreferences({
                        dietaryRestrictions: newPreferences,
                      });
                    }}
                  />
                  <Label htmlFor={`restriction-${restriction.id}`}>
                    {restriction.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              What are your culinary preferences?{" "}
              <p className="mt-2 text-sm font-normal text-gray-500">
                Check all that apply.
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filterOptions.culinaryPreferences.map((pref) => (
                <div key={pref.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`culinary-${pref.id}`}
                    checked={preferences?.culinaryPreferences?.some(
                      (p) => p.id === pref.id
                    )}
                    onCheckedChange={(checked) => {
                      const currentPreferences =
                        preferences?.culinaryPreferences || [];
                      const newPreferences = checked
                        ? [...currentPreferences, pref]
                        : currentPreferences.filter((p) => p.id !== pref.id);
                      handleUpdatePreferences({
                        culinaryPreferences: newPreferences,
                      });
                    }}
                  />
                  <Label htmlFor={`culinary-${pref.id}`}>{pref.name}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              What are your grocery shopping preferences?{" "}
              <p className="mt-2 text-sm font-normal text-gray-500">
                (Optional)
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filterOptions.groceryPreferences.map((pref) => (
                <div key={pref.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`grocery-${pref.id}`}
                    checked={preferences?.groceryPreferences?.some(
                      (p) => p.id === pref.id
                    )}
                    onCheckedChange={(checked) => {
                      const currentPreferences =
                        preferences?.groceryPreferences || [];
                      const newPreferences = checked
                        ? [...currentPreferences, pref]
                        : currentPreferences.filter((p) => p.id !== pref.id);
                      handleUpdatePreferences({
                        groceryPreferences: newPreferences,
                      });
                    }}
                  />
                  <Label htmlFor={`grocery-${pref.id}`}>{pref.name}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Are you comfortable with your chef bringing his or her own
              equipment?{" "}
              <p className="mt-2 text-sm font-normal text-gray-500">
                (For example, his or her own meat thermometer, knife set, etc.)
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={
                preferences?.canChefBringEquipment === false ? "No" : "Yes"
              }
              onValueChange={(value) =>
                handleUpdatePreferences({
                  canChefBringEquipment: value === "Yes",
                })
              }
              className="flex flex-col gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes" id="chef-equipment-yes" />
                <Label htmlFor="chef-equipment-yes">
                  Yes, I am comfortable with this
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id="chef-equipment-no" />
                <Label htmlFor="chef-equipment-no">
                  No, please only use my equipment
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Trash disposal
              <p className="mt-2 text-sm font-normal text-gray-500">
                Please provide instructions for trash disposal
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={preferences?.trashDisposal || ""}
              onChange={(e) =>
                handleUpdatePreferences({ trashDisposal: e.target.value })
              }
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Additional notes
              <p className="mt-2 text-sm font-normal text-gray-500">
                Is there anything else we should know?
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={preferences?.notes || ""}
              onChange={(e) =>
                handleUpdatePreferences({ notes: e.target.value })
              }
              rows={4}
            />
          </CardContent>
        </Card>
      </div>
      {isSaving && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center bg-white rounded-full shadow-lg px-4 py-2 text-gray-700 text-sm border border-gray-200 transition duration-300 ease-out opacity-100 translate-y-0 animate-fade-up">
          <svg
            className="animate-spin h-4 w-4 mr-2 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          Saving preferences...
        </div>
      )}
    </>
  );
}
