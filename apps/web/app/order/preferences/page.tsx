import { getFilterOptions } from "@/lib/airtable";
import { PreferencesForm } from "@/components/preferences-form";

export default async function PreferencesPage() {
  const filterOptions = await getFilterOptions();

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-background">
      <div className="z-10 max-w-5xl w-full bg-white shadow-lg p-10">
        <h1 className="text-4xl font-bold mb-8">Household Preferences</h1>
        <p className="text-lg mb-8">
          We'll use the information below to personalize your service. You can
          update these settings at any time.
        </p>
        <PreferencesForm filterOptions={filterOptions} />
      </div>
    </main>
  );
}
