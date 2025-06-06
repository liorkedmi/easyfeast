import { getUserPreferences } from "@/lib/airtable";
import { currentUser } from "@clerk/nextjs/server";
import { UserPreferencesProvider } from "@/contexts/user-preferences-context";

export async function UserPreferencesWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user's email from Clerk
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  // Fetch user preferences if email is available
  let userPreferences = null;
  if (email) {
    userPreferences = await getUserPreferences(email);
  }

  return (
    <UserPreferencesProvider preferences={userPreferences}>
      {children}
    </UserPreferencesProvider>
  );
}
