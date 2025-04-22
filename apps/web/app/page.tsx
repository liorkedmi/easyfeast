export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Welcome to EasyFeast</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Your Bookings</h2>
            <p className="text-gray-600">
              View and manage your upcoming meal bookings
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Your Preferences</h2>
            <p className="text-gray-600">
              Manage your dietary preferences and restrictions
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
