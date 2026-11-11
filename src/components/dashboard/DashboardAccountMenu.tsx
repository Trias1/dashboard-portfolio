"use client";

import { useEffect, useRef } from "react";
import type { DashboardUser } from "@/types";

interface Props {
  user: DashboardUser | null;
  open: boolean;
  onToggle: () => void;
  onProfile: () => void;
  onLogout: () => void;
}

export default function DashboardAccountMenu({
  user,
  open,
  onToggle,
  onProfile,
  onLogout,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // A plain disclosure: Escape (focus back on the button) or a click outside closes it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onToggle();
      buttonRef.current?.focus();
    };
    const onPointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) onToggle();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, onToggle]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="account-menu"
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-md py-1 pl-1 pr-1.5 transition-colors hover:bg-paper-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
          id="account-menu"
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
            onClick={onProfile}
            className="mt-1 w-full px-3 py-1.5 text-left text-sm text-ink hover:bg-paper"
          >
            Edit profile
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full px-3 py-1.5 text-left text-sm text-red-700 hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
