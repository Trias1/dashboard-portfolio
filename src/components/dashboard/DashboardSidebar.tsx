"use client";
import { AI_ENABLED } from "@/lib/features";

interface DashboardSidebarProps {
  role?: string;
  activeMenu: string;
  /** null = responsive default: collapsed below `md`, expanded from `md` up. */
  sidebarOpen: boolean | null;
  setActiveMenu: (menu: string) => void;
  setSidebarOpen: (open: boolean) => void;
  usersLabel: string;
}

const paths: Record<string, string> = {
  builder: "M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h5",
  advisor: "M12 3a6 6 0 0 0-3 11.2V17h6v-2.8A6 6 0 0 0 12 3z M9 21h6",
  analytics: "M4 19V5 M4 19h16 M8 16v-4 M12 16V8 M16 16v-7",
  github:
    "M12 3a9 9 0 0 0-3 17.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.5 1 1 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.7-1.4-2.2-.3-4.5-1.1-4.5-5A3.9 3.9 0 0 1 7 9.6a3.6 3.6 0 0 1 .1-2.8s.8-.3 2.9 1.1a10 10 0 0 1 5.3 0c2.1-1.4 2.9-1.1 2.9-1.1a3.6 3.6 0 0 1 .1 2.8 3.9 3.9 0 0 1 1 2.7c0 3.9-2.3 4.7 0 5 .4.3.7 1 .7 2v2.7c0 .3.2.6.7.5A9 9 0 0 0 12 3z",
  cv: "M6 3h9l3 3v15H6z M15 3v4h4 M9 12h6 M9 16h6",
  server: "M4 5h16v5H4z M4 14h16v5H4z M7 7h.01 M7 16h.01 M10 7h7 M10 16h7",
  overview: "M4 19V5 M4 19h16 M8 16v-4 M12 16V8 M16 16v-7",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M20 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",
};

function MenuIcon({ name }: { name: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
    >
      <path d={paths[name] || paths.builder} />
    </svg>
  );
}

export default function DashboardSidebar({
  role,
  activeMenu,
  sidebarOpen,
  setActiveMenu,
  setSidebarOpen,
  usersLabel,
}: DashboardSidebarProps) {
  const items =
    role === "superadmin"
      ? [
          { key: "overview", label: "Overview", icon: "overview" },
          { key: "superadmin", label: "Server", icon: "server" },
          { key: "users", label: usersLabel, icon: "users" },
        ]
      : [
          { key: "builder", label: "Builder", icon: "builder" },
          ...(AI_ENABLED ? [{ key: "advisor", label: "Advisor", icon: "advisor" }] : []),
          {
            key: "analytics",
            label: "Analytics",
            icon: "analytics",
          },
          { key: "github", label: "GitHub import", icon: "github" },
          { key: "cv", label: "CV", icon: "cv" },
        ];

  const isAuto = sidebarOpen === null;
  const widthClass = isAuto ? "w-16 md:w-64" : sidebarOpen ? "w-64" : "w-16";
  const expandedOnlyClass = isAuto ? "hidden md:block" : "";
  const toggleSidebar = () => {
    const currentlyOpen = isAuto
      ? window.matchMedia("(min-width: 768px)").matches
      : sidebarOpen;
    setSidebarOpen(!currentlyOpen);
  };

  return (
    <aside
      className={`${widthClass} flex shrink-0 flex-col border-r border-rule bg-paper-deep text-ink transition-[width] duration-200`}
    >
      <div className="flex h-14 items-center justify-between gap-2 border-b border-rule px-3">
        {sidebarOpen !== false && (
          <span className={`${expandedOnlyClass} truncate pl-1.5 font-display text-[17px] font-semibold tracking-tight`}>
            PortfolioKit
          </span>
        )}
        <button
          type="button"
          aria-label={isAuto ? "Toggle sidebar" : sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          onClick={toggleSidebar}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M4 5h16v14H4z M9 5v14" />
          </svg>
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 p-2" aria-label="Dashboard">
        {items.map((item) => {
          const active = activeMenu === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveMenu(item.key)}
              title={item.label}
              aria-current={active ? "page" : undefined}
              className={`flex w-full items-center gap-2.5 rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15 ${active ? "border-rule bg-white font-medium text-ink" : "border-transparent text-ink-soft hover:bg-white/60 hover:text-ink"}`}
            >
              <span className={active ? "text-accent" : ""}>
                <MenuIcon name={item.icon} />
              </span>
              {sidebarOpen !== false && <span className={`truncate ${isAuto ? "hidden md:inline" : ""}`}>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
