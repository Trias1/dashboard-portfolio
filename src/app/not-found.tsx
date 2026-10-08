import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center bg-paper px-5 font-sans text-ink sm:px-10">
      <div className="mx-auto w-full max-w-xl">
        <p className="font-mono text-sm text-ink-soft">404</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">This page doesn&apos;t exist.</h1>
        <p className="mt-3 text-ink-soft">The link might have a typo, or the page has moved.</p>
        <Link href="/" className="mt-8 inline-block rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-black">
          Back to home
        </Link>
      </div>
    </main>
  );
}
