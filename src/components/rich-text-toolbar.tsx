"use client";

import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Minus, Plus } from "lucide-react";

interface RichTextToolbarProps {
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onAlign?: (align: "left" | "center" | "right" | "justify") => void;
  onBulletList?: () => void;
  onNumberedList?: () => void;
  onFontSize?: (delta: number) => void;
  onFontFamily?: (font: string) => void;
  fontSize?: number;
  fontFamily?: string;
}

const fonts = [
  { value: "var(--font-heading)", label: "Heading" },
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Courier New', monospace", label: "Monospace" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "'Times New Roman', serif", label: "Times" },
  { value: "'Comic Sans MS', cursive", label: "Comic Sans" },
];

export default function RichTextToolbar({ onBold, onItalic, onUnderline, onAlign, onBulletList, onNumberedList, onFontSize, onFontFamily, fontSize, fontFamily }: RichTextToolbarProps) {
  return (
    <div className="flex items-center gap-0.5 px-1 py-1 bg-white/5 rounded-lg border border-white/10">
      <button onClick={onBold} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-all" title="Bold">
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button onClick={onItalic} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-all" title="Italic">
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button onClick={onUnderline} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-all" title="Underline">
        <Underline className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-4 bg-white/10 mx-1" />
      <button onClick={() => onAlign?.("left")} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-all" title="Align Left">
        <AlignLeft className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => onAlign?.("center")} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-all" title="Align Center">
        <AlignCenter className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => onAlign?.("right")} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-all" title="Align Right">
        <AlignRight className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-4 bg-white/10 mx-1" />
      <button onClick={onBulletList} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-all" title="Bullet List">
        <List className="w-3.5 h-3.5" />
      </button>
      <button onClick={onNumberedList} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-all" title="Numbered List">
        <ListOrdered className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-4 bg-white/10 mx-1" />
      <div className="flex items-center gap-1">
        <button onClick={() => onFontSize?.(-2)} className="p-1 text-white/40 hover:text-white rounded transition-all">
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-[11px] text-white/50 w-7 text-center">{fontSize || 18}</span>
        <button onClick={() => onFontSize?.(2)} className="p-1 text-white/40 hover:text-white rounded transition-all">
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <div className="w-px h-4 bg-white/10 mx-1" />
      <select value={fontFamily || "var(--font-heading)"} onChange={(e) => onFontFamily?.(e.target.value)}
        className="bg-transparent text-[10px] text-white/50 outline-none cursor-pointer max-w-[70px]">
        {fonts.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>
    </div>
  );
}
