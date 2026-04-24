"use client";

import { useRouter } from "next/navigation";

import { LandingPage } from "@/components/redline-prototype";

export default function HomePage() {
  const router = useRouter();

  function navigate(route: string) {
    if (route === "landing") router.push("/");
    if (route === "login") router.push("/login");
    if (route === "dashboard") router.push("/dashboard");
    if (route === "new") router.push("/dashboard/invoices/new");
  }

  return <LandingPage onNav={navigate} />;
}
