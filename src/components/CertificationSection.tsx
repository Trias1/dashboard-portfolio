'use client';
import { useState } from 'react';

type DatePart = string | number;

export interface CertificationItem {
  name?: string;
  title?: string;
  issuer?: string;
  description?: string;
  imageUrl?: string;
  credentialUrl?: string;
  credential_url?: string;
  skills?: string[] | string;
  issueMonth?: DatePart;
  issueYear?: DatePart;
  expiryMonth?: DatePart;
  expiryYear?: DatePart;
  noExpiration?: boolean;
  noExpiry?: boolean;
}

function toCertification(value: unknown): CertificationItem {
  return typeof value === 'object' && value !== null ? (value as CertificationItem) : {};
}

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatCertificationDate(cert: CertificationItem): string {
  if (cert.issueYear || cert.issueMonth) {
    if (cert.issueMonth && cert.issueYear) {
      const m = parseInt(String(cert.issueMonth));
      if (m >= 1 && m <= 12) return `${MONTHS_ID[m - 1]} ${cert.issueYear}`;
    }
    return cert.issueYear ? String(cert.issueYear) : '';
  }
  return '';
}

export function formatCertExpiry(cert: CertificationItem): string {
  if (cert.noExpiration || cert.noExpiry) return 'Tidak ada masa berlaku';
  if (cert.expiryYear || cert.expiryMonth) {
    if (cert.expiryMonth && cert.expiryYear) {
      const m = parseInt(String(cert.expiryMonth));
      if (m >= 1 && m <= 12) return `${MONTHS_ID[m - 1]} ${cert.expiryYear}`;
    }
    return cert.expiryYear ? String(cert.expiryYear) : '';
  }
  return '';
}

export default function CertificationSection({
  items, textColor, subTextColor, accentColor, cardBg, initialCount = 3
}: {
  items?: readonly unknown[];
  textColor: string;
  subTextColor: string;
  accentColor: string;
  cardBg: string;
  initialCount?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  if (!items?.length) return null;
  const visible = showAll ? items : items.slice(0, initialCount);
  return (
    <div>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {visible.map((rawCert, i: number) => {
        const cert = toCertification(rawCert);
        const issueDate = formatCertificationDate(cert);
        const expiryDate = formatCertExpiry(cert);
        const skills: string[] = Array.isArray(cert.skills) ? cert.skills : [];
        const certImage = cert.imageUrl || '';
        const credential = cert.credentialUrl || cert.credential_url;

        return (
          <li key={i} className={`flex flex-col rounded-md border p-4 ${cardBg}`}>
            {certImage && (
              <div className="mb-3 h-36 w-full overflow-hidden rounded-sm">
                <img src={certImage} alt={cert.name || cert.title || 'Certificate'}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }} />
              </div>
            )}
            <h3 className={`text-base font-semibold leading-snug ${textColor}`}>{cert.name || cert.title}</h3>
            {cert.issuer && (
              <p className="mt-0.5 text-sm" style={{ color: accentColor }}>{cert.issuer}</p>
            )}
            {(issueDate || expiryDate) && (
              <p className={`mt-1 font-mono text-xs ${subTextColor}`}>
                {issueDate}
                {issueDate && expiryDate && ' · '}
                {expiryDate && (cert.noExpiration || cert.noExpiry ? expiryDate : `berlaku s.d. ${expiryDate}`)}
              </p>
            )}
            {cert.description && (
              <p className={`mt-2 flex-1 text-sm leading-relaxed ${subTextColor}`}>{cert.description}</p>
            )}
            {skills.length > 0 && (
              <p className={`mt-3 text-xs ${subTextColor}`}>{skills.join(' · ')}</p>
            )}
            {credential && (
              <a href={credential} target="_blank" rel="noopener noreferrer"
                className="mt-3 self-start text-sm font-medium underline underline-offset-4 hover:no-underline"
                style={{ color: accentColor }}>
                Lihat kredensial ↗
              </a>
            )}
          </li>
        );
      })}
      </ul>
    {items.length > initialCount && (
      <div className="mt-6">
        <button type="button" onClick={() => setShowAll(!showAll)}
          className="text-sm font-medium underline underline-offset-4 hover:no-underline"
          style={{ color: accentColor }}>
          {showAll ? 'Tampilkan lebih sedikit' : `Lihat ${items.length - initialCount} lainnya`}
        </button>
      </div>
    )}
    </div>
  );
}
