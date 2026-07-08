"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RotateCcw, Keyboard, X } from "lucide-react";

export const DEFAULT_SHORTCUTS: Record<string, string> = {
  save: "Ctrl+S",
  undo: "Ctrl+Z",
  redo: "Ctrl+Shift+Z",
  copy: "Ctrl+C",
  paste: "Ctrl+V",
  delete: "Delete",
  bold: "Ctrl+B",
  italic: "Ctrl+I",
  underline: "Ctrl+U",
  addSlide: "Ctrl+M",
  deleteSlide: "Ctrl+Shift+D",
  duplicateSlide: "Ctrl+D",
  addText: "T",
  addImage: "I",
  addShape: "S",
  toggleGrid: "Ctrl+G",
  toggleSnap: "Ctrl+Shift+G",
  zoomIn: "Ctrl+=",
  zoomOut: "Ctrl+-",
  zoomReset: "Ctrl+0",
  toggleLayers: "Ctrl+L",
  toggleAnimations: "Ctrl+Shift+A",
  toggleNotes: "Ctrl+Shift+N",
  showHelp: "?",
  showSettings: "Ctrl+,",
  present: "F5",
  commandPalette: "Ctrl+K",
  selectAll: "Ctrl+A",
  duplicate: "Ctrl+D",
  group: "Ctrl+G",
  ungroup: "Ctrl+Shift+G",
};

const STORAGE_KEY = "moew-shortcuts";

export function loadShortcuts(): Record<string, string> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? { ...DEFAULT_SHORTCUTS, ...JSON.parse(data) } : { ...DEFAULT_SHORTCUTS };
  } catch {
    return { ...DEFAULT_SHORTCUTS };
  }
}

export function saveShortcuts(shortcuts: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
  } catch {}
}

export function getShortcutLabel(action: string): string {
  const shortcuts = loadShortcuts();
  return shortcuts[action] || "";
}

const ACTION_LABELS: Record<string, string> = {
  save: "Save",
  undo: "Undo",
  redo: "Redo",
  copy: "Copy",
  paste: "Paste",
  delete: "Delete Element",
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  addSlide: "Add Slide",
  deleteSlide: "Delete Slide",
  duplicateSlide: "Duplicate Slide",
  addText: "Add Text",
  addImage: "Add Image",
  addShape: "Add Shape",
  toggleGrid: "Toggle Grid",
  toggleSnap: "Toggle Snap",
  zoomIn: "Zoom In",
  zoomOut: "Zoom Out",
  zoomReset: "Zoom Reset",
  toggleLayers: "Toggle Layers",
  toggleAnimations: "Toggle Animations",
  toggleNotes: "Toggle Notes",
  showHelp: "Show Help",
  showSettings: "Show Settings",
  present: "Present",
  commandPalette: "Command Palette",
  selectAll: "Select All",
  duplicate: "Duplicate",
  group: "Group",
  ungroup: "Ungroup",
};

interface ShortcutCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutCustomizer({ isOpen, onClose }: ShortcutCustomizerProps) {
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({});
  const [recording, setRecording] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) setShortcuts(loadShortcuts());
  }, [isOpen]);

  const handleRecord = (action: string) => {
    setRecording(action);
  };

  useEffect(() => {
    if (!recording) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push("Ctrl");
      if (e.shiftKey) parts.push("Shift");
      if (e.altKey) parts.push("Alt");
      const key = e.key;
      if (key === "Control" || key === "Shift" || key === "Alt" || key === "Meta") {
        return;
      }
      const keyMap: Record<string, string> = {
        " ": "Space",
        ";": "Semicolon",
        "'": "Quote",
        ",": "Comma",
        ".": "Period",
        "/": "Slash",
        "\\": "Backslash",
        "`": "Backtick",
        "-": "Minus",
        "=": "Equal",
        "[": "BracketLeft",
        "]": "BracketRight",
      };
      const mappedKey = keyMap[key] || key;
      const displayKey = mappedKey.length === 1 ? mappedKey.toUpperCase() : mappedKey;
      if (parts.length === 0 && displayKey.length > 1) {
        parts.push(displayKey);
      } else if (displayKey.length === 1 && parts.length === 0) {
        parts.push(displayKey);
      } else if (displayKey.length === 1 || displayKey === "Space") {
        parts.push(displayKey === "Space" ? "Space" : displayKey.toUpperCase());
      } else {
        parts.push(displayKey);
      }
      const combo = parts.join("+");
      setShortcuts((prev) => ({ ...prev, [recording]: combo }));
      setRecording(null);
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [recording]);

  const handleReset = () => {
    setShortcuts({ ...DEFAULT_SHORTCUTS });
    saveShortcuts(DEFAULT_SHORTCUTS);
  };

  const handleSave = () => {
    saveShortcuts(shortcuts);
    onClose();
  };

  const filtered = Object.entries(shortcuts).filter(([action]) =>
    (ACTION_LABELS[action] || action).toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative bg-[#2A2523] rounded-xl p-6 w-[520px] border border-white/10 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-white/60" />
            <h3 className="font-heading text-lg text-white">Customize Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-1 text-white/40 hover:text-white/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actions..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white/60 outline-none"
            />
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-all"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-0.5 mb-4">
          {filtered.map(([action, shortcut]) => (
            <div
              key={action}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="text-xs text-white/70">{ACTION_LABELS[action] || action}</span>
              {recording === action ? (
                <span className="text-[10px] text-sienna bg-sienna/10 px-2 py-1 rounded animate-pulse">
                  Press keys...
                </span>
              ) : (
                <button
                  onClick={() => handleRecord(action)}
                  className="group relative"
                >
                  <kbd className="text-[10px] text-white/40 bg-white/10 px-2 py-1 rounded font-mono hover:bg-sienna/20 hover:text-sienna transition-all min-w-[60px] text-center block">
                    {formatShortcutDisplay(shortcut)}
                  </kbd>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-3 border-t border-white/10">
          <button
            onClick={handleSave}
            className="flex-1 bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 text-white/50 text-xs py-2 rounded-lg hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function formatShortcutDisplay(shortcut: string): string {
  return shortcut
    .replace(/Ctrl/g, "⌘")
    .replace(/Shift/g, "⇧")
    .replace(/Alt/g, "⌥")
    .replace(/Delete/g, "⌫")
    .replace(/Backspace/g, "⌫")
    .replace(/Enter/g, "⏎")
    .replace(/Escape/g, "⎋")
    .replace(/ArrowUp/g, "↑")
    .replace(/ArrowDown/g, "↓")
    .replace(/ArrowLeft/g, "←")
    .replace(/ArrowRight/g, "→");
}
