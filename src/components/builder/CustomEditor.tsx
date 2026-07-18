'use client';
import React, { useState } from 'react';

interface Props {
  editForm: any;
  setEditForm: (form: any) => void;
}

export default function CustomEditor({ editForm, setEditForm }: Props) {
  const inputClass = "w-full bg-[#1a1a3a] border border-purple-900/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";

  const type = editForm.type || 'text';

  const renderFields = () => {
    switch (type) {
      case 'text':
        return (
          <div><label className={labelClass}>Content</label>
            <textarea value={editForm.content?.body || ''} onChange={e => setEditForm({...editForm, content: {...editForm.content, body: e.target.value}})}
              className={inputClass + ' h-40 resize-none'} placeholder="Write anything here..." /></div>
        );
      case 'list':
        return (
          <div>
            <label className={labelClass}>Items (one per line)</label>
            <textarea value={(editForm.content?.items || []).join('\n')} 
              onChange={e => setEditForm({...editForm, content: {...editForm.content, items: e.target.value.split('\n')}})}
              className={inputClass + ' h-40 resize-none'} placeholder="Item 1&#10;Item 2&#10;Item 3" />
          </div>
        );
      case 'cards':
        return (
          <div className="space-y-3">
            <label className={labelClass}>Cards</label>
            {(editForm.content?.cards || []).map((card: any, i: number) => (
              <div key={i} className="bg-[#1a1a3a] rounded-lg p-3 space-y-2 border border-purple-900/20">
                <input value={card.title || ''} onChange={e => {
                  const cards = [...(editForm.content?.cards || [])];
                  cards[i] = {...cards[i], title: e.target.value};
                  setEditForm({...editForm, content: {...editForm.content, cards}});
                }} className={inputClass} placeholder="Card title" />
                <input value={card.desc || ''} onChange={e => {
                  const cards = [...(editForm.content?.cards || [])];
                  cards[i] = {...cards[i], desc: e.target.value};
                  setEditForm({...editForm, content: {...editForm.content, cards}});
                }} className={inputClass} placeholder="Description" />
                <div className="flex gap-2">
                  <input value={card.icon || ''} onChange={e => {
                    const cards = [...(editForm.content?.cards || [])];
                    cards[i] = {...cards[i], icon: e.target.value};
                    setEditForm({...editForm, content: {...editForm.content, cards}});
                  }} className={inputClass} placeholder=" Icon" />
                  <button onClick={() => {
                    const cards = (editForm.content?.cards || []).filter((_: any, idx: number) => idx !== i);
                    setEditForm({...editForm, content: {...editForm.content, cards}});
                  }} className="text-red-400 hover:text-red-300 px-3"></button>
                </div>
              </div>
            ))}
            <button onClick={() => {
              const cards = [...(editForm.content?.cards || []), {title: '', desc: '', icon: ''}];
              setEditForm({...editForm, content: {...editForm.content, cards}});
            }} className="w-full border border-purple-900/30 text-purple-400 hover:text-white py-2 rounded-lg transition text-sm">
              + Add Card
            </button>
          </div>
        );
      case 'links':
        return (
          <div className="space-y-3">
            <label className={labelClass}>Links</label>
            {(editForm.content?.links || []).map((link: any, i: number) => (
              <div key={i} className="flex gap-2">
                <input value={link.label || ''} onChange={e => {
                  const links = [...(editForm.content?.links || [])];
                  links[i] = {...links[i], label: e.target.value};
                  setEditForm({...editForm, content: {...editForm.content, links}});
                }} className={inputClass} placeholder="Label" />
                <input value={link.url || ''} onChange={e => {
                  const links = [...(editForm.content?.links || [])];
                  links[i] = {...links[i], url: e.target.value};
                  setEditForm({...editForm, content: {...editForm.content, links}});
                }} className={inputClass} placeholder="https://..." />
                <button onClick={() => {
                  const links = (editForm.content?.links || []).filter((_: any, idx: number) => idx !== i);
                  setEditForm({...editForm, content: {...editForm.content, links}});
                }} className="text-red-400 hover:text-red-300 px-3"></button>
              </div>
            ))}
            <button onClick={() => {
              const links = [...(editForm.content?.links || []), {label: '', url: ''}];
              setEditForm({...editForm, content: {...editForm.content, links}});
            }} className="w-full border border-purple-900/30 text-purple-400 hover:text-white py-2 rounded-lg transition text-sm">
              + Add Link
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Section Title</label>
        <input value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})}
          className={inputClass} placeholder="My Custom Section" />
      </div>
      <div>
        <label className={labelClass}>Content Type</label>
        <select value={type} onChange={e => setEditForm({...editForm, type: e.target.value, content: {}})}
          className={inputClass}>
          <option value="text"> Text  -  Free text content</option>
          <option value="list"> List  -  Bullet points</option>
          <option value="cards"> Cards  -  Icon + title + description</option>
          <option value="links"> Links  -  Label + URL</option>
        </select>
      </div>
      {renderFields()}
    </div>
  );
}
