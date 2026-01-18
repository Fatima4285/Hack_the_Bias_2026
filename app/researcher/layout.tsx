import type { ReactNode } from "react";
import ResearcherShell from "@/components/researcher-shell";

export default function ResearcherLayout({ children }: { children: ReactNode }) {
  return <ResearcherShell>{children}</ResearcherShell>;
}
