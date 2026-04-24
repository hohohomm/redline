// Small helper used by the shadcn component library.
// Merges Tailwind class strings safely (dedupes + resolves conflicts).
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
