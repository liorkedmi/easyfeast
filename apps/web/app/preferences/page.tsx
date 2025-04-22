export default function PreferencesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full">
        <h1 className="text-4xl font-bold mb-8">Your Preferences</h1>
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Dietary Restrictions</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input type="checkbox" id="vegetarian" className="mr-2" />
                <label htmlFor="vegetarian">Vegetarian</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="vegan" className="mr-2" />
                <label htmlFor="vegan">Vegan</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="gluten-free" className="mr-2" />
                <label htmlFor="gluten-free">Gluten Free</label>
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Allergies</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input type="checkbox" id="nuts" className="mr-2" />
                <label htmlFor="nuts">Nuts</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="dairy" className="mr-2" />
                <label htmlFor="dairy">Dairy</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="shellfish" className="mr-2" />
                <label htmlFor="shellfish">Shellfish</label>
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Disliked Ingredients</h2>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="List any ingredients you'd prefer to avoid..."
              rows={4}
            />
          </div>

          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg">
            Save Preferences
          </button>
        </div>
      </div>
    </main>
  );
}
