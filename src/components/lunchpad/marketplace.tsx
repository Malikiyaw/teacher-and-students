'use client';

import { useState } from 'react';
import { WORKFLOWS, type Workflow } from '@/lib/data';
import { Spotlight } from '@/components/ui/spotlight-aceternity';

const CATEGORIES = ['all', 'coding', 'design', 'business', 'content'];

export function Marketplace() {
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = WORKFLOWS.filter((w) => filter === 'all' || w.category === filter);

  return (
    <section id="marketplace" className="py-24 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-16">
          <div>
            <p className="text-xs font-medium text-accent tracking-widest uppercase mb-3">01</p>
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-4xl lg:text-5xl text-ink tracking-tight">AI Workflows</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filter === c
                    ? 'bg-ink text-surface'
                    : 'text-ink/40 hover:text-ink'
                }`}
              >
                {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="marketplace-grid">
          {filtered.map((w, i) => (
            <MarketplaceCard
              key={w.id}
              workflow={w}
              isFirst={i === 0}
              isExpanded={expandedId === w.id}
              onToggle={() => setExpandedId(expandedId === w.id ? null : w.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketplaceCard({ workflow: w, isFirst, isExpanded, onToggle }: { workflow: Workflow; isFirst: boolean; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div
      className={`card group relative cursor-pointer ${isFirst ? 'card-first' : ''} ${isExpanded ? 'ring-1 ring-accent' : ''}`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
    >
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" fill="#D4583A" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <span className={`tag tag-${w.category}`}>{w.category}</span>
          {w.featured && <span className="tag" style={{ background: '#D4583A', color: '#FAFAF8' }}>Featured</span>}
        </div>
        <h3 className="font-[family-name:var(--font-serif)] font-bold text-xl text-ink mb-3 leading-snug">{w.title}</h3>
        <p className="text-sm text-ink/45 mb-6 leading-relaxed">{w.description}</p>
        {isExpanded && (
          <div className="mb-6 pt-4 border-t border-ink/5">
            <p className="text-xs font-medium text-ink/30 uppercase tracking-wider mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {w.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-md bg-ink/5 text-ink/40">{tag}</span>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-ink/30">{w.model}</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-ink/40">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              {w.rating} <span className="text-ink/25">({w.reviews})</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-accent">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {w.timeSaved}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
