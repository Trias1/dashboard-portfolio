'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatCertificationDate(cert: any): string {
  if (cert.issueYear || cert.issueMonth) {
    if (cert.issueMonth && cert.issueYear) {
      const m = parseInt(cert.issueMonth);
      if (m >= 1 && m <= 12) return `${MONTHS_ID[m - 1]} ${cert.issueYear}`;
    }
    return cert.issueYear || '';
  }
  return '';
}

export function formatCertExpiry(cert: any): string {
  if (cert.noExpiration || cert.noExpiry) return 'Tidak ada masa berlaku';
  if (cert.expiryYear || cert.expiryMonth) {
    if (cert.expiryMonth && cert.expiryYear) {
      const m = parseInt(cert.expiryMonth);
      if (m >= 1 && m <= 12) return `${MONTHS_ID[m - 1]} ${cert.expiryYear}`;
    }
    return cert.expiryYear || '';
  }
  return '';
}

export default function CertificationSection({
  items, textColor, subTextColor, accentColor, cardBg, initialCount = 3
}: {
  items: any[];
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {visible.map((cert: any, i: number) => {
        const issueDate = formatCertificationDate(cert);
        const expiryDate = formatCertExpiry(cert);
        const skills = Array.isArray(cert.skills) ? cert.skills : [];
        const certImage = cert.imageUrl || '';

        return (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -6 }}
            className={`p-5 rounded-2xl border flex flex-col ${cardBg}`}
          >
            {certImage && (
              <div className="w-full h-36 rounded-lg mb-3 overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: `url(${certImage})` }}>
                <img src={certImage} alt={cert.name || cert.title}
                  className="w-full h-full object-cover"
                  onError={(e: any) => { e.target.style.display = 'none' }} />
              </div>
            )}
            <h3 className={`text-base font-bold mb-1 ${textColor}`}>{cert.name || cert.title}</h3>
            {cert.issuer && (
              <p className="text-sm" style={{ color: accentColor }}>{cert.issuer}</p>
            )}
            {issueDate && (
              <p className={`text-xs mt-1 ${subTextColor}`}>
                Diterbitkan: {issueDate}
              </p>
            )}
            {expiryDate && (
              <p className={`text-xs ${subTextColor}`}>
                {cert.noExpiration || cert.noExpiry ? expiryDate : `Berlaku hingga: ${expiryDate}`}
              </p>
            )}
            {cert.description && (
              <p className={`text-sm mt-2 flex-1 text-justify ${subTextColor}`}>{cert.description}</p>
            )}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {skills.map((skill: string) => (
                  <span key={skill}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: accentColor + '20', color: accentColor }}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
            {(cert.credentialUrl || cert.credential_url) && (
              <motion.a href={cert.credentialUrl || cert.credential_url} target="_blank"
                whileHover={{ scale: 1.05 }}
                className="mt-3 text-center text-xs px-3 py-1.5 rounded-full font-medium text-white"
                style={{ backgroundColor: accentColor }}>
                Lihat Kredensial
              </motion.a>
            )}
          </motion.div>
        );
      })}
    </div>
    {items.length > initialCount && (
      <div className="text-center mt-8">
        <button onClick={() => setShowAll(!showAll)}
          className="px-6 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 text-white"
          style={{ backgroundColor: accentColor }}>
          {showAll ? 'Tampilkan Lebih Sedikit' : `Lihat Lainnya (${items.length - initialCount})`}
        </button>
      </div>
    )}
    </div>
  );
}
