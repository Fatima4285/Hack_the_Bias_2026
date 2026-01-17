"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  state: "expanded" | "collapsed";
  toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const onChange = () => setIsMobile(mediaQuery.matches);
    onChange();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    }

    // Legacy Safari fallback
    const legacy = mediaQuery as unknown as {
      addListener: (listener: () => void) => void;
      removeListener: (listener: () => void) => void;
    };
    legacy.addListener(onChange);
    return () => legacy.removeListener(onChange);
  }, [breakpointPx]);

  return isMobile;
}

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
}

type SidebarProviderProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  const state: SidebarContextValue["state"] = open ? "expanded" : "collapsed";

  const toggle = React.useCallback(() => {
    if (isMobile) setOpenMobile((v) => !v);
    else setOpen((v) => !v);
  }, [isMobile]);

  const value = React.useMemo<SidebarContextValue>(
    () => ({ open, setOpen, openMobile, setOpenMobile, isMobile, state, toggle }),
    [open, openMobile, isMobile, state, toggle]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

type SidebarProps = {
  children: React.ReactNode;
  collapsible?: "icon" | false;
  className?: string;
};

function Sidebar({ children, collapsible = "icon", className }: SidebarProps) {
  const { open, openMobile, setOpenMobile, isMobile, state } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="p-0">
          <div className="h-dvh w-[320px] bg-white">
            <div className="h-full rounded-none border-r border-black/10">
              <div className="flex h-full flex-col">{children}</div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const collapsed = collapsible === "icon" && !open;

  return (
    <aside
      data-state={state}
      className={cn(
        "hidden md:block",
        className
      )}
    >
      <div className="sticky top-0 h-dvh p-4">
        <div
          className={cn(
            "h-full rounded-2xl border border-black/10 bg-white shadow-sm transition-[width] duration-200",
            collapsed ? "w-20" : "w-72"
          )}
        >
          <div className="flex h-full flex-col">{children}</div>
        </div>
      </div>
    </aside>
  );
}

type SidebarTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, asChild, ...props }, ref) => {
    const { toggle, isMobile } = useSidebar();
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-ink shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/60",
          className
        )}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          props.onClick?.(e);
          toggle();
        }}
        aria-label={isMobile ? "Open navigation" : "Toggle sidebar"}
        {...props}
      >
        <PanelLeft className="h-5 w-5" aria-hidden="true" />
      </Comp>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger";

function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { state } = useSidebar();
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 p-4",
        className
      )}
      data-state={state}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-2 pb-4", className)} {...props} />
  );
}

function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-auto px-2 pb-4", className)} {...props} />
  );
}

function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

type SidebarMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  isActive?: boolean;
};

function SidebarMenuButton({
  className,
  isActive,
  asChild,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/60",
        isActive
          ? "bg-secondary text-ink"
          : "text-neutral-body hover:bg-secondary",
        className
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
