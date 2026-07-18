"use client";

interface DashboardSidebarProps {
  role?: string;
  lang: "id" | "en";
  activeMenu: string;
  sidebarOpen: boolean;
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
      strokeWidth="1.8"
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
  lang,
  activeMenu,
  sidebarOpen,
  setActiveMenu,
  setSidebarOpen,
  usersLabel,
}: DashboardSidebarProps) {
  const items =
    role === "superadmin"
      ? [
          { key: "superadmin", label: "Server", icon: "server" },
          { key: "users", label: usersLabel, icon: "users" },
        ]
      : [
          { key: "builder", label: "Builder", icon: "builder" },
          { key: "advisor", label: "AI Advisor", icon: "advisor" },
          {
            key: "analytics",
            label: lang === "id" ? "Statistik" : "Analytics",
            icon: "analytics",
          },
          { key: "github", label: "GitHub Import", icon: "github" },
          { key: "cv", label: "CV Generator", icon: "cv" },
        ];

  return (
    <aside
      className={`${sidebarOpen ? "w-64" : "w-16"} transition-[width] duration-300 bg-slate-950/90 border-r border-white/10 flex flex-col shrink-0`}
    >
      <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between">
        {sidebarOpen && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-purple-300">
              PortfolioKit
            </p>
            <h1 className="text-sm font-semibold text-white">
              {lang === "id" ? "Dashboard" : "Workspace"}
            </h1>
          </div>
        )}
        <button
          type="button"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-9 w-9 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition"
        >
          {sidebarOpen ? "‹" : "›"}
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActiveMenu(item.key)}
            className={`w-full rounded-xl px-3 py-3 text-left text-sm font-medium flex items-center gap-3 transition ${activeMenu === item.key ? "bg-purple-500 text-white shadow-lg shadow-purple-950/40" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}
          >
            <MenuIcon name={item.icon} />
            {sidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}
