"use client";

import { ReactNode, useState } from "react";
import api from "@/lib/api";

interface Props {
  portfolio: any;
  activeMenu: string;
  lang: "id" | "en";
  onLangChange: (lang: "id" | "en") => void;
  onTogglePublish: () => void;
  setPortfolio: (value: any) => void;
  account: ReactNode;
}

export default function DashboardPortfolioControls({
  portfolio,
  activeMenu,
  lang,
  onLangChange,
  onTogglePublish,
  setPortfolio,
  account,
}: Props) {
  const [editingSlug, setEditingSlug] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [editingDomain, setEditingDomain] = useState(false);
  const [domain, setDomain] = useState("");
  const [domainError, setDomainError] = useState("");
  const isAdmin = activeMenu !== "superadmin" && activeMenu !== "users";
  const saveSlug = async () => {
    try {
      const response = await api.patch(`/api/portfolios/${portfolio.id}`, {
        slug,
      });
      setPortfolio({ ...portfolio, slug: response.data.slug });
      setEditingSlug(false);
      setSlugError("");
    } catch (error: any) {
      setSlugError(error.response?.data?.message || "Unable to update slug");
    }
  };
  const saveDomain = async () => {
    try {
      await api.patch(`/api/portfolios/${portfolio.id}`, {
        custom_domain: domain,
      });
      setPortfolio({ ...portfolio, custom_domain: domain || null });
      setEditingDomain(false);
      setDomainError("");
    } catch (error: any) {
      setDomainError(
        error.response?.data?.message || "Unable to update domain",
      );
    }
  };
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 py-2">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
        <span className="text-xs uppercase tracking-[0.16em] text-slate-500">
          {activeMenu === "superadmin" ? "PortfolioKit Admin" : "Portfolio"}
        </span>
        {isAdmin && (
          <>
            <span className="max-w-48 truncate font-medium text-white">
              {portfolio?.title || "Untitled portfolio"}
            </span>
            {portfolio && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${portfolio.is_published ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-400"}`}
              >
                {portfolio.is_published ? "Live" : "Draft"}
              </span>
            )}
            {portfolio && !editingSlug && (
              <button
                type="button"
                onClick={() => {
                  setSlug(portfolio.slug);
                  setEditingSlug(true);
                  setSlugError("");
                }}
                className="text-xs text-slate-500 hover:text-purple-300"
              >
                /{portfolio.slug}
              </button>
            )}
            {editingSlug && (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={slug}
                  onChange={(event) =>
                    setSlug(
                      event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-"),
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveSlug();
                    if (event.key === "Escape") setEditingSlug(false);
                  }}
                  className="w-32 rounded-lg border border-purple-400 bg-slate-900 px-2 py-1 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={saveSlug}
                  className="text-xs text-emerald-300"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSlug(false)}
                  className="text-xs text-slate-500"
                >
                  Cancel
                </button>
                {slugError && (
                  <span className="text-xs text-red-300">{slugError}</span>
                )}
              </div>
            )}
            {portfolio && !editingDomain && (
              <button
                type="button"
                onClick={() => {
                  setDomain(portfolio.custom_domain || "");
                  setEditingDomain(true);
                  setDomainError("");
                }}
                className="text-xs text-slate-500 hover:text-purple-300"
              >
                {portfolio.custom_domain || "+ domain"}
              </button>
            )}
            {editingDomain && (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={domain}
                  onChange={(event) =>
                    setDomain(event.target.value.toLowerCase())
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveDomain();
                    if (event.key === "Escape") setEditingDomain(false);
                  }}
                  className="w-36 rounded-lg border border-purple-400 bg-slate-900 px-2 py-1 text-xs text-white"
                  placeholder="domain.com"
                />
                <button
                  type="button"
                  onClick={saveDomain}
                  className="text-xs text-emerald-300"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDomain(false)}
                  className="text-xs text-slate-500"
                >
                  Cancel
                </button>
                {domainError && (
                  <span className="text-xs text-red-300">{domainError}</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {portfolio && isAdmin && (
          <button
            type="button"
            onClick={onTogglePublish}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium ${portfolio.is_published ? "bg-red-500/15 text-red-300" : "bg-emerald-500/15 text-emerald-300"}`}
          >
            {portfolio.is_published ? "Unpublish" : "Publish"}
          </button>
        )}
        {portfolio?.is_published && (
          <a
            href={`/portfolio/${portfolio.slug}`}
            target="_blank"
            className="rounded-xl bg-purple-500/15 px-3 py-1.5 text-xs font-medium text-purple-300"
          >
            View live
          </a>
        )}
        <button
          type="button"
          onClick={() => onLangChange(lang === "id" ? "en" : "id")}
          className="rounded-xl border border-white/10 px-2.5 py-1.5 text-xs text-slate-300"
        >
          {lang.toUpperCase()}
        </button>
        <div className="h-6 w-px bg-white/10" />
        {account}
      </div>
    </div>
  );
}
