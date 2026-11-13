import Link from 'next/link';

/** A missing slug, or a draft the visitor may not see: same page and a real 404 status either way. */
export default function PortfolioNotFound() {
  return (
    <main className="flex min-h-screen items-center bg-paper px-5 font-sans text-ink sm:px-10">
      <div className="mx-auto w-full max-w-xl">
        <p className="font-mono text-sm text-ink-soft">404</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">This portfolio doesn&apos;t exist yet.</h1>
        <p className="mt-3 text-ink-soft">The address might be wrong, or the owner hasn&apos;t published this page yet.</p>
        <Link href="/" className="mt-8 inline-block rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-black">
          Go to the PortfolioKit home page
        </Link>
      </div>
    </main>
  );
}
