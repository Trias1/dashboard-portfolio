'use client';
import type { Section } from '@/lib/sections';
import { SectionIcon } from '@/components/builder/SortableSection';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4"
      onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="delete-section-title"
        className="w-full max-w-md rounded-lg border border-rule bg-white p-5 text-ink shadow-[0_12px_32px_rgba(20,20,20,0.12)]"
        onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-start gap-3">
          <span className="mt-1 text-ink-soft"><SectionIcon type={section.type} label={section.label} /></span>
          <h3 id="delete-section-title" className="font-display text-lg font-semibold leading-snug tracking-tight">
            {isFixed ? `Clear "${section.label}"?` : `Delete "${section.label}"?`}
          </h3>
        </div>

        {isFixed ? (
          <p className="mb-5 text-sm leading-relaxed text-ink-soft">
            The <span className="font-medium text-ink">{section.label}</span> section can&rsquo;t be deleted.
            Its content will be cleared, but the section stays on the page.
          </p>
        ) : (
          <p className="mb-5 text-sm leading-relaxed text-ink-soft">
            What do you want to do with the <span className="font-medium text-ink">{section.label}</span> section?
          </p>
        )}

        <div className="flex flex-col gap-2">
          {!isFixed && (
            <button type="button" onClick={() => { onHide(section.id); onClose(); }}
              className="w-full rounded-md border border-rule bg-white px-3.5 py-2.5 text-left transition-colors hover:border-ink-soft">
              <span className="block text-sm font-medium text-ink">Just hide it</span>
              <span className="mt-0.5 block text-xs text-ink-soft">The data is kept. You can show it again any time.</span>
            </button>
          )}

          <button type="button" onClick={() => { onDelete(section); onClose(); }}
            className="w-full rounded-md border border-red-200 bg-white px-3.5 py-2.5 text-left transition-colors hover:bg-red-50">
            {isFixed ? (
              <>
                <span className="block text-sm font-medium text-red-700">Clear all data</span>
                <span className="mt-0.5 block text-xs text-red-700/80">The data in this section is deleted for good. The section stays on the page.</span>
              </>
            ) : (
              <>
                <span className="block text-sm font-medium text-red-700">Delete the section and its data</span>
                <span className="mt-0.5 block text-xs text-red-700/80">This section and everything in it is deleted for good.</span>
              </>
            )}
          </button>

          <div className="mt-2 flex justify-end">
            <button type="button" onClick={onClose}
              className="rounded-md px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-paper hover:text-ink">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
