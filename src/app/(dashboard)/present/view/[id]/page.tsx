"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Presentation, Users, Timer, BarChart3, Check } from "lucide-react";

const slides = [
  {
    id: "1",
    background: "#FFFFFF",
    elements: [
      { type: "text" as const, content: "Photosynthesis", color: "#1C1917", fontSize: 42, y: "35%" },
      { type: "text" as const, content: "Chapter 4 — Biology 101", color: "#6B6560", fontSize: 18, y: "50%" },
    ],
  },
  {
    id: "2",
    background: "#FAF8F5",
    elements: [
      { type: "text" as const, content: "What is Photosynthesis?", color: "#1C1917", fontSize: 28, y: "15%" },
      { type: "text" as const, content: "The process by which plants convert light energy into chemical energy.", color: "#6B6560", fontSize: 18, y: "35%" },
    ],
  },
  {
    id: "3",
    background: "#1C1917",
    elements: [
      { type: "text" as const, content: "The Equation", color: "#FFFFFF", fontSize: 28, y: "15%" },
      { type: "text" as const, content: "6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂", color: "#C4653A", fontSize: 24, y: "40%" },
    ],
  },
];

export default function StudentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [pollActive, setPollActive] = useState(true);
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [students] = useState(24);

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      {/* Top bar */}
      <div className="h-12 bg-[#2A2523] border-b border-white/5 flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-sienna rounded-md flex items-center justify-center">
            <Presentation className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs text-white/50 font-medium">
            Biology 101
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Users className="w-3.5 h-3.5" />
            {students} online
          </div>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-xs text-white/30 font-mono">XKCD</span>
        </div>
      </div>

      {/* Slide */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="w-full max-w-4xl aspect-video rounded-lg shadow-2xl shadow-black/30 flex items-center justify-center relative overflow-hidden"
          style={{ background: slide.background }}
        >
          {slide.elements.map((el, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 text-center px-8"
              style={{
                top: el.y,
                color: el.color,
                fontSize: `${el.fontSize}px`,
                fontFamily: "var(--font-heading)",
              }}
            >
              {el.content}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-14 bg-[#2A2523] border-t border-white/5 flex items-center justify-between px-6 shrink-0">
        <span className="text-xs text-white/30">
          Slide {currentSlide + 1} of {slides.length}
        </span>
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentSlide
                  ? "w-6 bg-sienna"
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-white/30">XKCD</span>
      </div>

      {/* Poll overlay for student */}
      {pollActive && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-96 bg-white rounded-2xl shadow-2xl p-6 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-charcoal">Live Poll</h3>
            <span className="text-[11px] text-sienna font-medium bg-sienna/10 px-2 py-0.5 rounded-full animate-pulse">
              Active
            </span>
          </div>
          <p className="text-sm text-charcoal/70 mb-4">
            Where does photosynthesis primarily take place?
          </p>
          <div className="space-y-2 mb-4">
            {["Chloroplast", "Mitochondria", "Nucleus", "Ribosome"].map(
              (opt, i) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSelectedOption(i);
                    setVoted(true);
                  }}
                  disabled={voted}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                    voted
                      ? selectedOption === i
                        ? "border-sienna bg-sienna/5 text-sienna"
                        : "border-border bg-cream/50 text-charcoal/40"
                      : "border-border hover:border-charcoal/20 text-charcoal"
                  }`}
                >
                  {opt}
                  {voted && selectedOption === i && (
                    <Check className="w-4 h-4 inline ml-2" />
                  )}
                </button>
              )
            )}
          </div>
          {voted && (
            <p className="text-xs text-[#16A34A] text-center">
              Vote submitted! Waiting for results...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
