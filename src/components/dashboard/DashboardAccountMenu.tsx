"use client";

import type { DashboardUser } from "@/types";

interface Props {
  user: DashboardUser | null;
  lang: "id" | "en";
  open: boolean;
  onToggle: () => void;
  onProfile: () => void;
  onLogout: () => void;
}

export default function DashboardAccountMenu({
  user,
  lang,
  open,
  onToggle,
  onProfile,
  onLogout,
}: Props) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={lang === "id" ? "Menu akun" : "Account menu"}
        className="flex items-center gap-2 rounded-md py-1 pl-1 pr-1.5 transition-colors hover:bg-paper-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
      >
        <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-rule bg-paper-deep text-xs font-semibold text-ink">
          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            user?.name?.charAt(0)?.toUpperCase() || "?"
          )}
        </div>
        <span className="hidden text-sm text-ink sm:block">
          {user?.name?.split(" ")[0]}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3 w-3 text-ink-soft transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-md border border-rule bg-white py-1 shadow-[0_8px_24px_rgba(20,20,20,0.08)]"
        >
          <div className="border-b border-rule px-3 pb-2.5 pt-2">
            <p className="truncate text-sm font-medium text-ink">
              {user?.name}
            </p>
            <p className="truncate text-xs text-ink-soft">{user?.email}</p>
            <p className="mt-1.5 font-mono text-[11px] text-ink-soft">
              {user?.role}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={onProfile}
            className="mt-1 w-full px-3 py-1.5 text-left text-sm text-ink hover:bg-paper"
          >
            {lang === "id" ? "Edit profil" : "Edit profile"}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="w-full px-3 py-1.5 text-left text-sm text-red-700 hover:bg-red-50"
          >
            {lang === "id" ? "Keluar" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
