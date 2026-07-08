"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Puzzle, ToggleLeft, ToggleRight, Download, ExternalLink, BarChart3, Eye, Timer, Archive } from "lucide-react";

export interface SlideElement {
  id: string;
  type: string;
  content: string;
  [key: string]: any;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  toolbarButton?: {
    icon: string;
    label: string;
    onClick: () => void;
  };
  onInit?: () => void;
  onSlideChange?: (slideIndex: number) => void;
  onElementSelect?: (element: SlideElement | null) => void;
}

export class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private listeners: Set<() => void> = new Set();

  register(plugin: Plugin): void {
    this.plugins.set(plugin.id, plugin);
    this.notify();
  }

  unregister(id: string): void {
    this.plugins.delete(id);
    this.notify();
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  get(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  getToolbarButtons() {
    return this.getAll()
      .filter((p) => p.toolbarButton)
      .map((p) => ({ id: p.id, ...p.toolbarButton! }));
  }

  executeInit() {
    this.getAll().forEach((p) => p.onInit?.());
  }

  executeSlideChange(index: number) {
    this.getAll().forEach((p) => p.onSlideChange?.(index));
  }

  executeElementSelect(element: SlideElement | null) {
    this.getAll().forEach((p) => p.onElementSelect?.(element));
  }

  onChange(fn: () => void) {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }
}

// Singleton instance
export const pluginRegistry = new PluginRegistry();

// Word Counter Plugin
export const wordCounterPlugin: Plugin = {
  id: "word-counter",
  name: "Word Counter",
  description: "Shows word count in the status bar",
  version: "1.0.0",
  onInit: () => {
    // Initialized; count is rendered by hook
  },
  onSlideChange: () => {},
  onElementSelect: () => {},
};

// Color Blindness Simulator Plugin
export const colorBlindnessPlugin: Plugin = {
  id: "color-blindness",
  name: "Color Blindness Simulator",
  description: "Filters the canvas to simulate color blindness",
  version: "1.0.0",
  onInit: () => {},
  onSlideChange: () => {},
  onElementSelect: () => {},
  toolbarButton: {
    icon: "Eye",
    label: "Color Blindness",
    onClick: () => {
      const current = sessionStorage.getItem("moew-colorblind-filter") || "none";
      const filters = ["none", "grayscale(100%)", "sepia(80%) hue-rotate(-30deg)", "hue-rotate(90deg)", "contrast(150%) brightness(80%)"];
      const idx = filters.indexOf(current);
      const next = filters[(idx + 1) % filters.length];
      sessionStorage.setItem("moew-colorblind-filter", next);
      const canvas = document.querySelector('[data-canvas]') as HTMLElement;
      if (canvas) {
        canvas.style.filter = next === "none" ? "" : next;
      }
    },
  },
};

// Slide Timer Plugin
export const slideTimerPlugin: Plugin = {
  id: "slide-timer",
  name: "Slide Timer",
  description: "Auto-records time spent on each slide",
  version: "1.0.0",
  onInit: () => {
    sessionStorage.setItem("moew-slide-timer-start", String(Date.now()));
  },
  onSlideChange: (slideIndex) => {
    const start = sessionStorage.getItem("moew-slide-timer-start");
    if (start) {
      const elapsed = Math.round((Date.now() - parseInt(start)) / 1000);
      const times = JSON.parse(sessionStorage.getItem("moew-slide-times") || "{}");
      const prevSlide = sessionStorage.getItem("moew-slide-timer-prev");
      if (prevSlide !== null) {
        times[prevSlide] = (times[prevSlide] || 0) + elapsed;
      }
      times[slideIndex] = times[slideIndex] || 0;
      sessionStorage.setItem("moew-slide-times", JSON.stringify(times));
      sessionStorage.setItem("moew-slide-timer-start", String(Date.now()));
      sessionStorage.setItem("moew-slide-timer-prev", String(slideIndex));
    }
  },
  onElementSelect: () => {},
};

// Export as ZIP Plugin
export const exportZipPlugin: Plugin = {
  id: "export-zip",
  name: "Export as ZIP",
  description: "Bundles all slide images into a zip file",
  version: "1.0.0",
  toolbarButton: {
    icon: "Archive",
    label: "Export as ZIP",
    onClick: () => {
      alert("ZIP export would bundle all slide images. Requires JSZip library.");
    },
  },
};

export const defaultPlugins: Plugin[] = [
  wordCounterPlugin,
  colorBlindnessPlugin,
  slideTimerPlugin,
  exportZipPlugin,
];

// Hooks
export function usePluginWordCount(slides: { elements: { type: string; content: string }[] }[]): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let total = 0;
    slides.forEach((slide) => {
      slide.elements.forEach((el) => {
        if (el.type === "text" && el.content) {
          total += el.content.split(/\s+/).filter(Boolean).length;
        }
      });
    });
    setCount(total);
  }, [slides]);
  return count;
}

export function usePluginSlideTimes(): Record<number, number> {
  const [times, setTimes] = useState<Record<number, number>>({});
  useEffect(() => {
    const load = () => {
      try {
        setTimes(JSON.parse(sessionStorage.getItem("moew-slide-times") || "{}"));
      } catch {}
    };
    load();
    const interval = setInterval(load, 1000);
    return () => clearInterval(interval);
  }, []);
  return times;
}

interface PluginManagerProps {
  isOpen: boolean;
  onClose: () => void;
  registry: PluginRegistry;
}

export function PluginManager({ isOpen, onClose, registry }: PluginManagerProps) {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [installUrl, setInstallUrl] = useState("");
  const [showInstall, setShowInstall] = useState(false);

  const refresh = useCallback(() => {
    setPlugins(registry.getAll());
  }, [registry]);

  useEffect(() => {
    if (isOpen) {
      refresh();
      const stored = localStorage.getItem("moew-plugin-enabled");
      if (stored) {
        try { setEnabled(JSON.parse(stored)); } catch {}
      }
      const unsub = registry.onChange(refresh);
      return unsub;
    }
  }, [isOpen, registry, refresh]);

  const togglePlugin = (id: string) => {
    const next = { ...enabled, [id]: !enabled[id] };
    setEnabled(next);
    localStorage.setItem("moew-plugin-enabled", JSON.stringify(next));
  };

  const handleInstall = () => {
    if (!installUrl.trim()) return;
    try {
      const parsed: Plugin = JSON.parse(installUrl);
      if (!parsed.id || !parsed.name) {
        alert("Invalid plugin format. Must include 'id' and 'name'.");
        return;
      }
      registry.register(parsed);
      setInstallUrl("");
      setShowInstall(false);
      refresh();
    } catch {
      alert("Invalid JSON. Paste a valid plugin JSON object.");
    }
  };

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
            <Puzzle className="w-4 h-4 text-white/60" />
            <h3 className="font-heading text-lg text-white">Plugins</h3>
          </div>
          <button onClick={onClose} className="p-1 text-white/40 hover:text-white/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!showInstall ? (
          <button
            onClick={() => setShowInstall(true)}
            className="flex items-center justify-center gap-1.5 text-xs text-sienna bg-sienna/10 hover:bg-sienna/20 px-3 py-2 rounded-lg mb-4 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Install Plugin
          </button>
        ) : (
          <div className="flex gap-2 mb-4">
            <input
              value={installUrl}
              onChange={(e) => setInstallUrl(e.target.value)}
              placeholder='Paste plugin JSON: {"id":"...","name":"...",...}'
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none font-mono"
            />
            <button
              onClick={handleInstall}
              disabled={!installUrl.trim()}
              className="bg-sienna text-white text-xs px-4 py-2 rounded-lg hover:bg-sienna-dark transition-all disabled:opacity-50"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstall(false)}
              className="text-white/40 hover:text-white/70 text-xs px-2"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {plugins.length === 0 && (
            <div className="text-center py-8 text-sm text-white/30">
              No plugins installed.
            </div>
          )}
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-white/5 rounded-lg p-3 border border-white/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white/80 truncate">
                      {plugin.name}
                    </span>
                    <span className="text-[9px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded font-mono">
                      v{plugin.version}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 mt-0.5">{plugin.description}</p>
                </div>
                <button
                  onClick={() => togglePlugin(plugin.id)}
                  className={`shrink-0 transition-colors ${
                    enabled[plugin.id] !== false
                      ? "text-sienna"
                      : "text-white/30 hover:text-white/50"
                  }`}
                >
                  {enabled[plugin.id] !== false ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
              </div>
              {plugin.toolbarButton && (
                <button
                  onClick={plugin.toolbarButton.onClick}
                  className="mt-2 text-[10px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-all flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> {plugin.toolbarButton.label}
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 text-xs text-white/40 hover:text-white/60 transition-colors py-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Utility for getting plugin icons
export function getPluginIcon(iconName: string) {
  const icons: Record<string, React.ReactNode> = {
    BarChart3: <BarChart3 className="w-4 h-4" />,
    Eye: <Eye className="w-4 h-4" />,
    Timer: <Timer className="w-4 h-4" />,
    Archive: <Archive className="w-4 h-4" />,
  };
  return icons[iconName] || <Puzzle className="w-4 h-4" />;
}

// Install plugin from URL
export async function installPluginFromUrl(url: string, registry: PluginRegistry): Promise<void> {
  try {
    const res = await fetch(url);
    const plugin: Plugin = await res.json();
    if (!plugin.id || !plugin.name) {
      throw new Error("Invalid plugin: must include 'id' and 'name'");
    }
    registry.register(plugin);
  } catch (err: any) {
    throw new Error(`Failed to install plugin: ${err.message}`);
  }
}
