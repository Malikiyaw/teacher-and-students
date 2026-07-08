"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

let katexLoadPromise: Promise<void> | null = null;
let katexLoaded = false;

async function ensureKaTeX() {
  if (katexLoaded) return;
  if (!katexLoadPromise) {
    katexLoadPromise = (async () => {
      try {
        const katexUrl = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.mjs";
        const mod: any = await import(katexUrl);
        (window as any).__katex = mod.default || mod;
        katexLoaded = true;
      } catch {} finally { katexLoadPromise = null; }
    })();
  }
  return katexLoadPromise;
}

export async function preloadKaTeX() {
  await ensureKaTeX();
}

export function renderLatexToSVG(latex: string): string {
  const trimmed = latex.trim();
  if (!trimmed) return "";
  try {
    const katex = (window as any).__katex;
    if (katex && typeof katex.renderToString === "function") {
      const html = katex.renderToString(trimmed, { displayMode: true, throwOnError: false });
      if (html) return html;
    }
  } catch {}
  return `<div style="font-family:monospace;color:#4ade80;background:#1a1a1a;padding:8px;border-radius:4px;white-space:pre-wrap;overflow-x:auto">${trimmed.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>`;
}

const SYMBOL_CATEGORIES = [
  {
    label: "Greek",
    symbols: ["\\alpha", "\\beta", "\\gamma", "\\delta", "\\theta", "\\lambda", "\\pi", "\\sigma", "\\phi", "\\omega",
      "\\Alpha", "\\Beta", "\\Gamma", "\\Delta", "\\Theta", "\\Lambda", "\\Pi", "\\Sigma", "\\Phi", "\\Omega"],
  },
  {
    label: "Operators",
    symbols: ["\\sum", "\\int", "\\prod", "\\partial", "\\nabla", "\\sqrt", "\\infty",
      "\\approx", "\\neq", "\\leq", "\\geq", "\\times", "\\div", "\\pm"],
  },
  {
    label: "Arrows",
    symbols: ["\\rightarrow", "\\leftarrow", "\\uparrow", "\\downarrow", "\\Rightarrow",
      "\\Leftarrow", "\\Leftrightarrow", "\\mapsto", "\\implies", "\\iff"],
  },
  {
    label: "Brackets",
    symbols: ["\\left(", "\\right)", "\\left[", "\\right]", "\\left\\{", "\\right\\}",
      "\\langle", "\\rangle", "\\lvert", "\\rvert", "\\|"],
  },
  {
    label: "Fractions",
    symbols: ["\\frac{a}{b}", "\\tfrac{a}{b}", "\\dfrac{a}{b}", "\\cfrac{a}{b}"],
  },
  {
    label: "Other",
    symbols: ["\\cdot", "\\cdots", "\\vdots", "\\ddots", "\\forall", "\\exists",
      "\\emptyset", "\\in", "\\notin", "\\subset", "\\supset", "\\cup", "\\cap",
      "\\mathbb{R}", "\\mathcal", "\\mathrm", "\\text", "\\boxed", "\\hat", "\\tilde", "\\bar"],
  },
];

function LatexEditorModal({ onInsert, onClose, initialValue }: { onInsert: (latex: string) => void; onClose: () => void; initialValue?: string }) {
  const [input, setInput] = useState(initialValue || "");
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => { preloadKaTeX(); }, []);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const updatePreview = useCallback((val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewHtml(renderLatexToSVG(val));
    }, 300);
  }, []);

  useEffect(() => {
    if (input.trim()) updatePreview(input);
    else setPreviewHtml("");
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input, updatePreview]);

  const insertSymbol = (sym: string) => {
    setInput((prev) => prev + sym + " ");
  };

  const handleInsert = () => {
    if (input.trim()) {
      onInsert(input.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#2A2523] rounded-xl p-6 w-[640px] border border-white/10 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg text-white">LaTeX Equation Editor</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>

        {/* Symbols toolbar */}
        <div className="mb-3 max-h-28 overflow-y-auto">
          <div className="flex flex-wrap gap-1">
            {SYMBOL_CATEGORIES.map((cat) => (
              <div key={cat.label} className="flex items-center gap-0.5 mr-2 mb-1">
                <span className="text-[9px] text-white/30 uppercase mr-1">{cat.label}</span>
                {cat.symbols.map((sym) => (
                  <button key={sym} onClick={() => insertSymbol(sym)}
                    className="text-[11px] bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-1.5 py-0.5 rounded transition-colors font-mono"
                    title={sym}>
                    {sym.replace(/\\/g, "").replace(/\{.*\}/, "")}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
          className="w-full bg-[#1A1715] border border-white/10 rounded-lg px-3 py-2 text-sm text-green-400 font-mono outline-none mb-3 resize-none"
          style={{ minHeight: 80, caretColor: "#4ade80" }}
          autoFocus />

        {/* Preview */}
        <div className="flex-1 bg-[#1A1715] rounded-lg border border-white/5 p-4 mb-4 flex items-center justify-center overflow-x-auto" style={{ minHeight: 100 }}>
          {previewHtml ? (
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} className="[&_.katex]:text-2xl" />
          ) : (
            <span className="text-white/20 text-xs">Preview will appear here as you type</span>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={handleInsert} disabled={!input.trim()}
            className="flex-1 bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all disabled:opacity-50">
            Insert Equation
          </button>
          <button onClick={onClose}
            className="flex-1 bg-white/5 text-white/40 text-xs py-2 rounded-lg hover:bg-white/10 transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default LatexEditorModal;
