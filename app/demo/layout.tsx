import type { ReactNode } from "react";
import { DemoShell } from "@/components/demo/DemoShell";

export const metadata = {
  title: "Demo — Redline",
  description: "Explore Redline before signing up. Fully interactive demo with fake data.",
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <DemoShell>{children}</DemoShell>;
}
