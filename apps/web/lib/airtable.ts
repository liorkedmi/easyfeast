import Airtable from "airtable";
import { cache } from "react";

// Initialize Airtable
const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID!);

export interface MenuItem {
  id: string;
  name: string;
  type: string;
  menu: "Main Menu" | "Kosher";
  proteinTypes: string[];
  dietaryRestrictions: string[];
  categories: string[];
  cuisine: string[];
  tags: string[];
  seasons: string[];
  ingredients: string;
  picture: string;
  restriction_Dairy_Free?: string;
  restriction_Gluten_Free?: string;
  restriction_Tree_Nut_Free?: string;
  restriction_Peanut_Free?: string;
  restriction_Egg_Free?: string;
  restriction_Sesame_Free?: string;
  choices_Select_1?: string[];
  choices_Select_Multiple?: string[];
  sides?: string[];
}

export const getMenuItems = cache(
  async (
    type: "Main" | "Add-on" = "Main",
    isKosher: boolean = false
  ): Promise<MenuItem[]> => {
    try {
      // Get menu items filtered by type and menu only
      const records = await airtable("Online_Menu")
        .select({
          filterByFormula: `AND(
            {Type} = '${type}',
            {Menu} = '${isKosher ? "Kosher Menu" : "Main Menu"}'
          )`,
        })
        .all();

      return records.map((record): MenuItem => {
        // Handle multi-select fields that come as arrays
        const proteinTypes = record.get("Protein Type");
        const dietaryRestrictions = record.get("Dietary Restrictions");
        const categories = record.get("Categories");
        const tags = record.get("Tags");
        const seasons = record.get("Seasons");
        const cusines = record.get("Cuisine");

        return {
          id: record.id,
          name: record.get("Name") as string,
          type: record.get("Type") as string,
          menu: record.get("Menu") as "Main Menu" | "Kosher",
          proteinTypes: Array.isArray(proteinTypes)
            ? proteinTypes
            : typeof proteinTypes === "string"
              ? proteinTypes.split(",").map((s) => s.trim())
              : [],
          dietaryRestrictions: Array.isArray(dietaryRestrictions)
            ? dietaryRestrictions
            : typeof dietaryRestrictions === "string"
              ? dietaryRestrictions.split(",").map((s) => s.trim())
              : [],
          categories: Array.isArray(categories)
            ? categories
            : typeof categories === "string"
              ? categories.split(",").map((s) => s.trim())
              : [],
          cuisine: Array.isArray(cusines)
            ? cusines
            : typeof cusines === "string"
              ? cusines.split(",").map((s) => s.trim())
              : [],
          tags: Array.isArray(tags)
            ? tags
            : typeof tags === "string"
              ? tags.split(",").map((s) => s.trim())
              : [],
          seasons: Array.isArray(seasons)
            ? seasons
            : typeof seasons === "string"
              ? seasons.split(",").map((s) => s.trim())
              : [],
          ingredients: record.get("Ingredients_Display") as string,
          picture: (() => {
            const picture = record.get("Picture");
            if (!picture || !Array.isArray(picture) || !picture.length) {
              return "/img/placeholder.png";
            }
            // @ts-ignore - We know this is safe at runtime
            const firstAttachment = picture[0] as unknown as {
              thumbnails?: {
                large?: {
                  url?: string;
                };
              };
            };
            return (
              firstAttachment?.thumbnails?.large?.url || "/img/placeholder.png"
            );
          })(),
          restriction_Dairy_Free: record.get(
            "Restriction_Dairy-Free"
          ) as string,
          restriction_Gluten_Free: record.get(
            "Restriction_Gluten-Free"
          ) as string,
          restriction_Tree_Nut_Free: record.get(
            "Restriction_Tree-Nut Free"
          ) as string,
          restriction_Peanut_Free: record.get(
            "Restriction_Peanut-Free"
          ) as string,
          restriction_Egg_Free: record.get("Restriction_Egg-Free") as string,
          restriction_Sesame_Free: record.get(
            "Restriction_Sesame-Free"
          ) as string,
          choices_Select_1: record.get("Choices (Select 1)") as string[],
          choices_Select_Multiple: record.get(
            "Choices (Select Multiple)"
          ) as string[],
          sides: record.get("Sides") as string[],
        };
      });
    } catch (error) {
      console.error("Error fetching menu items:", error);
      return [];
    }
  }
);

// Get all available filter options
export const getFilterOptions = cache(async () => {
  const [
    proteinTypes,
    dietaryRestrictions,
    categories,
    cuisines,
    tags,
    culinaryPreferences,
    groceryPreferences,
    sides,
    settings,
  ] = await Promise.all([
    airtable("Online_Filter_Proteins").select().all(),
    airtable("Online_Filter_Dietary Restrictions").select().all(),
    airtable("Online_Filter_Categories").select().all(),
    airtable("Online_Filter_Cuisine").select().all(),
    airtable("Online_Filter_Tags").select().all(),
    airtable("Online_Filter_Culinary Preferences").select().all(),
    airtable("Online_Filter_Grocery Preferences").select().all(),
    airtable("Online_Menu")
      .select({
        filterByFormula: "{Type} = 'Side'",
      })
      .all(),
    airtable("Online_Settings").select().all(),
  ]);

  // Get the current season from settings
  const currentSeason = settings[0]?.get("Current Season") as string;

  return {
    proteinTypes: proteinTypes.map((record) => ({
      id: record.id,
      name: record.get("Name") as string,
    })),
    dietaryRestrictions: dietaryRestrictions.map((record) => ({
      id: record.id,
      name: record.get("Name") as string,
    })),
    categories: categories.map((record) => ({
      id: record.id,
      name: record.get("Name") as string,
    })),
    cuisines: cuisines.map((record) => ({
      id: record.id,
      name: record.get("Name") as string,
    })),
    tags: tags.map((record) => ({
      id: record.id,
      name: record.get("Name") as string,
    })),
    sides: sides.map((record) => ({
      id: record.id,
      name: record.get("Name") as string,
    })),
    culinaryPreferences: culinaryPreferences.map((record) => ({
      id: record.id,
      name: record.get("Name") as string,
    })),
    groceryPreferences: groceryPreferences.map((record) => ({
      id: record.id,
      name: record.get("Name") as string,
    })),
    seasons: [
      { id: "Winter", name: "Winter" },
      { id: "Spring", name: "Spring" },
      { id: "Summer", name: "Summer" },
      { id: "Fall", name: "Fall" },
    ],
    currentSeason,
  };
});

export interface UserPreferences {
  preferredPortionSize: string;
  proteinPreferences: { id: string; name: string }[];
  categoryPreferences: { id: string; name: string }[];
  dietaryRestrictions: { id: string; name: string }[];
  cuisinePreferences: { id: string; name: string }[];
  culinaryPreferences: { id: string; name: string }[];
  groceryPreferences: { id: string; name: string }[];
  canChefBringEquipment: boolean;
  trashDisposal: string;
  notes: string;
}

export async function getUserPreferences(
  email: string
): Promise<UserPreferences | null> {
  try {
    // First, find the user in Online_Users table
    const userRecords = await airtable("Online_Users")
      .select({
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1,
      })
      .all();

    if (userRecords.length === 0) {
      console.log("User not found in Online_Users table");
      return null;
    }

    const userRecord = userRecords[0];
    if (!userRecord) {
      console.log("User record is undefined");
      return null;
    }

    const clientLinks = userRecord.fields?.["Link to Online_Clients"];
    if (
      !clientLinks ||
      !Array.isArray(clientLinks) ||
      clientLinks.length === 0
    ) {
      console.log("No client links found for user");
      return null;
    }

    const clientId = clientLinks[0];

    // Then, find the corresponding client record
    const clientRecords = await airtable("Online_Clients")
      .select({
        filterByFormula: `RECORD_ID() = '${clientId}'`,
        maxRecords: 1,
      })
      .all();

    if (clientRecords.length === 0) {
      console.log("Client record not found for user");
      return null;
    }

    const clientRecord = clientRecords[0];
    if (!clientRecord) {
      console.log("Client record is undefined");
      return null;
    }

    const proteinPreferenceIds = clientRecord.get("Proteins") as string[];
    const proteinPreferences =
      await getProteinPreferencesByIds(proteinPreferenceIds);

    const categoryPreferenceIds = clientRecord.get("Categories") as string[];
    const categoryPreferences = await getCategoryPreferencesByIds(
      categoryPreferenceIds
    );

    const dietaryRestrictionIds = clientRecord.get(
      "Dietary Restrictions"
    ) as string[];
    const dietaryRestrictions = await getDietaryRestrictionsByIds(
      dietaryRestrictionIds
    );

    const cuisinePreferenceIds = clientRecord.get("Cuisines") as string[];
    const cuisinePreferences =
      await getCuisinePreferencesByIds(cuisinePreferenceIds);

    const culinaryPreferenceIds = clientRecord.get(
      "Culinary Preferences"
    ) as string[];
    const culinaryPreferences = await getCulinaryPreferencesByIds(
      culinaryPreferenceIds
    );

    const groceryPreferenceIds = clientRecord.get(
      "Grocery Preferences"
    ) as string[];
    const groceryPreferences =
      await getGroceryPreferencesByIds(groceryPreferenceIds);

    return {
      preferredPortionSize:
        (clientRecord.get("Preferred Portion Size") as string) || "",
      proteinPreferences,
      categoryPreferences,
      dietaryRestrictions,
      cuisinePreferences,
      culinaryPreferences,
      groceryPreferences,
      canChefBringEquipment:
        (clientRecord.get("Can Chef Bring Equipment? Y/N") as string) === "Yes",
      trashDisposal: (clientRecord.get("Trash Disposal") as string) || "",
      notes: (clientRecord.get("Notes") as string) || "",
    };
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return null;
  }
}

export async function getDietaryRestrictionsByIds(
  dietaryRestrictionIds: string[]
): Promise<{ id: string; name: string }[]> {
  if (!dietaryRestrictionIds || dietaryRestrictionIds.length === 0) {
    return [];
  }

  const restrictionRecords = await airtable(
    "Online_Filter_Dietary Restrictions"
  )
    .select({
      filterByFormula: `OR(${dietaryRestrictionIds.map((id) => `RECORD_ID() = '${id}'`).join(",")})`,
    })
    .all();

  return restrictionRecords.map((record) => ({
    id: record.id,
    name: record.get("Name") as string,
  }));
}

export async function getProteinPreferencesByIds(
  proteinPreferenceIds: string[]
): Promise<{ id: string; name: string }[]> {
  if (!proteinPreferenceIds || proteinPreferenceIds.length === 0) {
    return [];
  }

  const proteinRecords = await airtable("Online_Filter_Proteins")
    .select({
      filterByFormula: `OR(${proteinPreferenceIds.map((id) => `RECORD_ID() = '${id}'`).join(",")})`,
    })
    .all();

  return proteinRecords.map((record) => ({
    id: record.id,
    name: record.get("Name") as string,
  }));
}

export async function getCategoryPreferencesByIds(
  categoryPreferenceIds: string[]
): Promise<{ id: string; name: string }[]> {
  if (!categoryPreferenceIds || categoryPreferenceIds.length === 0) {
    return [];
  }

  const categoryRecords = await airtable("Online_Filter_Categories")
    .select({
      filterByFormula: `OR(${categoryPreferenceIds.map((id) => `RECORD_ID() = '${id}'`).join(",")})`,
    })
    .all();

  return categoryRecords.map((record) => ({
    id: record.id,
    name: record.get("Name") as string,
  }));
}

export async function getCuisinePreferencesByIds(
  cuisinePreferenceIds: string[]
): Promise<{ id: string; name: string }[]> {
  if (!cuisinePreferenceIds || cuisinePreferenceIds.length === 0) {
    return [];
  }

  const cuisineRecords = await airtable("Online_Filter_Cuisine")
    .select({
      filterByFormula: `OR(${cuisinePreferenceIds.map((id) => `RECORD_ID() = '${id}'`).join(",")})`,
    })
    .all();

  return cuisineRecords.map((record) => ({
    id: record.id,
    name: record.get("Name") as string,
  }));
}

export async function getCulinaryPreferencesByIds(
  culinaryPreferenceIds: string[]
): Promise<{ id: string; name: string }[]> {
  if (!culinaryPreferenceIds || culinaryPreferenceIds.length === 0) {
    return [];
  }

  const culinaryRecords = await airtable("Online_Filter_Culinary Preferences")
    .select({
      filterByFormula: `OR(${culinaryPreferenceIds.map((id) => `RECORD_ID() = '${id}'`).join(",")})`,
    })
    .all();

  return culinaryRecords.map((record) => ({
    id: record.id,
    name: record.get("Name") as string,
  }));
}

export async function getGroceryPreferencesByIds(
  groceryPreferenceIds: string[]
): Promise<{ id: string; name: string }[]> {
  if (!groceryPreferenceIds || groceryPreferenceIds.length === 0) {
    return [];
  }

  const groceryRecords = await airtable("Online_Filter_Grocery Preferences")
    .select({
      filterByFormula: `OR(${groceryPreferenceIds.map((id) => `RECORD_ID() = '${id}'`).join(",")})`,
    })
    .all();

  return groceryRecords.map((record) => ({
    id: record.id,
    name: record.get("Name") as string,
  }));
}

export async function updateUserPreferences(
  email: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  try {
    // First, find the user in Online_Users table
    const userRecords = await airtable("Online_Users")
      .select({
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1,
      })
      .all();

    if (userRecords.length === 0) {
      throw new Error("User not found in Online_Users table");
    }

    const userRecord = userRecords[0];
    if (!userRecord) {
      throw new Error("User record is undefined");
    }

    const clientId = (
      userRecord.fields["Link to Online_Clients"] as string[]
    )[0];

    // Then, find the corresponding client record
    const clientRecords = await airtable("Online_Clients")
      .select({
        filterByFormula: `RECORD_ID() = '${clientId}'`,
        maxRecords: 1,
      })
      .all();

    if (clientRecords.length === 0) {
      throw new Error("Client record not found for user");
    }

    const clientRecord = clientRecords[0];
    if (!clientRecord) {
      throw new Error("Client record is undefined");
    }

    // Prepare the fields to update
    const fields: Record<string, any> = {};

    if (preferences.preferredPortionSize !== undefined) {
      fields["Preferred Portion Size"] = preferences.preferredPortionSize;
    }

    if (preferences.proteinPreferences !== undefined) {
      fields["Proteins"] = preferences.proteinPreferences.map((p) => p.id);
    }

    if (preferences.categoryPreferences !== undefined) {
      fields["Categories"] = preferences.categoryPreferences.map((c) => c.id);
    }

    if (preferences.dietaryRestrictions !== undefined) {
      fields["Dietary Restrictions"] = preferences.dietaryRestrictions.map(
        (d) => d.id
      );
    }

    if (preferences.cuisinePreferences !== undefined) {
      fields["Cuisines"] = preferences.cuisinePreferences.map((c) => c.id);
    }

    if (preferences.culinaryPreferences !== undefined) {
      fields["Culinary Preferences"] = preferences.culinaryPreferences.map(
        (c) => c.id
      );
    }

    if (preferences.groceryPreferences !== undefined) {
      fields["Grocery Preferences"] = preferences.groceryPreferences.map(
        (g) => g.id
      );
    }

    if (preferences.canChefBringEquipment !== undefined) {
      fields["Can Chef Bring Equipment? Y/N"] =
        preferences.canChefBringEquipment ? "Yes" : "No";
    }

    if (preferences.trashDisposal !== undefined) {
      fields["Trash Disposal"] = preferences.trashDisposal;
    }

    if (preferences.notes !== undefined) {
      fields["Notes"] = preferences.notes;
    }

    // Update the client record
    await airtable("Online_Clients").update(clientRecord.id, fields);
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
}

export async function getBookingSchedule(email: string) {
  try {
    // First, find the user in Online_Users table
    const userRecords = await airtable("Online_Users")
      .select({
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1,
      })
      .all();

    if (userRecords.length === 0) {
      return null;
    }

    const userRecord = userRecords[0];
    if (!userRecord) {
      return null;
    }

    const clientLinks = userRecord.fields["Link to Online_Clients"] as
      | string[]
      | undefined;
    if (!clientLinks || clientLinks.length === 0) {
      return null;
    }

    const clientId = clientLinks[0];

    // Get the next pending booking schedule
    const filterByFormula = `AND(
      {Client ID (from Link to Online_Clients)} = '${clientId}',
      {Status} = 'Pending',
      IS_AFTER({Booking Date & Time}, NOW())
    )`;

    const scheduleRecords = await airtable("Online_Bookings_Schedule")
      .select({
        filterByFormula,
        sort: [{ field: "Booking Date & Time", direction: "asc" }],
        maxRecords: 1,
      })
      .all();

    if (scheduleRecords.length === 0) {
      return null;
    }

    const scheduleRecord = scheduleRecords[0];
    if (!scheduleRecord) {
      return null;
    }

    return {
      id: scheduleRecord.id,
      bookingDate: scheduleRecord.fields["Booking Date & Time"] as string,
      status: scheduleRecord.fields["Status"] as "Pending" | "Done",
    };
  } catch (error) {
    console.error("Error fetching booking schedule:", error);
    throw error;
  }
}

export interface FilterParams {
  proteinTypes?: string;
  dietaryRestrictions?: string;
  cuisines?: string;
  categories?: string;
  tags?: string;
  seasons?: string;
}

export const getFilteredMenuItems = cache(
  async (
    type: "Main" | "Add-on",
    isKosher: boolean,
    filterParams: FilterParams
  ): Promise<MenuItem[]> => {
    try {
      // Get all menu items first
      const menuItems = await getMenuItems(type, isKosher);

      // Apply filters
      return menuItems.filter((item) => {
        // If no filters are selected, show all items
        if (
          !filterParams.proteinTypes &&
          !filterParams.dietaryRestrictions &&
          !filterParams.cuisines &&
          !filterParams.categories &&
          !filterParams.tags &&
          !filterParams.seasons
        ) {
          return true;
        }

        // Check if item matches all selected filters
        const matchesProteinType =
          !filterParams.proteinTypes ||
          filterParams.proteinTypes
            .split(",")
            .some((type) => item.proteinTypes.includes(type));

        const matchesDietaryRestriction =
          !filterParams.dietaryRestrictions ||
          !item.dietaryRestrictions.includes(filterParams.dietaryRestrictions);

        const matchesCuisine =
          !filterParams.cuisines ||
          filterParams.cuisines
            .split(",")
            .some((cuisine) => item.cuisine.includes(cuisine));

        const matchesCategories =
          !filterParams.categories ||
          item.categories.some((category) =>
            filterParams.categories!.split(",").includes(category)
          );

        const matchesTags =
          !filterParams.tags ||
          item.tags.some((tag) => filterParams.tags!.split(",").includes(tag));

        const matchesSeasons =
          !filterParams.seasons ||
          filterParams.seasons
            .split(",")
            .some((season) => item.seasons.includes(season));

        return (
          matchesProteinType &&
          matchesDietaryRestriction &&
          matchesCuisine &&
          matchesCategories &&
          matchesTags &&
          matchesSeasons
        );
      });
    } catch (error) {
      console.error("Error filtering menu items:", error);
      return [];
    }
  }
);
