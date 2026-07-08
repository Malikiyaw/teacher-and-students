"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2, Check, Palette, RefreshCw } from "lucide-react";

export interface CustomTheme {
  id: string;
  name: string;
  background: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  slideBackground: string;
  colors: string[];
}

export const themePresets: CustomTheme[] = [
  {
    id: "light",
    name: "Light",
    background: "#F5F3F0",
    slideBackground: "#FFFFFF",
    textColor: "#1C1917",
    accentColor: "#C4653A",
    fontFamily: "var(--font-heading)",
    colors: ["#1C1917", "#C4653A", "#6B6560", "#F0EDE8", "#3D3632", "#E8A87C"],
  },
  {
    id: "dark",
    name: "Dark",
    background: "#1A1715",
    slideBackground: "#2A2523",
    textColor: "#F0EDE8",
    accentColor: "#E8A87C",
    fontFamily: "var(--font-heading)",
    colors: ["#F0EDE8", "#E8A87C", "#6B6560", "#3D3632", "#C4653A", "#FFFFFF"],
  },
  {
    id: "modern",
    name: "Modern",
    background: "#F0F2F5",
    slideBackground: "#FFFFFF",
    textColor: "#1A1A2E",
    accentColor: "#4361EE",
    fontFamily: "Inter, sans-serif",
    colors: ["#1A1A2E", "#4361EE", "#7B8CDE", "#E8ECF4", "#16213E", "#0F3460"],
  },
  {
    id: "sunset",
    name: "Sunset",
    background: "#FFF5E6",
    slideBackground: "#FFFAF3",
    textColor: "#2D1B00",
    accentColor: "#E76F51",
    fontFamily: "Georgia, serif",
    colors: ["#2D1B00", "#E76F51", "#F4A261", "#E9C46A", "#264653", "#D62828"],
  },
  {
    id: "ocean",
    name: "Ocean",
    background: "#E8F4F8",
    slideBackground: "#F0F8FA",
    textColor: "#023047",
    accentColor: "#0077B6",
    fontFamily: "Inter, sans-serif",
    colors: ["#023047", "#0077B6", "#00B4D8", "#90E0EF", "#03045E", "#CAF0F8"],
  },
  {
    id: "forest",
    name: "Forest",
    background: "#F0F7F0",
    slideBackground: "#F8FBF8",
    textColor: "#1B3A1B",
    accentColor: "#2D6A4F",
    fontFamily: "Georgia, serif",
    colors: ["#1B3A1B", "#2D6A4F", "#52B788", "#95D5B2", "#40916C", "#D8F3DC"],
  },
  {
    id: "midnight",
    name: "Midnight",
    background: "#1A1A2E",
    slideBackground: "#16213E",
    textColor: "#E8E8E8",
    accentColor: "#E94560",
    fontFamily: "Inter, sans-serif",
    colors: ["#E8E8E8", "#E94560", "#0F3460", "#533483", "#16213E", "#1A1A2E"],
  },
  {
    id: "nature",
    name: "Nature",
    background: "#FAF3E0",
    slideBackground: "#FFFDF5",
    textColor: "#3E2723",
    accentColor: "#8B5CF6",
    fontFamily: "Georgia, serif",
    colors: ["#3E2723", "#8B5CF6", "#A78BFA", "#C4B5FD", "#5B21B6", "#EDE9FE"],
  },
  {
    id: "retro",
    name: "Retro",
    background: "#FDF6E3",
    slideBackground: "#FFFEF5",
    textColor: "#5A4A3A",
    accentColor: "#D4A373",
    fontFamily: "Georgia, serif",
    colors: ["#5A4A3A", "#D4A373", "#E9EDC9", "#CCD5AE", "#A3B18A", "#FAEDCD"],
  },
  {
    id: "neon",
    name: "Neon",
    background: "#0D0D0D",
    slideBackground: "#1A1A1A",
    textColor: "#FFFFFF",
    accentColor: "#00FF88",
    fontFamily: "Inter, sans-serif",
    colors: ["#FFFFFF", "#00FF88", "#FF00FF", "#00FFFF", "#FFFF00", "#FF6600"],
  },
];

export function applyThemeToSlides(
  slides: { background: string; elements: { color: string; fontFamily?: string; type: string }[] }[],
  theme: CustomTheme
): typeof slides {
  return slides.map((s) => ({
    ...s,
    background: theme.slideBackground,
    elements: s.elements.map((el) => ({
      ...el,
      fontFamily: el.type === "text" ? theme.fontFamily : el.fontFamily,
      color: el.type === "text" || el.type === "shape" ? theme.textColor : el.color,
    })),
  }));
}

const STORAGE_KEY = "moew-custom-themes";

export function loadCustomThemes(): CustomTheme[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCustomThemes(themes: CustomTheme[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  } catch {}
}

const fontOptions = [
  "var(--font-heading)",
  "Inter, sans-serif",
  "Georgia, serif",
  "Arial, sans-serif",
  "Helvetica, sans-serif",
  "Times New Roman, serif",
  "Courier New, monospace",
  "Verdana, sans-serif",
  "Trebuchet MS, sans-serif",
  "Palatino, serif",
  "Garamond, serif",
  "Bookman, serif",
  "Comic Sans MS, cursive",
  "Impact, sans-serif",
  "Lucida Console, monospace",
];

interface CustomThemeEditorProps {
  onApply: (theme: CustomTheme) => void;
  onClose: () => void;
}

export function CustomThemeEditor({ onApply, onClose }: CustomThemeEditorProps) {
  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>([]);
  const [editing, setEditing] = useState<CustomTheme>({
    id: `theme-${Date.now()}`,
    name: "",
    background: "#F5F3F0",
    slideBackground: "#FFFFFF",
    textColor: "#1C1917",
    accentColor: "#C4653A",
    fontFamily: "var(--font-heading)",
    colors: ["#1C1917", "#C4653A", "#6B6560", "#F0EDE8", "#3D3632", "#E8A87C"],
  });

  useEffect(() => {
    setSavedThemes(loadCustomThemes());
  }, []);

  const handleSave = () => {
    if (!editing.name.trim()) return;
    const updated = [...savedThemes.filter((t) => t.id !== editing.id), { ...editing, id: `theme-${Date.now()}` }];
    setSavedThemes(updated);
    saveCustomThemes(updated);
  };

  const handleDelete = (id: string) => {
    const updated = savedThemes.filter((t) => t.id !== id);
    setSavedThemes(updated);
    saveCustomThemes(updated);
  };

  const handleLoad = (theme: CustomTheme) => {
    setEditing({ ...theme });
  };

  const updateColor = (index: number, color: string) => {
    const next = [...editing.colors];
    next[index] = color;
    setEditing({ ...editing, colors: next });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative bg-[#2A2523] rounded-xl p-6 w-[520px] border border-white/10 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg text-white">Custom Theme</h3>
          <button onClick={onClose} className="p-1 text-white/40 hover:text-white/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Preview */}
          <div
            className="w-full h-20 rounded-lg border border-white/10 flex items-center justify-center text-sm font-medium"
            style={{ background: editing.slideBackground, color: editing.textColor }}
          >
            <span style={{ color: editing.accentColor }}>Aa</span> Preview
          </div>

          {/* Name */}
          <div>
            <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Theme Name</label>
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="My Theme"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Canvas Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editing.background}
                  onChange={(e) => setEditing({ ...editing, background: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/10 shrink-0"
                />
                <span className="text-[10px] text-white/40 font-mono">{editing.background}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Slide Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editing.slideBackground}
                  onChange={(e) => setEditing({ ...editing, slideBackground: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/10 shrink-0"
                />
                <span className="text-[10px] text-white/40 font-mono">{editing.slideBackground}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editing.textColor}
                  onChange={(e) => setEditing({ ...editing, textColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/10 shrink-0"
                />
                <span className="text-[10px] text-white/40 font-mono">{editing.textColor}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editing.accentColor}
                  onChange={(e) => setEditing({ ...editing, accentColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/10 shrink-0"
                />
                <span className="text-[10px] text-white/40 font-mono">{editing.accentColor}</span>
              </div>
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Font Family</label>
            <select
              value={editing.fontFamily}
              onChange={(e) => setEditing({ ...editing, fontFamily: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none"
            >
              {fontOptions.map((f) => (
                <option key={f} value={f}>
                  {f.replace("var(--font-heading)", "Default Heading").replace(/, sans-serif/g, "").replace(/, serif/g, "")}
                </option>
              ))}
            </select>
          </div>

          {/* Color Palette */}
          <div>
            <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Color Palette (6 colors)</label>
            <div className="grid grid-cols-6 gap-2">
              {editing.colors.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <input
                    type="color"
                    value={c}
                    onChange={(e) => updateColor(i, e.target.value)}
                    className="w-full aspect-square rounded-lg cursor-pointer bg-transparent border border-white/10"
                  />
                  <span className="text-[8px] text-white/30 font-mono truncate w-full text-center">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!editing.name.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> Save Theme
            </button>
            <button
              onClick={() => onApply(editing)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 text-white/70 text-xs py-2 rounded-lg hover:bg-white/20 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Apply to All Slides
            </button>
          </div>

          {/* Saved Themes */}
          {savedThemes.length > 0 && (
            <div>
              <label className="text-[10px] text-white/30 mb-2 block uppercase tracking-wider">Saved Themes</label>
              <div className="space-y-1">
                {savedThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded border border-white/10"
                        style={{ background: theme.slideBackground }}
                      />
                      <span className="text-xs text-white/70">{theme.name}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { handleLoad(theme); }}
                        className="text-[10px] text-sienna hover:text-sienna/80 px-2 py-0.5 rounded transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => onApply(theme)}
                        className="text-[10px] text-white/50 hover:text-white/80 px-2 py-0.5 rounded transition-colors"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => handleDelete(theme.id)}
                        className="text-[10px] text-red-400/70 hover:text-red-400 px-2 py-0.5 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
