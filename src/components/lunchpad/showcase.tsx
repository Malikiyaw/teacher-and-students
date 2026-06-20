'use client';

import { useState } from 'react';
import { SHOWCASES, type Showcase } from '@/lib/data';
import { Spotlight } from '@/components/ui/spotlight-aceternity';

const TOOLS = ['all', 'claude', 'cursor', 'chatgpt'];

export function Showcase() {
  const [filter, setFilter] = useState('all');

  const filtered = SHOWCASES.filter((s) => filter === 'all' || s.tool === filter);

  return (
    <section id="showcase" className="py-24 lg:py-36 bg-surface-alt">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-16">
          <div>
            <p className="text-xs font-medium text-accent tracking-widest uppercase mb-3">02</p>
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-4xl lg:text-5xl text-ink tracking-tight">Showcase</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {TOOLS.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filter === t ? 'bg-ink text-surface' : 'text-ink/40 hover:text-ink'
                }`}
              >
                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="showcase-grid">
          {filtered.map((s, i) => (
            <ShowcaseCard key={s.id} showcase={s} isFirst={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({ showcase: s, isFirst }: { showcase: Showcase; isFirst: boolean }) {
  return (
    <div className={`card group relative ${isFirst ? 'card-feature' : ''}`}>
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" fill="#D4583A" />
      <div className="relative z-10">
        {isFirst && (
          <div className="card-image mb-6">
            <svg className="w-12 h-12 text-ink/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <span className={`tag tag-${s.tool}`}>{s.tool}</span>
          <span className="text-xs text-ink/30">Built in {s.builtIn}</span>
        </div>
        <h3 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink mb-2">{s.title}</h3>
        <p className="text-sm text-ink/40 mb-4 leading-relaxed">{s.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className={`text-sm font-medium ${s.revenue !== 'Free' ? 'text-accent' : 'text-ink/30'}`}>{s.revenue}</span>
          <div className="flex items-center gap-1 text-xs text-ink/35">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {s.likes}
          </div>
        </div>
      </div>
    </div>
  );
}
