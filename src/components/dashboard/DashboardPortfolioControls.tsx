"use client";

import { ReactNode, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import type { DashboardPortfolio } from "@/types";

interface Props {
  portfolio: DashboardPortfolio | null;
  activeMenu: string;
  lang: "id" | "en";
  onLangChange: (lang: "id" | "en") => void;
  onTogglePublish: () => void;
  setPortfolio: (value: DashboardPortfolio) => void;
  account: ReactNode;
}

const quietInput =
  "rounded-md border border-rule bg-white px-2 py-1 font-mono text-xs text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10";
const textButton =
  "rounded px-1.5 py-0.5 text-xs font-medium text-ink-soft hover:bg-paper-deep hover:text-ink";
const linkish =
  "truncate text-xs text-ink-soft underline-offset-2 hover:text-ink hover:underline";

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
    if (!portfolio) return;
    try {
      const response = await api.patch<Pick<DashboardPortfolio, "slug">>(`/api/portfolios/${portfolio.id}`, {
        slug,
      });
      setPortfolio({ ...portfolio, slug: response.data.slug });
      setEditingSlug(false);
      setSlugError("");
    } catch (error) {
      setSlugError(getApiErrorMessage(error, "Unable to update slug"));
    }
  };
  const saveDomain = async () => {
    if (!portfolio) return;
    try {
      await api.patch(`/api/portfolios/${portfolio.id}`, {
        custom_domain: domain,
      });
      setPortfolio({ ...portfolio, custom_domain: domain || null });
      setEditingDomain(false);
      setDomainError("");
    } catch (error) {
      setDomainError(getApiErrorMessage(error, "Unable to update domain"));
    }
  };
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {!isAdmin && (
          <span className="text-sm font-medium text-ink">Admin</span>
        )}
        {isAdmin && (
          <>
            <span className="max-w-48 truncate font-medium text-ink">
              {portfolio?.title || (lang === "id" ? "Portfolio tanpa judul" : "Untitled portfolio")}
            </span>
            {portfolio && (
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full ${portfolio.is_published ? "bg-emerald-600" : "bg-[#b0b0a8]"}`}
                />
                {portfolio.is_published ? "Live" : "Draft"}
              </span>
            )}
            {portfolio && !editingSlug && (
              <button
                type="button"
                title={lang === "id" ? "Ubah alamat" : "Change address"}
                onClick={() => {
                  setSlug(portfolio.slug);
                  setEditingSlug(true);
                  setSlugError("");
                }}
                className={`max-w-56 font-mono ${linkish}`}
              >
                /portfolio/{portfolio.slug}
              </button>
            )}
            {editingSlug && (
              <div className="flex flex-wrap items-center gap-1">
                <label htmlFor="portfolio-slug" className="sr-only">Slug</label>
                <input
                  id="portfolio-slug"
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
                  className={`w-36 ${quietInput}`}
                />
                <button type="button" onClick={saveSlug} className="rounded px-1.5 py-0.5 text-xs font-medium text-accent hover:bg-paper-deep hover:text-accent-dark">
                  {lang === "id" ? "Simpan" : "Save"}
                </button>
                <button type="button" onClick={() => setEditingSlug(false)} className={textButton}>
                  {lang === "id" ? "Batal" : "Cancel"}
                </button>
                {slugError && (
                  <span role="alert" className="text-xs text-red-700">{slugError}</span>
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
                className={`max-w-48 ${portfolio.custom_domain ? "font-mono " : ""}${linkish}`}
              >
                {portfolio.custom_domain || (lang === "id" ? "Pasang domain" : "Add domain")}
              </button>
            )}
            {editingDomain && (
              <div className="flex flex-wrap items-center gap-1">
                <label htmlFor="portfolio-domain" className="sr-only">Domain</label>
                <input
                  id="portfolio-domain"
                  autoFocus
                  value={domain}
                  onChange={(event) =>
                    setDomain(event.target.value.toLowerCase())
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveDomain();
                    if (event.key === "Escape") setEditingDomain(false);
                  }}
                  className={`w-40 ${quietInput}`}
                  placeholder="domain.com"
                />
                <button type="button" onClick={saveDomain} className="rounded px-1.5 py-0.5 text-xs font-medium text-accent hover:bg-paper-deep hover:text-accent-dark">
                  {lang === "id" ? "Simpan" : "Save"}
                </button>
                <button type="button" onClick={() => setEditingDomain(false)} className={textButton}>
                  {lang === "id" ? "Batal" : "Cancel"}
                </button>
                {domainError && (
                  <span role="alert" className="text-xs text-red-700">{domainError}</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {portfolio?.is_published && (
          <a
            href={`/portfolio/${portfolio.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-rule bg-white px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink-soft"
          >
            {lang === "id" ? "Lihat" : "View live"}
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
              <path d="M6 3h7v7 M13 3L4 12" />
            </svg>
          </a>
        )}
        {portfolio && isAdmin && (
          <button
            type="button"
            onClick={onTogglePublish}
            className={portfolio.is_published
              ? "rounded-md border border-rule bg-white px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-ink-soft hover:text-ink"
              : "rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-black"}
          >
            {portfolio.is_published
              ? (lang === "id" ? "Batalkan terbit" : "Unpublish")
              : (lang === "id" ? "Terbitkan" : "Publish")}
          </button>
        )}
        <div role="group" aria-label="Language" className="flex overflow-hidden rounded-md border border-rule bg-white text-[11px] font-medium">
          {(["id", "en"] as const).map((code) => (
            <button
              key={code}
              type="button"
              aria-pressed={lang === code}
              onClick={() => { if (lang !== code) onLangChange(code); }}
              className={`px-2 py-1.5 font-mono uppercase transition-colors ${lang === code ? "bg-paper-deep text-ink" : "text-ink-soft hover:text-ink"}`}
            >
              {code}
            </button>
          ))}
        </div>
        <div className="mx-0.5 h-5 w-px bg-rule" aria-hidden="true" />
        {account}
      </div>
    </div>
  );
}
