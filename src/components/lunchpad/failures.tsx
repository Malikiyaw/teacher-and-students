'use client';

import { useState } from 'react';
import { FAILURES, type Failure } from '@/lib/data';

const CATEGORIES = ['all', 'coding', 'design', 'hallucination'];

export function Failures() {
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState(FAILURES);

  const filtered = items.filter((f) => filter === 'all' || f.category === filter);

  const upvote = (id: number) => {
    setItems(items.map((f) => (f.id === id ? { ...f, upvotes: f.upvotes + 1 } : f)));
  };

  return (
    <section id="failures" className="py-24 lg:py-36 bg-surface-alt">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-16">
          <div>
            <p className="text-xs font-medium text-accent tracking-widest uppercase mb-3">05</p>
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-4xl lg:text-5xl text-ink tracking-tight">AI Failures DB</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filter === c ? 'bg-ink text-surface' : 'text-ink/40 hover:text-ink'
                }`}
              >
                {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="failures-grid">
          {filtered.map((f) => (
            <FailureEntry key={f.id} failure={f} onUpvote={upvote} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FailureEntry({ failure: f, onUpvote }: { failure: Failure; onUpvote: (id: number) => void }) {
  return (
    <div className="failure-entry py-8">
      <div className="flex items-center gap-3 mb-4">
        <span className={`tag tag-${f.category}`}>{f.category}</span>
        <span className="text-xs text-ink/25">{f.date}</span>
        <span className="text-xs text-ink/25">via {f.ai}</span>
      </div>
      <h3 className="font-[family-name:var(--font-serif)] font-bold text-2xl text-ink mb-3 leading-snug">{f.title}</h3>
      <p className="text-base text-ink/45 mb-6 leading-relaxed max-w-2xl">{f.description}</p>
      <button onClick={() => onUpvote(f.id)} className="upvote-btn flex items-center gap-1.5 text-sm text-ink/35">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.22 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
        </svg>
        {f.upvotes}
      </button>
    </div>
  );
}
