"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

export async function renderMermaidToSVG(mermaidCode: string): Promise<string> {
  const trimmed = mermaidCode.trim();
  if (!trimmed) return "";
  try {
    const mermaidUrl = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
    const mermaid = await import(mermaidUrl);
    mermaid.default.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose", fontFamily: "monospace" });
    const { svg } = await mermaid.default.render("mermaid-" + Date.now(), trimmed);
    if (svg) return svg;
  } catch {}
  return `<pre style="font-family:monospace;color:#4ade80;background:#1a1a1a;padding:12px;border-radius:4px;overflow-x:auto;white-space:pre-wrap;margin:0">${trimmed.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>`;
}

interface DiagramTemplate {
  label: string;
  code: string;
}

const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  {
    label: "Flowchart",
    code: `graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Process]\n  B -->|No| D[End]\n  C --> D`,
  },
  {
    label: "Sequence",
    code: `sequenceDiagram\n  Alice->>John: Hello John, how are you?\n  John-->>Alice: Great!\n  Alice-)John: See you later!`,
  },
  {
    label: "Class",
    code: `classDiagram\n  class Animal{\n    +String name\n    +makeSound()\n  }\n  class Dog{\n    +bark()\n  }\n  Animal <|-- Dog`,
  },
  {
    label: "State",
    code: `stateDiagram-v2\n  [*] --> Idle\n  Idle --> Active: start\n  Active --> Idle: stop\n  Active --> Completed: finish\n  Completed --> [*]`,
  },
  {
    label: "ER",
    code: `erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ LINE-ITEM : contains\n  CUSTOMER }|..|{ ADDRESS : "has"`,
  },
  {
    label: "Gantt",
    code: `gantt\n  title Project Timeline\n  dateFormat  YYYY-MM-DD\n  section Planning\n  Research    :done, 2024-01-01, 7d\n  Design      :active, after research, 5d\n  section Development\n  Frontend    :2024-01-15, 10d\n  Backend     :2024-01-20, 10d`,
  },
  {
    label: "Pie",
    code: `pie title Distribution\n  "Category A" : 40\n  "Category B" : 25\n  "Category C" : 20\n  "Category D" : 15`,
  },
  {
    label: "Mindmap",
    code: `mindmap\n  root((Main Idea))\n    Branch 1\n      Sub-branch A\n      Sub-branch B\n    Branch 2\n      Sub-branch C\n    Branch 3`,
  },
];

function MermaidEditorModal({ onInsert, onClose, initialValue }: { onInsert: (code: string) => void; onClose: () => void; initialValue?: string }) {
  const [input, setInput] = useState(initialValue || "");
  const [previewSvg, setPreviewSvg] = useState("");
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const updatePreview = useCallback(async (val: string) => {
    if (!val.trim()) { setPreviewSvg(""); return; }
    setLoading(true);
    try {
      const svg = await renderMermaidToSVG(val);
      setPreviewSvg(svg);
    } catch {
      setPreviewSvg(`<pre style="font-family:monospace;color:#4ade80;background:#1a1a1a;padding:12px;border-radius:4px">${val.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>`);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { updatePreview(input); }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input, updatePreview]);

  const applyTemplate = (code: string) => {
    setInput(code);
  };

  const handleInsert = () => {
    if (input.trim()) {
      onInsert(input.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#2A2523] rounded-xl p-6 w-[720px] border border-white/10 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg text-white">Mermaid Diagram Editor</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>

        {/* Diagram templates */}
        <div className="mb-3">
          <span className="text-[9px] text-white/30 uppercase tracking-wider block mb-1">Templates</span>
          <div className="flex flex-wrap gap-1">
            {DIAGRAM_TEMPLATES.map((t) => (
              <button key={t.label} onClick={() => applyTemplate(t.code)}
                className="text-[10px] bg-white/5 hover:bg-white/10 text-white/50 hover:text-white px-2.5 py-1 rounded transition-colors">
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 flex-1 min-h-0">
          {/* Input */}
          <div className="flex-1 flex flex-col min-w-0">
            <span className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Source</span>
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={"graph TD\n  A[Start] --> B[End]"}
              className="flex-1 bg-[#1A1715] border border-white/10 rounded-lg px-3 py-2 text-sm text-green-400 font-mono outline-none resize-none"
              style={{ minHeight: 200, caretColor: "#4ade80" }}
              autoFocus />
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col min-w-0">
            <span className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Preview</span>
            <div className="flex-1 bg-[#1A1715] rounded-lg border border-white/5 p-3 overflow-auto flex items-start justify-center" style={{ minHeight: 200 }}>
              {loading ? (
                <div className="flex items-center gap-2 text-white/30 text-xs">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75"/></svg>
                  Rendering...
                </div>
              ) : previewSvg ? (
                <div dangerouslySetInnerHTML={{ __html: previewSvg }} className="w-full [&_svg]:max-w-full [&_svg]:h-auto" />
              ) : (
                <span className="text-white/20 text-xs">Diagram preview will appear here</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={handleInsert} disabled={!input.trim()}
            className="flex-1 bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all disabled:opacity-50">
            Insert Diagram
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

export default MermaidEditorModal;

export function MermaidPreview({ code, className }: { code: string; className?: string }) {
  const [svg, setSvg] = useState("");
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const renderDiagram = useCallback(async () => {
    setLoading(true);
    try {
      const result = await renderMermaidToSVG(code);
      if (mountedRef.current) { setSvg(result); setLoading(false); }
    } catch {
      if (mountedRef.current) {
        setSvg(`<pre style="font-family:monospace;color:#4ade80;background:#1a1a1a;padding:8px;border-radius:4px;white-space:pre-wrap;margin:0;font-size:11px">${code.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>`);
        setLoading(false);
      }
    }
  }, [code]);

  useEffect(() => { renderDiagram(); }, [renderDiagram]);

  return (
    <div className={`w-full h-full relative overflow-auto bg-[#1a1a1a] rounded flex items-center justify-center ${className || ""}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a] z-10">
          <div className="flex items-center gap-2 text-white/30 text-xs">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75"/></svg>
            Rendering...
          </div>
        </div>
      )}
      {svg && (
        <div className="w-full h-full flex items-center justify-center p-1" dangerouslySetInnerHTML={{ __html: svg }}
          style={{ opacity: loading ? 0 : 1, transition: "opacity 0.2s" }} />
      )}
    </div>
  );
}
