// Runs on every request.
// 1. Refreshes the Supabase session cookie.
// 2. If user is NOT logged in and tries to visit /dashboard/*, send them to /login.
// 3. If user is logged in but not onboarded, redirect to /onboarding.
// 4. If user is already onboarded and visits /onboarding, redirect to /dashboard.
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const isDashboard = path.startsWith("/dashboard");
  const isLogin = path === "/login";
  const isOnboarding = path.startsWith("/onboarding");

  if (!isDashboard && !isLogin && !isOnboarding) {
    return response;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (isDashboard) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  // No user: gate dashboard and onboarding routes
  if (!user) {
    if (isDashboard || isOnboarding) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // User exists: redirect away from login
  if (isLogin) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // Check onboarding status for dashboard + onboarding routes
  if (isDashboard || isOnboarding) {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("onboarded")
      .eq("user_id", user.id)
      .single();

    const onboarded = settings?.onboarded ?? false;

    // Onboarded user visiting /onboarding → /dashboard
    if (isOnboarding && onboarded) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }

    // Not onboarded visiting /dashboard → /onboarding
    if (isDashboard && !onboarded) {
      const onboardUrl = request.nextUrl.clone();
      onboardUrl.pathname = "/onboarding";
      return NextResponse.redirect(onboardUrl);
    }
  }

  return response;
}

export const config = {
  // Run middleware on every page EXCEPT static files and images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
