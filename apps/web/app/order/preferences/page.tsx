import { getFilterOptions } from "@/lib/airtable";
import { PreferencesForm } from "@/components/preferences-form";

export default async function PreferencesPage() {
  const filterOptions = await getFilterOptions();

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-background">
      <div className="z-10 max-w-5xl w-full bg-white shadow-lg p-10">
        <h1 className="text-4xl font-bold mb-8">Household Preferences</h1>
        <p className="mb-4">
          Please complete the form below so we can tailor your menu to fit your
          household's needs.
        </p>
        <p className="mb-4">
          Based on your responses, we’ll show you a personalized selection of
          menu options. Whether you’re eating low-carb, feeding picky kids,
          looking for clean meals, or just want easy family dinners, we’ve got
          you covered.
        </p>
        <p className="mb-8">You can update these preferences at any time.</p>
        <PreferencesForm filterOptions={filterOptions} />
      </div>
    </main>
  );
}
