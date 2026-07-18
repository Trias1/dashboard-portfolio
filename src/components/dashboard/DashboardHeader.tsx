"use client";

export default function DashboardHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <header className="min-h-16 shrink-0 bg-slate-950/75 border-b border-white/10 px-4 md:px-6 flex items-center justify-between backdrop-blur-xl">
      {children}
    </header>
  );
}
