"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { themes, getThemeById } from "@/lib/sections";
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
  portfolio: { template?: string; theme?: string; sections_order: unknown[]; title?: string; slug: string };
  about?: { name?: string; bio?: string; photo_url?: string };
  hero?: { subheadline?: string };
  [key: string]: unknown;
};

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const [data, setData] = useState<PortfolioPageData | null>(null);
  const [theme, setTheme] = useState(themes[0]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const isPreview = searchParams.get("preview") === "true";
  useEffect(() => {
    const preview = isPreview;
    api
      .get(`/api/public/${slug}${preview ? "?preview=true" : ""}`)
      .then((res) => {
        const order = preview ? searchParams.get("order") : null;
        if (order) {
          try {
            res.data.portfolio.sections_order = JSON.parse(order);
          } catch {}
        }
        setData(res.data);
        const urlTheme =
          typeof window !== "undefined"
            ? searchParams.get("theme")
            : null;
        setTheme(getThemeById(urlTheme || res.data.portfolio?.theme));
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [isPreview, searchParams, slug]);
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-t-transparent rounded-full border-purple-500 mx-auto"
          />
          <motion.p
            className="text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Loading portfolio...
          </motion.p>
        </div>
      </div>
    );
  if (notFound || !data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="text-center max-w-md px-4">
          <motion.div
            className="text-7xl mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            *
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Portfolio Not Found
          </h1>
          <p className="text-gray-400 mb-8">
            The portfolio &quot;{slug}&quot; does not exist or is not published yet.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-full font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: "#a855f7" }}
          >
            {" "}
            Back to Home
          </Link>
        </div>
      </div>
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
