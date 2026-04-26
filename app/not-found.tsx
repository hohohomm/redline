import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function NotFound() {
  let user: { id?: string } | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Auth check failed, default to public link
  }

  const href = user ? "/dashboard" : "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-5xl font-bold text-stone-100 mb-4">Lost thread.</h1>
        <p className="text-lg text-stone-400 mb-8">
          The page you asked for isn&apos;t here.
        </p>
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-[18px] px-6 py-3 bg-[#ff4b3e] text-white font-medium transition hover:-translate-y-0.5 shadow-[0_18px_42px_rgba(255,75,62,0.22)]"
        >
          Go back
        </Link>
      </div>
    </div>
  );
}
