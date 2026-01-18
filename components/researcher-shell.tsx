"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusSquare,
  ClipboardList,
  LineChart,
  FlaskConical,
  LifeBuoy,
  Settings,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  { href: "/researcher", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/researcher/postings/new", label: "Add a posting", Icon: PlusSquare },
  { href: "/researcher/postings/mine", label: "Your postings", Icon: ClipboardList },
  { href: "/researcher/explore", label: "Explore patterns", Icon: LineChart },
  { href: "/researcher/ongoing", label: "Ongoing research", Icon: FlaskConical },
];

const footerItems: NavItem[] = [
  { href: "/researcher/profile", label: "Profile", Icon: User },
  { href: "/researcher/settings", label: "Settings", Icon: Settings },
  { href: "/researcher/help", label: "Help", Icon: LifeBuoy },
];

function isActive(pathname: string, href: string) {
  if (href === "/researcher") return pathname === "/researcher";
  return pathname.startsWith(href);
}

function ResearcherSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="shrink-0">
      <SidebarHeader>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-neutral-body">Platform</p>
          <p className={"truncate text-sm font-semibold text-ink" + (!open ? " sr-only" : "")}>
            NeuroLens
          </p>
        </div>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <SidebarMenuButton key={href} isActive={active} asChild>
                <Link href={href} aria-current={active ? "page" : undefined}>
                  <Icon
                    className={"h-5 w-5 shrink-0" + (active ? " text-primary" : " text-neutral-body")}
                    aria-hidden="true"
                  />
                  <span className={open ? "truncate text-ink" : "sr-only"}>{label}</span>
                  {!open ? <span className="sr-only">{label}</span> : null}
                </Link>
              </SidebarMenuButton>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="my-2 h-px bg-black/10" />
        <SidebarMenu>
          {footerItems.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <SidebarMenuButton key={href} isActive={active} asChild>
                <Link href={href} aria-current={active ? "page" : undefined}>
                  <Icon
                    className={"h-5 w-5 shrink-0" + (active ? " text-primary" : " text-neutral-body")}
                    aria-hidden="true"
                  />
                  <span className={open ? "truncate text-ink" : "sr-only"}>{label}</span>
                  {!open ? <span className="sr-only">{label}</span> : null}
                </Link>
              </SidebarMenuButton>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function ResearcherShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const activeLabel = useMemo(() => {
    const match = navItems.find((item) => isActive(pathname, item.href));
    return match?.label ?? "Research";
  }, [pathname]);

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-dvh bg-surface-canvas text-neutral-heading">
        <div className="w-full md:flex md:items-stretch md:gap-6">
          <ResearcherSidebar />

          <div className="min-w-0 flex-1">
            <header className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur md:hidden">
              <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
                <SidebarTrigger className="shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{activeLabel}</p>
                  <p className="truncate text-xs font-medium text-neutral-body">NeuroLens</p>
                </div>
              </div>
            </header>

            <main className="px-4 pb-10 pt-6 md:px-8 md:pb-10 md:pt-10">
              <div className="mx-auto w-full max-w-4xl">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
