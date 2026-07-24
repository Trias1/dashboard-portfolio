'use client';

import { useState } from 'react';

export default function PortfolioShare({ title, accentColor }: { title: string; accentColor: string }) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href.split('?')[0];
    if (navigator.share) return navigator.share({ title, url });
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const url = typeof window === 'undefined' ? '' : window.location.href.split('?')[0];

  return (
    <div className="fixed bottom-5 left-5 z-[90] flex items-end gap-2">
      {showQr ? (
        <div className="rounded-2xl bg-white p-3 shadow-2xl">
          {/* ponytail: public QR endpoint; generate locally if offline support becomes necessary. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`} alt={`QR code for ${title}`} width="160" height="160" />
        </div>
      ) : null}
      <button type="button" onClick={() => void share()} className="rounded-full px-4 py-3 font-medium text-white shadow-xl" style={{ backgroundColor: accentColor }} aria-label="Share portfolio">
        {copied ? 'Copied' : 'Share'}
      </button>
      <button type="button" onClick={() => setShowQr((visible) => !visible)} className="rounded-full bg-white px-4 py-3 font-medium text-gray-900 shadow-xl" aria-expanded={showQr} aria-label="Show portfolio QR code">
        QR
      </button>
    </div>
  );
}
