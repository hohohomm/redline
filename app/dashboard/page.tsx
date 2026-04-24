// Placeholder dashboard page. Week 5 replaces this with real stats.
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? "unknown";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-gray-600">Signed in as {email}</p>
      <p className="text-sm text-gray-400">
        (Week 1 placeholder — invoice list comes in Week 5.)
      </p>
    </main>
  );
}
