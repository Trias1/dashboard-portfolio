'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
      <div className="text-center max-w-md px-4">
        <motion.div
          className="text-7xl mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          404
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-3">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-400 mb-8">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full font-medium text-white transition hover:opacity-90"
          style={{ backgroundColor: '#a855f7' }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

