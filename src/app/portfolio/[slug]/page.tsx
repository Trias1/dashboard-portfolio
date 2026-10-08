"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { themes, getThemeById } from "@/lib/sections";
import type { TemplateSectionOrder } from "@/types";
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
import OrderSections from "@/components/OrderSections";
import PortfolioShare from "@/components/PortfolioShare";

type PortfolioPageData = {
  portfolio: { template?: string; theme?: string; sections_order: TemplateSectionOrder[]; title?: string; slug: string };
  about?: { name?: string; bio?: string; photo_url?: string };
  hero?: { subheadline?: string };
  [key: string]: unknown;
};

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const [result, setResult] = useState<{ key: string; data: PortfolioPageData | null; notFound: boolean } | null>(null);
  const isPreview = searchParams.get("preview") === "true";
  const orderParam = isPreview ? searchParams.get("order") : null;
  const themeParam = searchParams.get("theme");
  const requestKey = `${slug}|${isPreview}`;
  // Loading resets automatically whenever the slug/preview mode changes.
  const loading = result?.key !== requestKey;
  const rawData = loading ? null : result.data;
  const notFound = !loading && result.notFound;
  // Guards against duplicate fetches (and duplicate visit counts) for the same
  // slug, e.g. React Strict Mode re-running effects in development.
  const requestKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (requestKeyRef.current === requestKey) return;
    requestKeyRef.current = requestKey;
    api
      .get(`/api/public/${slug}${isPreview ? "?preview=true" : ""}`)
      .then((res) => {
        if (requestKeyRef.current !== requestKey) return;
        setResult({ key: requestKey, data: res.data, notFound: false });
      })
      .catch(() => {
        if (requestKeyRef.current !== requestKey) return;
        setResult({ key: requestKey, data: null, notFound: true });
      });
  }, [isPreview, requestKey, slug]);
  // Query-param overrides (order/theme) are applied client-side without refetching.
  const data = useMemo<PortfolioPageData | null>(() => {
    if (!rawData || !orderParam) return rawData;
    try {
      return { ...rawData, portfolio: { ...rawData.portfolio, sections_order: JSON.parse(orderParam) } };
    } catch {
      return rawData;
    }
  }, [rawData, orderParam]);
  const theme = useMemo(
    () => (rawData ? getThemeById(themeParam || rawData.portfolio?.theme) : themes[0]),
    [rawData, themeParam],
  );
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper font-sans" aria-busy="true">
        <p className="text-sm text-ink-soft">Loading portfolio…</p>
      </div>
    );
  if (notFound || !data)
    return (
      <main className="flex min-h-screen items-center bg-paper px-5 font-sans text-ink sm:px-10">
        <div className="mx-auto w-full max-w-xl">
          <p className="font-mono text-sm text-ink-soft">/portfolio/{slug}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">This portfolio doesn&apos;t exist yet.</h1>
          <p className="mt-3 text-ink-soft">The address might be wrong, or the owner hasn&apos;t published this page yet.</p>
          <Link href="/" className="mt-8 inline-block rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-black">
            Go to the PortfolioKit home page
          </Link>
        </div>
      </main>
    );
  const urlTemplate =
    typeof window !== "undefined"
      ? searchParams.get("template")
      : null;
  const templateName = urlTemplate || data.portfolio?.template || "modern";
  const accentColor = theme.accent;
  const widget = isPreview ? (
    <AdvisorFloating accentColor={accentColor} />
  ) : (
    <>
      <PortfolioShare title={data.about?.name || data.portfolio.title || data.portfolio.slug} accentColor={accentColor} />
      <ChatWidget slug={data.portfolio.slug} accentColor={accentColor} ownerName={data.about?.name} />
    </>
  );

  if (templateName === "modern") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <ModernTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "creative") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <CreativeTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "minimal") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <MinimalTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "bold") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <BoldTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "classic") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <ClassicTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "neon") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <NeonTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "glass") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <GlassTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "nature") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <NatureTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "vibrant") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <VibrantTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "retro") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <RetroTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "immersive") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <ImmersiveTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "playful") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <PlayfulTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "developer") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <DeveloperTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "swiss") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <SwissTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "white") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <WhiteTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "agency") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <AgencyTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  if (templateName === "boldpersona") return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <BoldPersonaTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
  return (
    <OrderSections sections_order={data?.portfolio?.sections_order}>
      <ModernTemplate data={data} theme={theme} isPreview={isPreview} />
      {widget}
    </OrderSections>
  );
}
