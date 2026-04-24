"use client";

import { useRouter } from "next/navigation";

import { DashboardHome, DashboardShell } from "@/components/redline-prototype";

export default function DashboardPage() {
  const router = useRouter();

  function navigate(route: string) {
    if (route === "landing") router.push("/");
    if (route === "login") router.push("/login");
    if (route === "dashboard") router.push("/dashboard");
    if (route === "new") router.push("/dashboard/invoices/new");
  }

  return (
    <DashboardShell route="dashboard" onNav={navigate}>
      <DashboardHome onNav={navigate} />
    </DashboardShell>
  );
}
