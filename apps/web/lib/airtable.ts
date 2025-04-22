import Airtable from "airtable";

// Initialize Airtable
const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID!);

export interface MenuItem {
  id: string;
  name: string;
  type: string;
  proteinTypes: string[];
  dietaryRestrictions: string[];
  categories: string[];
  cuisine: string;
  tags: string[];
  seasons: string[];
  ingredients: string;
  picture?: string;
}

export async function getMenuItems(
  type: "Main" | "Add-on" = "Main"
): Promise<MenuItem[]> {
  try {
    const records = await airtable("Online_Menu")
      .select({
        filterByFormula: `{Type} = '${type}'`, // Filter by the specified type
      })
      .all();

    return records.map((record): MenuItem => {
      // Handle multi-select fields that come as arrays
      const proteinTypes = record.get("Protein Type");
      const dietaryRestrictions = record.get("Dietary Restrictions");
      const categories = record.get("Categories");
      const tags = record.get("Tags");
      const seasons = record.get("Seasons");

      return {
        id: record.id,
        name: record.get("Name") as string,
        type: record.get("Type") as string,
        proteinTypes: Array.isArray(proteinTypes)
          ? proteinTypes
          : typeof proteinTypes === "string"
            ? proteinTypes.split(",").map((s) => s.trim())
            : [],
        // If the field is an array, use it directly; if it's a string, split it
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
        cuisine: record.get("Cuisine") as string,
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
        picture: record.get("Picture") as string | undefined,
      };
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
}

// Get all available filter options
export async function getFilterOptions() {
  const [proteinTypes, dietaryRestrictions, categories, cuisines, tags] =
    await Promise.all([
      airtable("Online_Filter_Protein Type").select().all(),
      airtable("Online_Filter_Dietary Restrictions").select().all(),
      airtable("Online_Filter_Categories").select().all(),
      airtable("Online_Filter_Cuisine").select().all(),
      airtable("Online_Filter_Tags").select().all(),
    ]);

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
  };
}
