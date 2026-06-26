"use client";

import { useEffect, useRef } from "react";
import { Copy, Trash2, ArrowUp, ArrowDown, Lock, Unlock, ChevronUp, ChevronDown } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onBringFront: () => void;
  onSendBack: () => void;
  onDuplicate: () => void;
  onGroup: () => void;
}

export default function ElementContextMenu({ x, y, onClose, onCopy, onDelete, onBringFront, onSendBack, onDuplicate, onGroup }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("keydown", handleKey); };
  }, [onClose]);

  const items = [
    { icon: Copy, label: "Copy", shortcut: "Ctrl+C", action: onCopy },
    { icon: Copy, label: "Duplicate", shortcut: "Ctrl+D", action: onDuplicate },
    { divider: true },
    { icon: ArrowUp, label: "Bring to Front", shortcut: "", action: onBringFront },
    { icon: ArrowDown, label: "Send to Back", shortcut: "", action: onSendBack },
    { divider: true },
    { icon: ChevronUp, label: "Group", shortcut: "Ctrl+G", action: onGroup },
    { icon: Trash2, label: "Delete", shortcut: "Del", action: onDelete, danger: true },
  ];

  return (
    <div ref={ref}
      className="fixed z-[300] bg-[#2A2523] border border-white/10 rounded-xl shadow-2xl py-1 w-48"
      style={{ left: x, top: y }}>
      {items.map((item, i) => {
        if ("divider" in item) return <div key={i} className="h-px bg-white/10 my-1" />;
        return (
          <button key={i} onClick={() => { item.action?.(); onClose(); }}
            className={`flex items-center gap-3 w-full px-3 py-2 text-xs transition-all ${
              "danger" in item && item.danger ? "text-red-400 hover:bg-red-400/10" : "text-white/60 hover:bg-white/5 hover:text-white/80"
            }`}>
            <item.icon className="w-3.5 h-3.5" />
            <span className="flex-1 text-left">{item.label}</span>
            {"shortcut" in item && item.shortcut && <span className="text-white/20 text-[10px]">{item.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
}
