"use client";

import { useUserPreferences } from "@/contexts/user-preferences-context";
import { useEffect, useState } from "react";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Button } from "@workspace/ui/components/button";
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
import { updateUserPreferences } from "@/lib/airtable";
import { toast } from "sonner";

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

  const handleSave = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      toast.error("Please sign in to save preferences");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.emailAddresses[0].emailAddress,
          preferences: preferences || {},
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      toast.success("Preferences saved successfully");
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  // const handleSave = async () => {
  //   // Here you would typically make an API call to save preferences
  //   // For now, we'll just update the local state
  //   await updatePreferences({
  //     // Add your preference updates here
  //   });
  // };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            How many servings of each meal would you like?{" "}
            <span className="font-normal text-gray-500">
              You'll be able to modify this selection from week to week as
              desired.
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences?.preferredPortionSize || ""}
            onValueChange={(value) =>
              updatePreferences({ preferredPortionSize: value })
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
          <div className="space-y-4">
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
                    updatePreferences({ proteinPreferences: newPreferences });
                  }}
                />
                <Label htmlFor={`protein-${protein.id}`}>{protein.name}</Label>
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
          <div className="space-y-4">
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
                      : currentPreferences.filter((c) => c.id !== category.id);
                    updatePreferences({
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
          <div className="space-y-4">
            {filterOptions.dietaryRestrictions.map((restriction) => (
              <div key={restriction.id} className="flex items-center space-x-2">
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
                    updatePreferences({
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
          <div className="space-y-4">
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
                    updatePreferences({ cuisinePreferences: newPreferences });
                  }}
                />
                <Label htmlFor={`cuisine-${cuisine.id}`}>{cuisine.name}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            What are your culinary preferences? cuisines?{" "}
            <span className="font-normal text-gray-500">
              Check all that apply.
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                    updatePreferences({
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
          <div className="space-y-4">
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
                    updatePreferences({ groceryPreferences: newPreferences });
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
                updatePreferences({ canChefBringEquipment: checked === true })
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
          <CardTitle>Please provide instructions for trash disposal</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={preferences?.trashDisposal || ""}
            onChange={(e) =>
              updatePreferences({ trashDisposal: e.target.value })
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
            onChange={(e) => updatePreferences({ notes: e.target.value })}
            placeholder="Any additional preferences or notes..."
            rows={4}
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
}
