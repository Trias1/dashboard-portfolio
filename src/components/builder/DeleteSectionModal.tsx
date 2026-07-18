'use client';
import type { Section } from '@/lib/sections';

interface Props {
  isOpen: boolean;
  section: Section | null;
  onClose: () => void;
  onHide: (id: string) => void;
  onDelete: (section: Section) => void;
}

export default function DeleteSectionModal({ isOpen, section, onClose, onHide, onDelete }: Props) {
  if (!isOpen || !section) return null;

  const isFixed = ['hero', 'about'].includes(section.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-[#1a1a3e] border border-purple-800/40 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{section.icon}</span>
          <h3 className="text-lg font-semibold text-white">
            {isFixed ? `Kosongkan data "${section.label}"?` : `Hapus "${section.label}"?`}
          </h3>
        </div>

        {isFixed ? (
          <p className="text-sm text-gray-400 mb-6">
            Section <span className="text-white font-medium">{section.label}</span> tidak bisa dihapus.
            Data di dalamnya akan dikosongkan tapi section tetap tampil.
          </p>
        ) : (
          <p className="text-sm text-gray-400 mb-6">
            Pilih tindakan untuk section <span className="text-white font-medium">{section.label}</span>:
          </p>
        )}

        <div className="flex flex-col gap-3">
          {!isFixed && (
            <button onClick={() => { onHide(section.id); onClose(); }}
              className="w-full px-4 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700/50 text-sm font-medium transition-colors text-left">
              <span className="block font-medium text-gray-200"> Sembunyikan section</span>
              <span className="block text-xs text-gray-500 mt-0.5">Data tetap tersimpan. Section bisa ditampilkan kembali kapan saja.</span>
            </button>
          )}

          <button onClick={() => { onDelete(section); onClose(); }}
            className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
              isFixed
                ? 'border border-yellow-600/50 text-yellow-400 hover:bg-yellow-900/20'
                : 'border border-red-600/50 text-red-400 hover:bg-red-900/20'
            }`}>
            {isFixed ? (
              <>
                <span className="block font-medium text-yellow-400"> Kosongkan semua data</span>
                <span className="block text-xs text-yellow-600/80 mt-0.5">Data di section ini akan dihapus permanen. Section tetap tampil.</span>
              </>
            ) : (
              <>
                <span className="block font-medium text-red-400"> Hapus section + semua data</span>
                <span className="block text-xs text-red-500/80 mt-0.5">Section dan seluruh data di dalamnya akan dihapus permanen.</span>
              </>
            )}
          </button>

          <button onClick={onClose}
            className="w-full px-4 py-3 rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 text-sm font-medium transition-colors">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
