"use client";

import Link from "next/link";
import { Presentation, ArrowLeft, Lock } from "lucide-react";

const freeTemplates = [
  { id: "1", name: "Minimal", desc: "Clean and simple", bg: "#FFFFFF", accent: "#C4653A" },
  { id: "2", name: "Dark Mode", desc: "Sleek dark theme", bg: "#1C1917", accent: "#C4653A" },
  { id: "3", name: "Warm Neutral", desc: "Soft, earthy tones", bg: "#FAF8F5", accent: "#A84F2B" },
  { id: "4", name: "Bold Header", desc: "Big title, strong impact", bg: "#FFFFFF", accent: "#1C1917" },
  { id: "5", name: "Nature", desc: "Fresh green accents", bg: "#F0F7F0", accent: "#2D6A4F" },
  { id: "6", name: "Academic", desc: "Classic, scholarly look", bg: "#FFF8F0", accent: "#7C2D12" },
];

const proTemplates = [
  { id: "7", name: "Glassmorphism", desc: "Modern glass effect", bg: "#E8F0FE", accent: "#1A73E8" },
  { id: "8", name: "Gradient Flow", desc: "Smooth gradients", bg: "#FEF3E8", accent: "#E85D04" },
  { id: "9", name: "Neon Edge", desc: "Vibrant borders", bg: "#0F0F0F", accent: "#00F5D4" },
  { id: "10", name: "Paper Texture", desc: "Hand-drawn feel", bg: "#FFFDF7", accent: "#3D3229" },
  { id: "11", name: "Corporate", desc: "Professional blue", bg: "#F8FAFC", accent: "#1E40AF" },
  { id: "12", name: "Creative", desc: "Artistic, colorful", bg: "#FFF5F5", accent: "#E11D48" },
];

export default function TemplatesPage() {
  return (
    <div className="max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="p-2 text-charcoal/40 hover:text-charcoal/60 hover:bg-charcoal/5 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">
            Templates
          </h1>
          <p className="text-sm text-charcoal/45">
            Start with a template and customize it your way.
          </p>
        </div>
      </div>

      {/* Free Templates */}
      <div className="mb-12">
        <h2 className="font-heading text-xl text-charcoal mb-5">
          Free Templates
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {freeTemplates.map((t) => (
            <button
              key={t.id}
              className="group bg-white border border-border rounded-xl overflow-hidden hover:border-charcoal/15 transition-all duration-300 text-left"
            >
              <div
                className="aspect-video flex items-center justify-center relative"
                style={{ background: t.bg }}
              >
                <div className="w-3/4">
                  <div
                    className="h-4 w-1/2 rounded mb-2"
                    style={{ background: t.accent }}
                  />
                  <div className="h-2 w-3/4 rounded bg-charcoal/10 mb-1" />
                  <div className="h-2 w-1/2 rounded bg-charcoal/10" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-charcoal group-hover:text-sienna transition-colors">
                  {t.name}
                </h3>
                <p className="text-xs text-charcoal/40">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pro Templates */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="font-heading text-xl text-charcoal">
            Pro Templates
          </h2>
          <span className="text-[11px] font-medium text-sienna bg-sienna/10 px-2.5 py-0.5 rounded-full">
            Pro
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {proTemplates.map((t) => (
            <button
              key={t.id}
              className="group bg-white border border-border rounded-xl overflow-hidden hover:border-charcoal/15 transition-all duration-300 text-left relative"
            >
              <div className="absolute top-3 right-3 z-10">
                <Lock className="w-3.5 h-3.5 text-charcoal/30" />
              </div>
              <div
                className="aspect-video flex items-center justify-center relative"
                style={{ background: t.bg }}
              >
                <div className="w-3/4">
                  <div
                    className="h-4 w-1/2 rounded mb-2"
                    style={{ background: t.accent }}
                  />
                  <div className="h-2 w-3/4 rounded bg-charcoal/10 mb-1" />
                  <div className="h-2 w-1/2 rounded bg-charcoal/10" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-charcoal group-hover:text-sienna transition-colors">
                  {t.name}
                </h3>
                <p className="text-xs text-charcoal/40">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/#pricing"
            className="text-sm text-sienna font-medium hover:text-sienna-dark transition-colors"
          >
            Upgrade to Pro to unlock all templates &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
