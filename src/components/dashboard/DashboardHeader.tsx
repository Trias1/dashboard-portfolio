"use client";

export default function DashboardHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <header className="flex min-h-14 shrink-0 items-center justify-between border-b border-rule bg-paper px-4 md:px-5">
      {children}
    </header>
  );
}
