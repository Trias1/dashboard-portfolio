"use client";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useSearchParams } from "next/navigation";
import { getThemeById } from "@/lib/sections";
import type { TemplateSectionOrder } from "@/types";
import type { PublicPortfolio } from "@/lib/public-portfolio";
import ModernTemplate from "@/templates/modern";
import CreativeTemplate from "@/templates/creative";
import MinimalTemplate from "@/templates/minimal";
import BoldTemplate from "@/templates/bold";
import ClassicTemplate from "@/templates/classic";
import NeonTemplate from "@/templates/neon";
import GlassTemplate from "@/templates/glass";
import NatureTemplate from "@/templates/nature";
import VibrantTemplate from "@/templates/vibrant";
import RetroTemplate from "@/templates/retro";
import ImmersiveTemplate from "@/templates/immersive";
import PlayfulTemplate from "@/templates/playful";
import DeveloperTemplate from "@/templates/developer";
import SwissTemplate from "@/templates/swiss";
import WhiteTemplate from "@/templates/white";
import AgencyTemplate from "@/templates/agency";
import BoldPersonaTemplate from "@/templates/boldpersona";
import ChatWidget from "@/components/ChatWidget";
import AdvisorFloating from "@/components/AdvisorFloating";
import { AI_ENABLED } from "@/lib/features";
import OrderSections from "@/components/OrderSections";
import PortfolioShare from "@/components/PortfolioShare";

type PortfolioPageData = {
  portfolio: { template?: string; theme?: string; sections_order: TemplateSectionOrder[]; title?: string; slug: string };
  about?: { name?: string; bio?: string; photo_url?: string };
  hero?: { subheadline?: string };
  [key: string]: unknown;
};

// Each template takes the same props; typed loosely here because their data props differ slightly.
type TemplateProps = { data: PortfolioPageData; theme: ReturnType<typeof getThemeById>; isPreview: boolean };
const TEMPLATES: Record<string, ComponentType<TemplateProps>> = {
  modern: ModernTemplate, creative: CreativeTemplate, minimal: MinimalTemplate, bold: BoldTemplate,
  classic: ClassicTemplate, neon: NeonTemplate, glass: GlassTemplate, nature: NatureTemplate,
  vibrant: VibrantTemplate, retro: RetroTemplate, immersive: ImmersiveTemplate, playful: PlayfulTemplate,
  developer: DeveloperTemplate, swiss: SwissTemplate, white: WhiteTemplate, agency: AgencyTemplate,
  boldpersona: BoldPersonaTemplate,
} as unknown as Record<string, ComponentType<TemplateProps>>;

// One visit per page load, also when React Strict Mode runs effects twice in development.
const countedVisits = new Set<string>();

/** The public portfolio page body. The server loads `initial`; this applies preview-only overrides and widgets. */
export default function PublicPortfolioView({ initial }: { initial: PublicPortfolio }) {
  const searchParams = useSearchParams();
  const rawData = initial as unknown as PortfolioPageData & { preview?: boolean };
  // ?template=, ?theme= and ?order= only apply when the server confirmed a real preview (the owner or a
  // superadmin, or the built-in demo data); adding ?preview=true can't restyle someone's live portfolio.
  const previewAllowed = searchParams.get("preview") === "true" && rawData.preview === true;
  const orderParam = previewAllowed ? searchParams.get("order") : null;
  const themeParam = previewAllowed ? searchParams.get("theme") : null;
  // Landing-page showcase: the parent switches templates by message instead of reloading the frame.
  const isShowcase = previewAllowed && searchParams.get("showcase") === "1";
  const [showcaseTemplate, setShowcaseTemplate] = useState<string | null>(null);
  const slug = rawData.portfolio.slug;

  // Query-param overrides (order/theme) are applied without refetching.
  const data = useMemo<PortfolioPageData>(() => {
    if (!orderParam) return rawData;
    try {
      return { ...rawData, portfolio: { ...rawData.portfolio, sections_order: JSON.parse(orderParam) } };
    } catch {
      return rawData;
    }
  }, [rawData, orderParam]);
  const theme = useMemo(() => getThemeById(themeParam || rawData.portfolio?.theme), [rawData, themeParam]);
  const urlTemplate = previewAllowed ? searchParams.get("template") : null;
  const templateName = showcaseTemplate || urlTemplate || data.portfolio?.template || "modern";

  // Count the visit from the browser, after load: crawlers and link previews fetch the HTML but rarely run this.
  useEffect(() => {
    if (previewAllowed || slug === "demo" || countedVisits.has(slug)) return;
    countedVisits.add(slug);
    fetch(`/api/public/${encodeURIComponent(slug)}/visit`, { method: "POST", keepalive: true }).catch(() => {});
  }, [previewAllowed, slug]);

  useEffect(() => {
    if (!isShowcase) return;
    const onMessage = (e: MessageEvent) => {
      // Only the page embedding this frame, on our own origin, may switch the template
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      const msg = e.data as { type?: unknown; template?: unknown };
      if (msg?.type === "pk:showcase-template" && typeof msg.template === "string") setShowcaseTemplate(msg.template);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [isShowcase]);

  // Tell the showcase once the template has been painted, so it can cross-fade without a blank frame
  useEffect(() => {
    if (!isShowcase) return;
    const timer = window.setTimeout(() => {
      window.parent.postMessage({ type: "pk:showcase-rendered", template: templateName }, window.location.origin);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [isShowcase, templateName]);

  const accentColor = theme.accent;
  const widget = isShowcase ? null : previewAllowed ? (
    AI_ENABLED ? <AdvisorFloating accentColor={accentColor} /> : null
  ) : (
    <>
      <PortfolioShare title={data.about?.name || data.portfolio.title || data.portfolio.slug} accentColor={accentColor} />
      {AI_ENABLED && <ChatWidget slug={data.portfolio.slug} accentColor={accentColor} ownerName={data.about?.name} />}
    </>
  );
  const Template = TEMPLATES[templateName] || TEMPLATES.modern;

  return (
    <OrderSections sections_order={data.portfolio?.sections_order}>
      <Template data={data} theme={theme} isPreview={previewAllowed} />
      {widget}
    </OrderSections>
  );
}
