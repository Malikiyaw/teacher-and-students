"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Command, Type, Image, Shapes, Video, Code, Undo2, Redo2, Copy, Clipboard, Trash2,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  FileDown, FileText, LayoutGrid, Magnet, ZoomIn, ZoomOut, ZoomIn as ZoomReset,
  Layers, Play, StickyNote, HelpCircle, Settings, Presentation,
  Wand2, Globe, Maximize, Plus, Minus, Columns, PanelTop,
  PanelBottom, PanelRight, PanelLeft, PanelRightClose,
  Group, Ungroup,
} from "lucide-react";

interface CommandItem {
  id: string;
  name: string;
  description: string;
  category: "File" | "Edit" | "Insert" | "View" | "Tools" | "Help";
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? commands.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((prev) => Math.max(prev - 1, 0)); return; }
      if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
        onClose();
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  useEffect(() => {
    if (listRef.current && filtered[selectedIndex]) {
      const el = listRef.current.children[selectedIndex] as HTMLElement;
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, filtered]);

  if (!isOpen) return null;

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  const categoryOrder = ["File", "Edit", "Insert", "View", "Tools", "Help"];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-[#2A2523] rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Command className="w-4 h-4 text-white/40 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-white/80 outline-none placeholder:text-white/30"
          />
          <kbd className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded font-mono">esc</kbd>
        </div>
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
          {Object.entries(grouped).length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-white/30">
              No commands found for &quot;{query}&quot;
            </div>
          ) : (
            categoryOrder.map((cat) => {
              const items = grouped[cat];
              if (!items) return null;
              return (
                <div key={cat}>
                  <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-white/30 font-medium">
                    {cat}
                  </div>
                  {items.map((cmd, idx) => {
                    const globalIdx = filtered.indexOf(cmd);
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => { cmd.action(); onClose(); }}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          globalIdx === selectedIndex
                            ? "bg-sienna/15 text-white"
                            : "text-white/60 hover:text-white/80 hover:bg-white/5"
                        }`}
                      >
                        <span className="w-5 h-5 flex items-center justify-center shrink-0 text-current opacity-70">
                          {cmd.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{cmd.name}</div>
                          <div className="text-[11px] text-white/40 truncate">{cmd.description}</div>
                        </div>
                        {cmd.shortcut && (
                          <kbd className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded font-mono shrink-0">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export function buildCommandList(params: {
  addSlide: () => void;
  deleteSlide: () => void;
  duplicateSlide: () => void;
  addText: () => void;
  addImage: () => void;
  addShape: () => void;
  addVideo: () => void;
  addCode: () => void;
  undo: () => void;
  redo: () => void;
  copy: () => void;
  paste: () => void;
  deleteSelected: () => void;
  bold: () => void;
  italic: () => void;
  underline: () => void;
  alignLeft: () => void;
  alignCenter: () => void;
  alignRight: () => void;
  exportPDF: () => void;
  exportPPTX: () => void;
  exportHTML: () => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  zoomFit: () => void;
  toggleLayers: () => void;
  toggleAnimations: () => void;
  toggleNotes: () => void;
  showHelp: () => void;
  showSettings: () => void;
  present: () => void;
  aiGenerate: () => void;
  stockImages: () => void;
  fullscreen: () => void;
  selectAll: () => void;
  group: () => void;
  ungroup: () => void;
}): CommandItem[] {
  const {
    addSlide, deleteSlide, duplicateSlide,
    addText, addImage, addShape, addVideo, addCode,
    undo, redo, copy, paste, deleteSelected,
    bold, italic, underline,
    alignLeft, alignCenter, alignRight,
    exportPDF, exportPPTX, exportHTML,
    toggleGrid, toggleSnap,
    zoomIn, zoomOut, zoomReset, zoomFit,
    toggleLayers, toggleAnimations, toggleNotes,
    showHelp, showSettings, present,
    aiGenerate, stockImages, fullscreen,
    selectAll, group, ungroup,
  } = params;

  return [
    // File
    { id: "add-slide", name: "Add Slide", description: "Add a new blank slide", category: "File", icon: <Plus className="w-4 h-4" />, shortcut: "Ctrl+M", action: addSlide },
    { id: "delete-slide", name: "Delete Slide", description: "Delete current slide", category: "File", icon: <Trash2 className="w-4 h-4" />, action: deleteSlide },
    { id: "duplicate-slide", name: "Duplicate Slide", description: "Duplicate current slide", category: "File", icon: <Copy className="w-4 h-4" />, action: duplicateSlide },
    { id: "export-pdf", name: "Export PDF", description: "Export as PDF", category: "File", icon: <FileDown className="w-4 h-4" />, action: exportPDF },
    { id: "export-pptx", name: "Export PPTX", description: "Export as PowerPoint", category: "File", icon: <FileDown className="w-4 h-4" />, action: exportPPTX },
    { id: "export-html", name: "Export HTML", description: "Export as HTML", category: "File", icon: <FileText className="w-4 h-4" />, action: exportHTML },

    // Edit
    { id: "undo", name: "Undo", description: "Undo last action", category: "Edit", icon: <Undo2 className="w-4 h-4" />, shortcut: "Ctrl+Z", action: undo },
    { id: "redo", name: "Redo", description: "Redo last undone action", category: "Edit", icon: <Redo2 className="w-4 h-4" />, shortcut: "Ctrl+Shift+Z", action: redo },
    { id: "copy", name: "Copy", description: "Copy selected element(s)", category: "Edit", icon: <Copy className="w-4 h-4" />, shortcut: "Ctrl+C", action: copy },
    { id: "paste", name: "Paste", description: "Paste copied element(s)", category: "Edit", icon: <Clipboard className="w-4 h-4" />, shortcut: "Ctrl+V", action: paste },
    { id: "delete", name: "Delete", description: "Delete selected element(s)", category: "Edit", icon: <Trash2 className="w-4 h-4" />, shortcut: "Del", action: deleteSelected },
    { id: "select-all", name: "Select All", description: "Select all elements", category: "Edit", icon: <LayoutGrid className="w-4 h-4" />, shortcut: "Ctrl+A", action: selectAll },
    { id: "group", name: "Group", description: "Group selected elements", category: "Edit", icon: <Group className="w-4 h-4" />, action: group },
    { id: "ungroup", name: "Ungroup", description: "Ungroup selected elements", category: "Edit", icon: <Ungroup className="w-4 h-4" />, action: ungroup },
    { id: "bold", name: "Bold", description: "Toggle bold formatting", category: "Edit", icon: <Bold className="w-4 h-4" />, shortcut: "Ctrl+B", action: bold },
    { id: "italic", name: "Italic", description: "Toggle italic formatting", category: "Edit", icon: <Italic className="w-4 h-4" />, shortcut: "Ctrl+I", action: italic },
    { id: "underline", name: "Underline", description: "Toggle underline formatting", category: "Edit", icon: <Underline className="w-4 h-4" />, shortcut: "Ctrl+U", action: underline },
    { id: "align-left", name: "Align Left", description: "Align text left", category: "Edit", icon: <AlignLeft className="w-4 h-4" />, action: alignLeft },
    { id: "align-center", name: "Align Center", description: "Align text center", category: "Edit", icon: <AlignCenter className="w-4 h-4" />, action: alignCenter },
    { id: "align-right", name: "Align Right", description: "Align text right", category: "Edit", icon: <AlignRight className="w-4 h-4" />, action: alignRight },

    // Insert
    { id: "add-text", name: "Add Text", description: "Insert a text element", category: "Insert", icon: <Type className="w-4 h-4" />, action: addText },
    { id: "add-image", name: "Add Image", description: "Insert an image element", category: "Insert", icon: <Image className="w-4 h-4" />, action: addImage },
    { id: "add-shape", name: "Add Shape", description: "Insert a shape", category: "Insert", icon: <Shapes className="w-4 h-4" />, action: addShape },
    { id: "add-video", name: "Add Video", description: "Insert a video element", category: "Insert", icon: <Video className="w-4 h-4" />, action: addVideo },
    { id: "add-code", name: "Add Code", description: "Insert a code block", category: "Insert", icon: <Code className="w-4 h-4" />, action: addCode },

    // View
    { id: "toggle-grid", name: "Toggle Grid", description: "Show/hide alignment grid", category: "View", icon: <LayoutGrid className="w-4 h-4" />, action: toggleGrid },
    { id: "toggle-snap", name: "Toggle Snap", description: "Enable/disable snap to grid", category: "View", icon: <Magnet className="w-4 h-4" />, action: toggleSnap },
    { id: "zoom-in", name: "Zoom In", description: "Zoom in 10%", category: "View", icon: <ZoomIn className="w-4 h-4" />, action: zoomIn },
    { id: "zoom-out", name: "Zoom Out", description: "Zoom out 10%", category: "View", icon: <ZoomOut className="w-4 h-4" />, action: zoomOut },
    { id: "zoom-reset", name: "Zoom Reset", description: "Reset zoom to 100%", category: "View", icon: <ZoomReset className="w-4 h-4" />, action: zoomReset },
    { id: "zoom-fit", name: "Zoom Fit", description: "Fit canvas to viewport", category: "View", icon: <Maximize className="w-4 h-4" />, action: zoomFit },
    { id: "toggle-layers", name: "Toggle Layers", description: "Show/hide layers panel", category: "View", icon: <Layers className="w-4 h-4" />, action: toggleLayers },
    { id: "toggle-animations", name: "Toggle Animations", description: "Show/hide animations panel", category: "View", icon: <Play className="w-4 h-4" />, action: toggleAnimations },
    { id: "toggle-notes", name: "Toggle Notes", description: "Show/hide speaker notes", category: "View", icon: <StickyNote className="w-4 h-4" />, action: toggleNotes },
    { id: "fullscreen", name: "Fullscreen", description: "Toggle fullscreen mode", category: "View", icon: <Maximize className="w-4 h-4" />, action: fullscreen },

    // Tools
    { id: "ai-generate", name: "AI Generate Slides", description: "Generate slides with AI", category: "Tools", icon: <Wand2 className="w-4 h-4" />, action: aiGenerate },
    { id: "stock-images", name: "Stock Images", description: "Browse stock photo library", category: "Tools", icon: <Globe className="w-4 h-4" />, action: stockImages },

    // Help
    { id: "show-help", name: "Show Help", description: "View keyboard shortcuts", category: "Help", icon: <HelpCircle className="w-4 h-4" />, shortcut: "?", action: showHelp },
    { id: "show-settings", name: "Show Settings", description: "Open presentation settings", category: "Help", icon: <Settings className="w-4 h-4" />, action: showSettings },
    { id: "present", name: "Present", description: "Start slideshow presentation", category: "Help", icon: <Presentation className="w-4 h-4" />, action: present },
  ];
}
