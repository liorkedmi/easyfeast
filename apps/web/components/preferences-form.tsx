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

interface FilterOption {
  id: string;
  name: string;
}

interface PreferencesFormProps {
  filterOptions: {
    proteinTypes: FilterOption[];
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
              How many servings of each meal would you like?{" "}
              <span className="font-normal text-gray-500">
                This sets a default portion size for your household, but you'll
                be able to adjust this each week.
              </span>
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
                <SelectItem value="Small">Small</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Large">Large</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              What types of protein options are you interested in?{" "}
              <span className="font-normal text-gray-500">
                Check all that apply.
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filterOptions.proteinTypes.map((protein) => (
                <div key={protein.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`protein-${protein.id}`}
                    checked={preferences?.proteinPreferences?.some(
                      (p) => p.id === protein.id
                    )}
                    onCheckedChange={(checked) => {
                      const currentPreferences =
                        preferences?.proteinPreferences || [];
                      const newPreferences = checked
                        ? [...currentPreferences, protein]
                        : currentPreferences.filter((p) => p.id !== protein.id);
                      handleUpdatePreferences({
                        proteinPreferences: newPreferences,
                      });
                    }}
                  />
                  <Label htmlFor={`protein-${protein.id}`}>
                    {protein.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Would you like us to highlight meals from any of these specific
              categories?{" "}
              <span className="font-normal text-gray-500">
                Check all that apply.
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filterOptions.categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
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
              Please select the allergies and dietary restrictions in your
              household{" "}
              <span className="font-normal text-gray-500">
                If none, leave blank.
              </span>
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
              Which cuisines are your favorites? Check all that apply.{" "}
              <span className="font-normal text-gray-500">
                Check all that apply.
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filterOptions.cuisines.map((cuisine) => (
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
                        : currentPreferences.filter((c) => c.id !== cuisine.id);
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
              What are your culinary preferences?{" "}
              <span className="font-normal text-gray-500">
                Check all that apply.
              </span>
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
              <span className="font-normal text-gray-500">(Optional)</span>
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
              <span className="font-normal text-gray-500">
                (For example, his or her own meat thermometer, knife set, etc.)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="chef-equipment"
                checked={preferences?.canChefBringEquipment || false}
                onCheckedChange={(checked) =>
                  handleUpdatePreferences({
                    canChefBringEquipment: checked === true,
                  })
                }
              />
              <Label htmlFor="chef-equipment">
                Yes, I am comfortable with this
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Please provide instructions for trash disposal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={preferences?.trashDisposal || ""}
              onChange={(e) =>
                handleUpdatePreferences({ trashDisposal: e.target.value })
              }
              placeholder="Please provide any specific instructions for trash disposal..."
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={preferences?.notes || ""}
              onChange={(e) =>
                handleUpdatePreferences({ notes: e.target.value })
              }
              placeholder="Any additional preferences or notes..."
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
