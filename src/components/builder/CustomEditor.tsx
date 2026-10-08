'use client';
import React from 'react';
import type { CustomCard, CustomLink, EditFormData } from '@/types';

interface Props {
  editForm: EditFormData;
  setEditForm: (form: EditFormData) => void;
}

const inputClass = "w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink placeholder:text-[#9a9aa0] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const hintClass = "mt-1.5 text-xs text-ink-soft";
const removeClass = "shrink-0 px-1 text-xs text-red-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline";
const addClass = "rounded-md border border-dashed border-rule bg-white px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-soft";

export default function CustomEditor({ editForm, setEditForm }: Props) {
  const type = editForm.type || 'text';

  const renderFields = () => {
    switch (type) {
      case 'text':
        return (
          <div>
            <label htmlFor="ce-body" className={labelClass}>Content</label>
            <textarea id="ce-body" value={editForm.content?.body || ''} onChange={e => setEditForm({...editForm, content: {...editForm.content, body: e.target.value}})}
              className={inputClass + ' h-40 resize-y'} placeholder="Write anything here..." />
          </div>
        );
      case 'list':
        return (
          <div>
            <label htmlFor="ce-items" className={labelClass}>Items</label>
            <textarea id="ce-items" value={(editForm.content?.items || []).join('\n')}
              onChange={e => setEditForm({...editForm, content: {...editForm.content, items: e.target.value.split('\n')}})}
              className={inputClass + ' h-40 resize-y'} placeholder="Item 1&#10;Item 2&#10;Item 3" />
            <p className={hintClass}>One item per line.</p>
          </div>
        );
      case 'cards': {
        const cards = editForm.content?.cards || [];
        return (
          <div>
            <p className={labelClass}>Cards</p>
            {cards.length === 0 && <p className="mb-3 text-sm text-ink-soft">No cards yet.</p>}
            {cards.length > 0 && (
              <ul className="mb-3 divide-y divide-rule border-y border-rule">
                {cards.map((card: CustomCard, i: number) => (
                  <li key={i} className="space-y-2 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-ink-soft">Card {i + 1}</span>
                      <button type="button" onClick={() => {
                        const cards = (editForm.content?.cards || []).filter((_: CustomCard, idx: number) => idx !== i);
                        setEditForm({...editForm, content: {...editForm.content, cards}});
                      }} className={removeClass}>Remove</button>
                    </div>
                    <label htmlFor={`ce-card-title-${i}`} className="sr-only">Card {i + 1} title</label>
                    <input id={`ce-card-title-${i}`} value={card.title || ''} onChange={e => {
                      const cards = [...(editForm.content?.cards || [])];
                      cards[i] = {...cards[i], title: e.target.value};
                      setEditForm({...editForm, content: {...editForm.content, cards}});
                    }} className={inputClass} placeholder="Card title" />
                    <label htmlFor={`ce-card-desc-${i}`} className="sr-only">Card {i + 1} description</label>
                    <input id={`ce-card-desc-${i}`} value={card.desc || ''} onChange={e => {
                      const cards = [...(editForm.content?.cards || [])];
                      cards[i] = {...cards[i], desc: e.target.value};
                      setEditForm({...editForm, content: {...editForm.content, cards}});
                    }} className={inputClass} placeholder="Description" />
                    <label htmlFor={`ce-card-icon-${i}`} className="sr-only">Card {i + 1} icon</label>
                    <input id={`ce-card-icon-${i}`} value={card.icon || ''} onChange={e => {
                      const cards = [...(editForm.content?.cards || [])];
                      cards[i] = {...cards[i], icon: e.target.value};
                      setEditForm({...editForm, content: {...editForm.content, cards}});
                    }} className={inputClass + ' max-w-[8rem]'} placeholder="Icon" />
                  </li>
                ))}
              </ul>
            )}
            <button type="button" onClick={() => {
              const cards = [...(editForm.content?.cards || []), {title: '', desc: '', icon: '✦'}];
              setEditForm({...editForm, content: {...editForm.content, cards}});
            }} className={addClass}>
              Add card
            </button>
          </div>
        );
      }
      case 'links': {
        const links = editForm.content?.links || [];
        return (
          <div>
            <p className={labelClass}>Links</p>
            {links.length === 0 && <p className="mb-3 text-sm text-ink-soft">No links yet.</p>}
            {links.length > 0 && (
              <ul className="mb-3 divide-y divide-rule border-y border-rule">
                {links.map((link: CustomLink, i: number) => (
                  <li key={i} className="flex items-center gap-2 py-2.5">
                    <label htmlFor={`ce-link-label-${i}`} className="sr-only">Link {i + 1} label</label>
                    <input id={`ce-link-label-${i}`} value={link.label || ''} onChange={e => {
                      const links = [...(editForm.content?.links || [])];
                      links[i] = {...links[i], label: e.target.value};
                      setEditForm({...editForm, content: {...editForm.content, links}});
                    }} className={inputClass} placeholder="Label" />
                    <label htmlFor={`ce-link-url-${i}`} className="sr-only">Link {i + 1} URL</label>
                    <input id={`ce-link-url-${i}`} value={link.url || ''} onChange={e => {
                      const links = [...(editForm.content?.links || [])];
                      links[i] = {...links[i], url: e.target.value};
                      setEditForm({...editForm, content: {...editForm.content, links}});
                    }} className={inputClass + ' font-mono'} placeholder="https://..." />
                    <button type="button" onClick={() => {
                      const links = (editForm.content?.links || []).filter((_: CustomLink, idx: number) => idx !== i);
                      setEditForm({...editForm, content: {...editForm.content, links}});
                    }} className={removeClass}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" onClick={() => {
              const links = [...(editForm.content?.links || []), {label: '', url: ''}];
              setEditForm({...editForm, content: {...editForm.content, links}});
            }} className={addClass}>
              Add link
            </button>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5 text-ink">
      <div>
        <label htmlFor="ce-title" className={labelClass}>Section title</label>
        <input id="ce-title" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})}
          className={inputClass} placeholder="My Custom Section" />
      </div>
      <div>
        <label htmlFor="ce-type" className={labelClass}>Content type</label>
        <select id="ce-type" value={type} onChange={e => setEditForm({...editForm, type: e.target.value, content: {}})}
          className={inputClass}>
          <option value="text">Text: free text content</option>
          <option value="list">List: bullet points</option>
          <option value="cards">Cards: icon, title and description</option>
          <option value="links">Links: label and URL</option>
        </select>
        <p className={hintClass}>Changing the type clears the content below.</p>
      </div>
      {renderFields()}
    </div>
  );
}
