"use client";

import { Eye, EyeOff, Lock, Unlock, Trash2, GripVertical, Type, Image, Square, Code, Minus, Play } from "lucide-react";

interface Layer {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

interface LayersPanelProps {
  layers: Layer[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const typeIcons: Record<string, any> = {
  text: Type, image: Image, shape: Square, code: Code, divider: Minus, youtube: Play,
};

export default function LayersPanel({ layers, activeId, onSelect, onToggleVisibility, onToggleLock, onDelete, onReorder }: LayersPanelProps) {
  return (
    <div className="space-y-0.5">
      {layers.map((layer, i) => {
        const Icon = typeIcons[layer.type] || Square;
        return (
          <div key={layer.id}
            onClick={() => onSelect(layer.id)}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
              e.preventDefault();
              const from = parseInt(e.dataTransfer.getData("text/plain"));
              if (!isNaN(from) && from !== i) onReorder(from, i);
            }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all group ${
              activeId === layer.id ? "bg-sienna/15 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/70"
            } ${layer.locked ? "opacity-60" : ""}`}>
            <GripVertical className="w-3 h-3 text-white/20 cursor-grab" />
            <Icon className="w-3 h-3 shrink-0" />
            <span className="text-[11px] flex-1 truncate">{layer.label}</span>
            <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
              className={`p-0.5 rounded ${layer.visible ? "text-white/40" : "text-white/20"}`}>
              {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}
              className={`p-0.5 rounded ${layer.locked ? "text-sienna" : "text-white/40"}`}>
              {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(layer.id); }}
              className="p-0.5 rounded text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
