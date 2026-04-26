import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  const code = (params.code ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16);

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = code ? `?ref=${encodeURIComponent(code)}` : "";

  const response = NextResponse.redirect(url);
  if (code) {
    response.cookies.set("rl_ref", code, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}
