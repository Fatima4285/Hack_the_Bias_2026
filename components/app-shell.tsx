"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpenCheck,
  Handshake,
  LifeBuoy,
  MessageSquareHeart,
  Settings,
  Sparkles,
  User,
  NotebookText,
  Search,
  LayoutDashboard,
  PlusSquare,
  ClipboardList,
  LineChart,
  FlaskConical,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
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
  Icon: typeof BookOpenCheck;
};

const participantNavItems: NavItem[] = [
  { href: "/", label: "Journal", Icon: BookOpenCheck },
  { href: "/experiences", label: "Your Experiences", Icon: NotebookText},
  { href: "/insights", label: "Insights", Icon: Sparkles },
];

const researcherNavItems: NavItem[] = [
  { href: "/researcher/postings/mine", label: "Your Research", Icon: ClipboardList },
  { href: "/researcher/explore", label: "Explore Patterns", Icon: LineChart },
];

const NavFooterItems: NavItem[] = [
  { href: "/profile", label: "Profile", Icon: User },
];


function isActive(pathname: string, href: string) {
  if (href === "/" || href === "/researcher") return pathname === href;
  return pathname.startsWith(href);
}

function AppSidebar({ role }: { role: "participant" | "researcher" | null }) {
  const pathname = usePathname();
  const { open } = useSidebar();

  const navItems = role === "researcher" ? researcherNavItems : participantNavItems;

  return (
    <Sidebar collapsible="icon" className="shrink-0">
      <SidebarHeader>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-neutral-body">Platform</p>
          <p
            className={
              "truncate text-sm font-semibold text-ink" + (!open ? " sr-only" : "")
            }
          >
            Miss NeuroVerse
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
                    className={
                      "h-5 w-5 shrink-0" +
                      (active ? " text-primary" : " text-neutral-body")
                    }
                    aria-hidden="true"
                  />
                  <span className={open ? "truncate text-ink" : "sr-only"}>
                    {label}
                  </span>
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
          {NavFooterItems.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <SidebarMenuButton key={href} isActive={active} asChild>
                <Link href={href} aria-current={active ? "page" : undefined}>
                  <Icon
                    className={
                      "h-5 w-5 shrink-0" +
                      (active ? " text-primary" : " text-neutral-body")
                    }
                    aria-hidden="true"
                  />
                  <span className={open ? "truncate text-ink" : "sr-only"}>
                    {label}
                  </span>
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

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading } = useAuth();

  const isAuthRoute = pathname === "/auth/login" || pathname === "/auth/signup";

  useEffect(() => {
    if (!loading && !user && !isAuthRoute) {
      router.replace("/auth/login");
    }
  }, [loading, user, isAuthRoute, router]);

  const activeLabel = useMemo(() => {
    const currentItems = role === "researcher" ? [...researcherNavItems, ...NavFooterItems] : [...participantNavItems, ...NavFooterItems];
    const match = currentItems.find((item) => isActive(pathname, item.href));
    return match?.label ?? "NeuroLens";
  }, [pathname, role]);

  if (isAuthRoute) {
    return (
      <div className="min-h-dvh bg-surface-canvas text-neutral-heading">
        <main className="px-4 py-10">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </main>
      </div>
    );
  }

  if (loading || !user) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-dvh bg-surface-canvas text-neutral-heading">
        <div className="w-full md:flex md:items-stretch md:gap-6">
          <AppSidebar role={role} />

          <div className="min-w-0 flex-1">
            {/* Mobile top bar with sidebar drawer trigger */}
            <header className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur md:hidden">
              <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
                <SidebarTrigger className="shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {activeLabel}
                  </p>
                  <p className="truncate text-xs font-medium text-neutral-body">
                    NeuroLens
                  </p>
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
