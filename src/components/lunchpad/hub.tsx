'use client';

import { useState } from 'react';
import { HUB_POSTS, type HubPost } from '@/lib/data';

export function Hub() {
  const [posts, setPosts] = useState(HUB_POSTS);

  const likePost = (id: number) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  };

  return (
    <section id="hub" className="py-24 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-16">
          <div>
            <p className="text-xs font-medium text-accent tracking-widest uppercase mb-3">04</p>
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-4xl lg:text-5xl text-ink tracking-tight">VibeCoder Hub</h2>
          </div>
          <button className="bg-ink hover:bg-accent text-surface font-medium px-6 py-2.5 rounded-lg transition-all duration-300 text-sm">Share Post</button>
        </div>
        <div className="hub-grid">
          {posts.map((p, i) => (
            <HubCard key={p.id} post={p} isFirst={i === 0} onLike={likePost} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HubCard({ post: p, isFirst, onLike }: { post: HubPost; isFirst: boolean; onLike: (id: number) => void }) {
  return (
    <div className={`card ${isFirst ? 'card-featured' : ''}`}>
      {isFirst && (
        <div className="mb-6">
          <div className="tag tag-coding mb-3">Featured</div>
          <div className="h-px bg-ink/5" />
        </div>
      )}
      <div className="flex items-center gap-2 mb-4">
        <span className="tag tag-coding">{p.type}</span>
        <span className="text-xs text-ink/25">{p.date}</span>
      </div>
      <h3 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink mb-3 leading-snug">{p.title}</h3>
      <p className="text-sm text-ink/40 mb-6 leading-relaxed">{p.content}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-ink/30">@{p.author}</span>
        <button onClick={() => onLike(p.id)} className="upvote-btn flex items-center gap-1.5 text-xs text-ink/35">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          {p.likes}
        </button>
      </div>
    </div>
  );
}
