"use client";

import { useState, useRef, use, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, Type, Image, Square, Palette, ChevronDown,
  Undo2, Redo2, Play, Share2, Save, ArrowLeft, MousePointer2,
  Loader2, Copy, ArrowUp, ArrowDown, StickyNote, Settings,
  Code, Minus, Download, Globe, History, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, AlignStartVertical, AlignEndVertical,
  LayoutGrid, Lock, Unlock, Eye, EyeOff, GripVertical, Sparkles,
  ChartBar, QrCode, Shapes, Expand, Shrink, List, ListOrdered,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { presentationToHTML, downloadHTML } from "@/lib/export";
import ColorPicker from "@/components/color-picker";
import RichTextToolbar from "@/components/rich-text-toolbar";
import LayersPanel from "@/components/layers-panel";
import ElementContextMenu from "@/components/element-context-menu";
import { shapes, getShapeById } from "@/lib/editor/shapes";
import { alignElements, distributeElements, findSnapGuides } from "@/lib/editor/align";
import { generateDefaultChartData, renderChartSVG, type ChartType, type ChartData } from "@/lib/editor/charts";
import { iconLibrary, searchIcons, getIconSVG, type IconDef } from "@/lib/editor/icons";
import { generateQR } from "@/lib/editor/qr";
import { getAnimationCSS, getAllAnimationCSS, animationNames, type AnimationType, type AnimationDef } from "@/lib/editor/animate";
import { exportToPDF, exportToPPTX, exportSlideAsPNG } from "@/lib/editor/export-slides";

interface SlideElement {
  id: string;
  type: "text" | "image" | "shape" | "code" | "divider" | "youtube";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  zIndex?: number;
  borderRadius?: number;
  visible: boolean;
  locked: boolean;
  rotation: number;
  opacity: number;
  shapeId?: string;
  chartType?: ChartType;
  chartData?: ChartData;
  iconId?: string;
  qrContent?: string;
  qrData?: string;
  fontFamily?: string;
  textDecoration?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  animation?: AnimationDef;
}

interface Slide {
  id: string;
  elements: SlideElement[];
  background: string;
  notes?: string;
  transition?: "none" | "fade" | "slide" | "zoom";
}

interface HistoryEntry {
  slides: Slide[];
  activeSlide: number;
}

const colorPresets = [
  "#1C1917", "#C4653A", "#FFFFFF", "#F0EDE8",
  "#B91C1C", "#16A34A", "#2563EB", "#CA8A04",
  "#7C3AED", "#EC4899", "#06B6D4", "#84CC16",
];

const layoutPresets = [
  { name: "Blank", elements: [] },
  { name: "Title", elements: [{ type: "text" as const, x: 60, y: 140, width: 600, height: 60, content: "Presentation Title", color: "#1C1917", fontSize: 42, fontWeight: "bold" }, { type: "text" as const, x: 60, y: 220, width: 400, height: 30, content: "Subtitle goes here", color: "#6B6560", fontSize: 18 }] },
  { name: "Title + Content", elements: [{ type: "text" as const, x: 60, y: 40, width: 600, height: 50, content: "Slide Title", color: "#1C1917", fontSize: 32, fontWeight: "bold" }, { type: "divider" as const, x: 60, y: 100, width: 100, height: 3, content: "", color: "#C4653A" }, { type: "text" as const, x: 60, y: 130, width: 600, height: 250, content: "Add your content here.", color: "#3D3632", fontSize: 16 }] },
  { name: "Two Column", elements: [{ type: "text" as const, x: 60, y: 40, width: 600, height: 50, content: "Two Column Layout", color: "#1C1917", fontSize: 32, fontWeight: "bold" }, { type: "shape" as const, x: 60, y: 120, width: 290, height: 250, content: "", color: "#F0EDE8", borderRadius: 8 }, { type: "shape" as const, x: 370, y: 120, width: 290, height: 250, content: "", color: "#F0EDE8", borderRadius: 8 }, { type: "text" as const, x: 75, y: 180, width: 260, height: 120, content: "Left column content", color: "#3D3632", fontSize: 14 }, { type: "text" as const, x: 385, y: 180, width: 260, height: 120, content: "Right column content", color: "#3D3632", fontSize: 14 }] },
  { name: "Image + Text", elements: [{ type: "shape" as const, x: 40, y: 40, width: 300, height: 325, content: "", color: "#F0EDE8", borderRadius: 12 }, { type: "text" as const, x: 370, y: 60, width: 310, height: 50, content: "Image with Text", color: "#1C1917", fontSize: 28, fontWeight: "bold" }, { type: "text" as const, x: 370, y: 130, width: 310, height: 200, content: "Describe your image here.", color: "#3D3632", fontSize: 15 }] },
  { name: "Quote", elements: [{ type: "text" as const, x: 100, y: 120, width: 520, height: 20, content: "\u201C", color: "#C4653A", fontSize: 80, fontWeight: "bold" }, { type: "text" as const, x: 100, y: 170, width: 520, height: 100, content: "The only way to do great work is to love what you do.", color: "#1C1917", fontSize: 24, fontStyle: "italic" }, { type: "text" as const, x: 100, y: 290, width: 300, height: 30, content: "\u2014 Steve Jobs", color: "#6B6560", fontSize: 14 }] },
  { name: "Stats", elements: [{ type: "text" as const, x: 60, y: 40, width: 600, height: 50, content: "Key Statistics", color: "#1C1917", fontSize: 32, fontWeight: "bold" }, { type: "shape" as const, x: 60, y: 120, width: 180, height: 120, content: "", color: "#C4653A", borderRadius: 12 }, { type: "shape" as const, x: 270, y: 120, width: 180, height: 120, content: "", color: "#1C1917", borderRadius: 12 }, { type: "shape" as const, x: 480, y: 120, width: 180, height: 120, content: "", color: "#16A34A", borderRadius: 12 }, { type: "text" as const, x: 60, y: 145, width: 180, height: 40, content: "85%", color: "#FFFFFF", fontSize: 32, fontWeight: "bold" }, { type: "text" as const, x: 270, y: 145, width: 180, height: 40, content: "12K", color: "#FFFFFF", fontSize: 32, fontWeight: "bold" }, { type: "text" as const, x: 480, y: 145, width: 180, height: 40, content: "98%", color: "#FFFFFF", fontSize: 32, fontWeight: "bold" }, { type: "text" as const, x: 60, y: 190, width: 180, height: 30, content: "Pass Rate", color: "#FFFFFF", fontSize: 12 }, { type: "text" as const, x: 270, y: 190, width: 180, height: 30, content: "Students", color: "#FFFFFF", fontSize: 12 }, { type: "text" as const, x: 480, y: 190, width: 180, height: 30, content: "Satisfaction", color: "#FFFFFF", fontSize: 12 }] },
];

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([{ id: "1", background: "#FFFFFF", elements: [], notes: "", transition: "none" }]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<"select" | "text" | "shape">("select");
  const [showBgMenu, setShowBgMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showChartMenu, setShowChartMenu] = useState(false);
  const [showIconMenu, setShowIconMenu] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showAnimations, setShowAnimations] = useState(false);
  const [showAlignTools, setShowAlignTools] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [title, setTitle] = useState("Untitled Presentation");
  const [presentationId, setPresentationId] = useState(id);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(id !== "new");
  const [uploading, setUploading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [presentationTransition, setPresentationTransition] = useState<"none" | "fade" | "slide" | "zoom">("none");
  const [shareLink, setShareLink] = useState("");
  const [dragState, setDragState] = useState<{ elId: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [resizeState, setResizeState] = useState<{ elId: string; startX: number; startY: number; origW: number; origH: number; origX: number; origY: number } | null>(null);
  const [slideDragIndex, setSlideDragIndex] = useState<number | null>(null);
  const [slideDropIndex, setSlideDropIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapGuides, setSnapGuides] = useState<{ type: "vertical" | "horizontal"; position: number }[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elId: string } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animStyleRef = useRef<HTMLStyleElement | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [versionHistory, setVersionHistory] = useState<{ slides: Slide[]; title: string; saved_at: string }[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const currentSlide = slides[activeSlide];

  const initElement = (el: SlideElement): SlideElement => ({
    ...el,
    visible: el.visible ?? true,
    locked: el.locked ?? false,
    rotation: el.rotation ?? 0,
    opacity: el.opacity ?? 1,
    fontSize: el.fontSize ?? 18,
    zIndex: el.zIndex ?? 0,
    borderRadius: el.borderRadius ?? 0,
    fontFamily: el.fontFamily ?? undefined,
    textDecoration: el.textDecoration ?? undefined,
    textAlign: el.textAlign ?? undefined,
  });

  const pushHistory = useCallback((newSlides: Slide[], newActiveSlide?: number) => {
    setHistory((prev) => {
      const newEntry = { slides: JSON.parse(JSON.stringify(newSlides)), activeSlide: newActiveSlide ?? activeSlide };
      const truncated = prev.slice(0, historyIndex + 1);
      return [...truncated, newEntry].slice(-50);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [historyIndex, activeSlide]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    setSlides(JSON.parse(JSON.stringify(prev.slides)));
    setActiveSlide(prev.activeSlide);
    setHistoryIndex(historyIndex - 1);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    setSlides(JSON.parse(JSON.stringify(next.slides)));
    setActiveSlide(next.activeSlide);
    setHistoryIndex(historyIndex + 1);
  }, [history, historyIndex]);

  const updateSlides = useCallback((newSlides: Slide[], newActiveSlide?: number) => {
    setSlides(newSlides);
    if (newActiveSlide !== undefined) setActiveSlide(newActiveSlide);
    pushHistory(newSlides, newActiveSlide);
  }, [pushHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && activeElement) {
        e.preventDefault();
        duplicateElement();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "a" && (e.target as HTMLElement)?.tagName !== "INPUT" && (e.target as HTMLElement)?.tagName !== "TEXTAREA") {
        e.preventDefault();
        const all = currentSlide.elements.map(el => el.id);
        setSelectedElements(all);
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (activeElement && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.contentEditable === "true")) {
          deleteElement(activeElement);
        }
      }
      if (e.key === "ArrowUp" && activeElement) { e.preventDefault(); nudgeElement(0, -5); }
      if (e.key === "ArrowDown" && activeElement) { e.preventDefault(); nudgeElement(0, 5); }
      if (e.key === "ArrowLeft" && activeElement) { e.preventDefault(); nudgeElement(-5, 0); }
      if (e.key === "ArrowRight" && activeElement) { e.preventDefault(); nudgeElement(5, 0); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeElement, slides, activeSlide, undo, redo, currentSlide.elements]);

  const nudgeElement = (dx: number, dy: number) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements.find((x) => x.id === activeElement);
    if (el) { el.x += dx; el.y += dy; updateSlides(updated); }
  };

  const duplicateElement = () => {
    if (!activeElement) return;
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements.find((x) => x.id === activeElement);
    if (!el) return;
    const clone = { ...el, id: String(Date.now()), x: el.x + 20, y: el.y + 20 };
    updated[activeSlide].elements.push(clone);
    updateSlides(updated);
    setActiveElement(clone.id);
  };

  const deleteElement = (elId: string) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    updated[activeSlide].elements = updated[activeSlide].elements.filter((e) => e.id !== elId);
    updateSlides(updated);
    setActiveElement(null);
    setSelectedElements(prev => prev.filter(id => id !== elId));
  };

  const bringToFront = () => {
    if (!activeElement) return;
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements.find((x) => x.id === activeElement);
    if (!el) return;
    updated[activeSlide].elements = updated[activeSlide].elements.filter((e) => e.id !== activeElement);
    updated[activeSlide].elements.push(el);
    updateSlides(updated);
  };

  const sendToBack = () => {
    if (!activeElement) return;
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements.find((x) => x.id === activeElement);
    if (!el) return;
    updated[activeSlide].elements = updated[activeSlide].elements.filter((e) => e.id !== activeElement);
    updated[activeSlide].elements.unshift(el);
    updateSlides(updated);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      if (id === "new") {
        const { data } = await supabase
          .from("presentations")
          .insert({ user_id: user.id, title: "Untitled Presentation", slides: [{ id: "1", background: "#FFFFFF", elements: [], notes: "", transition: "none" }] })
          .select().single();
        if (data) { setPresentationId(data.id); router.replace(`/editor/${data.id}`, { scroll: false }); }
        setLoading(false);
        return;
      }

      const { data } = await supabase.from("presentations").select("*").eq("id", id).single();
      if (data) {
        setTitle(data.title);
        setIsPublic(data.is_public || false);
        if (data.version_history) setVersionHistory(data.version_history);
        if (data.slides && Array.isArray(data.slides) && data.slides.length > 0) {
          const loaded = (data.slides as unknown as Slide[]).map((s) => ({
            ...s, notes: s.notes || "", transition: s.transition || "none",
            elements: (s.elements || []).map(initElement),
          }));
          setSlides(loaded);
          setHistory([{ slides: JSON.parse(JSON.stringify(loaded)), activeSlide: 0 }]);
          setHistoryIndex(0);
        }
      }
      setLoading(false);
    };
    init();
  }, [id, supabase, router]);

  const autoSave = useCallback(async () => {
    if (presentationId === "new") return;
    setSaving(true);
    await supabase.from("presentations").update({ title, slides, updated_at: new Date().toISOString() }).eq("id", presentationId);
    setSaving(false);
    setLastSaved(new Date());
  }, [presentationId, title, slides, supabase]);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(autoSave, 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [slides, title, autoSave]);

  useEffect(() => {
    if (!animStyleRef.current) {
      const style = document.createElement("style");
      style.textContent = getAllAnimationCSS();
      document.head.appendChild(style);
      animStyleRef.current = style;
    }
  }, []);

  const exportHTML = () => {
    const html = presentationToHTML(slides, title);
    downloadHTML(html, `${title.replace(/[^a-z0-9]/gi, "_")}.html`);
  };

  const saveVersion = async () => {
    if (presentationId === "new") return;
    const newVersion = { slides: JSON.parse(JSON.stringify(slides)), title, saved_at: new Date().toISOString() };
    const updated = [newVersion, ...versionHistory].slice(0, 10);
    setVersionHistory(updated);
    await supabase.from("presentations").update({ version_history: updated }).eq("id", presentationId);
  };

  const restoreVersion = (index: number) => {
    const version = versionHistory[index];
    if (version) {
      setSlides(version.slides);
      setTitle(version.title);
      setShowVersions(false);
    }
  };

  const togglePublic = async () => {
    if (presentationId === "new") return;
    const newPublic = !isPublic;
    setIsPublic(newPublic);
    await supabase.from("presentations").update({ is_public: newPublic }).eq("id", presentationId);
  };

  const addSlide = (layout?: typeof layoutPresets[number]) => {
    const newSlide: Slide = {
      id: String(Date.now()),
      background: "#FFFFFF",
      notes: "",
      transition: "none",
      elements: (layout?.elements || []).map((el) => ({
        ...el, id: String(Date.now() + Math.random()),
        width: el.width || 300, height: el.height || 40,
        color: el.color || "#1C1917", fontSize: el.fontSize || 18,
        visible: true, locked: false, rotation: 0, opacity: 1,
      })) as SlideElement[],
    };
    const updated = [...slides, newSlide];
    updateSlides(updated, updated.length - 1);
    setShowLayoutMenu(false);
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== index);
    updateSlides(updated, Math.min(activeSlide, updated.length - 1));
  };

  const reorderSlide = (from: number, to: number) => {
    if (from === to || to < 0 || to >= slides.length) return;
    const updated = [...slides];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    updateSlides(updated, to);
  };

  const addElement = (type: "text" | "shape" | "code" | "divider" | "youtube") => {
    const newElement: SlideElement = {
      id: String(Date.now()),
      type,
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      width: type === "text" ? 300 : type === "code" ? 400 : type === "divider" ? 200 : type === "youtube" ? 400 : 120,
      height: type === "text" ? 40 : type === "code" ? 200 : type === "divider" ? 3 : type === "youtube" ? 225 : 120,
      content: type === "text" ? "Double-click to edit" : type === "code" ? "// Your code here" : type === "youtube" ? "https://youtube.com/watch?v=..." : "",
      color: type === "shape" ? "#F0EDE8" : type === "divider" ? "#C4653A" : "#1C1917",
      fontSize: 18,
      zIndex: currentSlide.elements.length,
      visible: true,
      locked: false,
      rotation: 0,
      opacity: 1,
    };
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    updated[activeSlide].elements.push(newElement);
    updateSlides(updated);
    setActiveElement(newElement.id);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("files").upload(path, file);
    if (!error) {
      const { data: urlData } = supabase.storage.from("files").getPublicUrl(path);
      const newElement: SlideElement = {
        id: String(Date.now()), type: "image", x: 100, y: 100,
        width: 300, height: 200, content: urlData.publicUrl,
        color: "#FFFFFF", zIndex: currentSlide.elements.length,
        visible: true, locked: false, rotation: 0, opacity: 1,
      };
      const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
      updated[activeSlide].elements.push(newElement);
      updateSlides(updated);
      setActiveElement(newElement.id);
    }
    setUploading(false);
  };

  const addShapeElement = (shapeId: string) => {
    const shape = getShapeById(shapeId);
    if (!shape) return;
    const h = 120;
    const w = Math.round(h * (shape.defaultRatio || 1));
    const newElement: SlideElement = {
      id: String(Date.now()), type: "shape",
      x: 100, y: 100, width: w, height: h,
      content: shapeId, color: "#C4653A",
      zIndex: currentSlide.elements.length,
      shapeId, visible: true, locked: false,
      rotation: 0, opacity: 1, borderRadius: 0,
    };
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    updated[activeSlide].elements.push(newElement);
    updateSlides(updated);
    setActiveElement(newElement.id);
    setShowShapeMenu(false);
  };

  const addChartElement = (type: ChartType) => {
    const chartData = generateDefaultChartData(type);
    const newElement: SlideElement = {
      id: String(Date.now()), type: "shape",
      x: 100, y: 100, width: 350, height: 250,
      content: type, color: "transparent",
      zIndex: currentSlide.elements.length,
      chartType: type, chartData,
      visible: true, locked: false, rotation: 0, opacity: 1,
    };
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    updated[activeSlide].elements.push(newElement);
    updateSlides(updated);
    setActiveElement(newElement.id);
    setShowChartMenu(false);
  };

  const addIconElement = (icon: IconDef) => {
    const newElement: SlideElement = {
      id: String(Date.now()), type: "shape",
      x: 100, y: 100, width: 48, height: 48,
      content: icon.id, color: "#1C1917",
      zIndex: currentSlide.elements.length,
      iconId: icon.id,
      visible: true, locked: false, rotation: 0, opacity: 1,
    };
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    updated[activeSlide].elements.push(newElement);
    updateSlides(updated);
    setActiveElement(newElement.id);
    setShowIconMenu(false);
  };

  const addQRElement = async () => {
    if (!qrUrl) return;
    const qrData = await generateQR(qrUrl, Math.min(200, 200));
    const newElement: SlideElement = {
      id: String(Date.now()), type: "shape",
      x: 100, y: 100, width: 200, height: 200,
      content: "qr", color: "transparent",
      zIndex: currentSlide.elements.length,
      qrContent: qrUrl,
      qrData,
      visible: true, locked: false, rotation: 0, opacity: 1,
    };
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    updated[activeSlide].elements.push(newElement);
    updateSlides(updated);
    setActiveElement(newElement.id);
    setShowQRDialog(false);
    setQrUrl("");
  };

  const renderShapeSVG = (el: SlideElement) => {
    if (el.iconId) {
      const svgPath = getIconSVG(el.iconId);
      if (svgPath) {
        return `<svg width="${el.width}" height="${el.height}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="${svgPath}" fill="${el.color}"/></svg>`;
      }
    }
    if (el.chartType && el.chartData) {
      return renderChartSVG(el.chartData, el.chartType, el.width, el.height);
    }
    if (el.qrData) {
      return el.qrData;
    }
    if (el.qrContent) {
      return `<div style="width:${el.width}px;height:${el.height}px;display:flex;align-items:center;justify-content:center;background:#f0f0f0;color:#999;font-size:12px">QR Code</div>`;
    }
    const shape = getShapeById(el.content || el.shapeId || "rect");
    if (!shape) return "";
    const scaleX = el.width / 100;
    const scaleY = el.height / 100;
    return `<svg width="${el.width}" height="${el.height}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="scale(${scaleX}, ${scaleY})"><path d="${shape.path}" fill="${el.color}" /></g></svg>`;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvas === "true") {
      setActiveElement(null);
      setSelectedElements([]);
    }
    setContextMenu(null);
  };

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.canvas === "true") {
      e.preventDefault();
      setActiveElement(null);
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    if (el.locked) return;
    setActiveElement(el.id);
    setDragState({ elId: el.id, startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y });
  };

  const handleElementContextMenu = (e: React.MouseEvent, el: SlideElement) => {
    e.preventDefault();
    setActiveElement(el.id);
    setContextMenu({ x: e.clientX, y: e.clientY, elId: el.id });
  };

  useEffect(() => {
    if (!dragState) return;
    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
      const el = updated[activeSlide].elements.find((x) => x.id === dragState.elId);
      if (el) {
        let nx = Math.max(0, Math.min(720 - el.width, dragState.origX + dx));
        let ny = Math.max(0, Math.min(405 - el.height, dragState.origY + dy));

        if (snapEnabled) {
          const others = updated[activeSlide].elements.map(e => ({ id: e.id, x: e.x, y: e.y, width: e.width, height: e.height }));
          const result = findSnapGuides({ id: el.id, x: nx, y: ny, width: el.width, height: el.height }, others.filter(o => o.id !== el.id));
          setSnapGuides(result.guides);
          if (result.snapX !== undefined) nx = result.snapX;
          if (result.snapY !== undefined) ny = result.snapY;
        }

        el.x = nx; el.y = ny;
        setSlides(updated);
      }
    };
    const handleUp = () => { pushHistory(slides); setDragState(null); setSnapGuides([]); };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [dragState, slides, activeSlide, pushHistory, snapEnabled]);

  const handleResizeMouseDown = (e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    setResizeState({ elId: el.id, startX: e.clientX, startY: e.clientY, origW: el.width, origH: el.height, origX: el.x, origY: el.y });
  };

  useEffect(() => {
    if (!resizeState) return;
    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeState.startX;
      const dy = e.clientY - resizeState.startY;
      const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
      const el = updated[activeSlide].elements.find((x) => x.id === resizeState.elId);
      if (el) { el.width = Math.max(20, resizeState.origW + dx); el.height = Math.max(20, resizeState.origH + dy); setSlides(updated); }
    };
    const handleUp = () => { pushHistory(slides); setResizeState(null); };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [resizeState, slides, activeSlide, pushHistory]);

  const handleSlideDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("slideIndex", String(index));
    setSlideDragIndex(index);
  };

  const handleSlideDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setSlideDropIndex(index);
  };

  const handleSlideDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("slideIndex"));
    if (!isNaN(fromIndex)) reorderSlide(fromIndex, toIndex);
    setSlideDragIndex(null);
    setSlideDropIndex(null);
  };

  const generateShareLink = () => {
    setShareLink(`${window.location.origin}/present/view/${presentationId}`);
    setShowShare(true);
  };

  const handleAlign = (type: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    const targetIds = activeElement && !selectedElements.length ? [activeElement] : selectedElements;
    if (targetIds.length < 1) return;
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const elements = updated[activeSlide].elements.filter(el => targetIds.includes(el.id));
    const aligned = alignElements(elements.map(e => ({ id: e.id, x: e.x, y: e.y, width: e.width, height: e.height })), type, 720, 405);
    for (const a of aligned) {
      const el = updated[activeSlide].elements.find(e => e.id === a.id);
      if (el) { el.x = a.x; el.y = a.y; }
    }
    updateSlides(updated);
  };

  const handleDistribute = (type: "horizontal" | "vertical") => {
    const targetIds = activeElement && !selectedElements.length ? [activeElement] : selectedElements;
    if (targetIds.length < 3) return;
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const elements = updated[activeSlide].elements.filter(el => targetIds.includes(el.id));
    const distributed = distributeElements(elements.map(e => ({ id: e.id, x: e.x, y: e.y, width: e.width, height: e.height })), type);
    for (const d of distributed) {
      const el = updated[activeSlide].elements.find(e => e.id === d.id);
      if (el) { el.x = d.x; el.y = d.y; }
    }
    updateSlides(updated);
  };

  const setAnimation = (elId: string, anim: AnimationDef | null) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements.find(x => x.id === elId);
    if (el) { el.animation = anim || undefined; setSlides(updated); }
  };

  const toggleVisibility = (elId: string) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements.find(x => x.id === elId);
    if (el) { el.visible = !el.visible; setSlides(updated); }
  };

  const toggleLock = (elId: string) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements.find(x => x.id === elId);
    if (el) { el.locked = !el.locked; setSlides(updated); }
  };

  const reorderLayer = (fromIndex: number, toIndex: number) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements[fromIndex];
    if (!el) return;
    updated[activeSlide].elements.splice(fromIndex, 1);
    updated[activeSlide].elements.splice(toIndex, 0, el);
    updateSlides(updated);
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-charcoal"><Loader2 className="w-6 h-6 text-white/40 animate-spin" /></div>;
  }

  const activeEl = currentSlide.elements.find(e => e.id === activeElement);

  return (
    <div className="h-screen flex flex-col bg-charcoal overflow-hidden" onContextMenu={(e) => { if (contextMenu) { e.preventDefault(); setContextMenu(null); } }}>
      {/* Top bar */}
      <div className="h-12 bg-[#2A2523] border-b border-white/5 flex items-center px-4 shrink-0">
        <Link href="/dashboard/presentations" className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors mr-4">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-sienna rounded-md flex items-center justify-center text-[10px] font-bold text-white">P</div>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="text-sm text-white/80 font-medium bg-transparent border-none outline-none max-w-[200px]" />
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-2 text-white/40 hover:text-white/70 disabled:opacity-20 transition-all rounded-lg hover:bg-white/5"><Undo2 className="w-4 h-4" /></button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 text-white/40 hover:text-white/70 disabled:opacity-20 transition-all rounded-lg hover:bg-white/5"><Redo2 className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          {saving && <span className="text-[11px] text-white/30 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>}
          {!saving && lastSaved && <span className="text-[11px] text-white/30">Saved</span>}
          <button onClick={autoSave} className="p-2 text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5"><Save className="w-4 h-4" /></button>

          {/* Export dropdown */}
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="p-2 text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5" title="Export">
              <Download className="w-4 h-4" />
            </button>
            {showExportMenu && (
              <div className="absolute top-full right-0 mt-1 bg-[#2A2523] border border-white/10 rounded-lg p-1 shadow-xl z-50 w-40">
                <button onClick={() => { exportToPDF(title, slides); setShowExportMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all">Export as PDF</button>
                <button onClick={() => { exportToPPTX(title, slides); setShowExportMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all">Export as PPTX</button>
                <button onClick={() => { exportHTML(); setShowExportMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all">Export as HTML</button>
                <button onClick={() => { exportSlideAsPNG(canvasRef.current, title, activeSlide); setShowExportMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all">Export Slide PNG</button>
              </div>
            )}
          </div>

          <button onClick={saveVersion} className="p-2 text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5" title="Save Version"><History className="w-4 h-4" /></button>
          <button onClick={generateShareLink} className="p-2 text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5"><Share2 className="w-4 h-4" /></button>
          <button onClick={togglePublic} className={`p-2 rounded-lg transition-all ${isPublic ? "text-sienna bg-sienna/10" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
            <Globe className="w-4 h-4" />
          </button>
          <button onClick={() => setShowVersions(!showVersions)} className="p-2 text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5"><Settings className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <Link href={`/present/${presentationId}`}
            className="flex items-center gap-2 text-xs font-medium text-white bg-sienna px-4 py-1.5 rounded-lg hover:bg-sienna-dark transition-all duration-300">
            <Play className="w-3.5 h-3.5" /> Present
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Slide panel */}
        <div className="w-52 bg-[#231F1D] border-r border-white/5 flex flex-col shrink-0">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-medium text-white/40">Slides</span>
            <div className="relative">
              <button onClick={() => setShowLayoutMenu(!showLayoutMenu)} className="p-1 text-white/40 hover:text-white/70 hover:bg-white/5 rounded transition-all"><Plus className="w-4 h-4" /></button>
              {showLayoutMenu && (
                <div className="absolute top-full right-0 mt-1 bg-[#2A2523] border border-white/10 rounded-lg p-2 shadow-xl z-50 w-48">
                  {layoutPresets.map((l) => (
                    <button key={l.name} onClick={() => addSlide(l)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-white/60 hover:bg-white/5 rounded transition-all">
                      <div className="w-8 h-5 bg-white/10 rounded border border-white/5" />
                      {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {slides.map((slide, i) => (
              <div key={slide.id}
                draggable onDragStart={(e) => handleSlideDragStart(e, i)}
                onDragOver={(e) => handleSlideDragOver(e, i)} onDrop={(e) => handleSlideDrop(e, i)}
                onClick={() => setActiveSlide(i)}
                className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  activeSlide === i ? "border-sienna" : slideDragIndex === i ? "border-white/20 opacity-50" : slideDropIndex === i ? "border-sienna/50" : "border-transparent hover:border-white/10"
                }`}>
                <div className="aspect-video flex items-center justify-center text-[8px] text-white/30" style={{ background: slide.background }}>
                  {slide.elements.length === 0 ? <span>Empty</span> : (
                    <div className="w-full h-full p-2 flex flex-col justify-center">
                      {slide.elements.filter((e) => e.type === "text" && e.visible).slice(0, 2).map((el) => (
                        <div key={el.id} className="truncate text-charcoal" style={{ fontSize: "6px", color: el.color }}>{el.content}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="absolute top-1 left-1 bg-black/60 text-[9px] text-white/70 w-4 h-4 rounded flex items-center justify-center">{i + 1}</div>
                {slide.notes && <div className="absolute bottom-1 right-1"><StickyNote className="w-3 h-3 text-white/40" /></div>}
                <button onClick={(e) => { e.stopPropagation(); deleteSlide(i); }}
                  className="absolute top-1 right-1 p-0.5 bg-black/60 text-white/50 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="h-11 bg-[#231F1D] border-b border-white/5 flex items-center px-3 gap-0.5 shrink-0 overflow-x-auto">
            <button onClick={() => setActiveTool("select")} className={`p-1.5 rounded-lg transition-all shrink-0 ${activeTool === "select" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
              <MousePointer2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button onClick={() => { setActiveTool("text"); addElement("text"); }} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Text">
              <Type className="w-4 h-4" />
            </button>
            <div className="relative">
              <button onClick={() => setShowShapeMenu(!showShapeMenu)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Shapes">
                <Shapes className="w-4 h-4" />
              </button>
              {showShapeMenu && (
                <div className="absolute top-full left-0 mt-1 bg-[#2A2523] border border-white/10 rounded-lg p-2 shadow-xl z-50 w-64 max-h-72 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-1">
                    {shapes.map((s) => (
                      <button key={s.id} onClick={() => addShapeElement(s.id)}
                        className="p-2 rounded hover:bg-white/10 transition-all flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                          <path d={s.path} fill="#C4653A" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setShowChartMenu(!showChartMenu)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Charts">
                <ChartBar className="w-4 h-4" />
              </button>
              {showChartMenu && (
                <div className="absolute top-full left-0 mt-1 bg-[#2A2523] border border-white/10 rounded-lg p-2 shadow-xl z-50 w-32">
                  {(["bar", "line", "pie", "donut"] as ChartType[]).map((t) => (
                    <button key={t} onClick={() => addChartElement(t)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all capitalize">{t} Chart</button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setShowIconMenu(!showIconMenu)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Icons">
                <Sparkles className="w-4 h-4" />
              </button>
              {showIconMenu && (
                <div className="absolute top-full left-0 mt-1 bg-[#2A2523] border border-white/10 rounded-lg p-2 shadow-xl z-50 w-64 max-h-80 overflow-y-auto">
                  <input value={iconSearch} onChange={(e) => setIconSearch(e.target.value)} placeholder="Search icons..."
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/60 outline-none mb-2" />
                  <div className="grid grid-cols-6 gap-1">
                    {(iconSearch ? searchIcons(iconSearch) : iconLibrary.slice(0, 30)).map((icon) => (
                      <button key={icon.id} onClick={() => addIconElement(icon)}
                        className="p-1.5 rounded hover:bg-white/10 transition-all flex items-center justify-center" title={icon.name}>
                        <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                          <path d={icon.svg} fill="#C4653A" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button onClick={() => addElement("code")} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Code">
              <Code className="w-4 h-4" />
            </button>
            <button onClick={() => addElement("divider")} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Divider">
              <Minus className="w-4 h-4" />
            </button>
            <label className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${uploading ? "text-sienna animate-pulse" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`} title="Image">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
            <button onClick={() => { const url = prompt("Enter YouTube video URL:"); if (url) { addElement("youtube"); const updated = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = updated[activeSlide].elements[updated[activeSlide].elements.length - 1]; if (el) { el.content = url; updateSlides(updated); } } }} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="YouTube">
              <Play className="w-4 h-4" />
            </button>
            <button onClick={() => setShowQRDialog(true)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="QR Code">
              <QrCode className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <div className="relative">
              <button onClick={() => setShowBgMenu(!showBgMenu)} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 px-2 py-1.5 hover:bg-white/5 rounded-lg transition-all shrink-0">
                <Palette className="w-3.5 h-3.5" />
              </button>
              {showBgMenu && (
                <div className="absolute top-full left-0 mt-1 bg-[#2A2523] border border-white/10 rounded-lg p-2 shadow-xl z-10 w-48">
                  {colorPresets.map((c) => (
                    <button key={c} onClick={() => {
                      const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
                      updated[activeSlide].background = c;
                      updateSlides(updated);
                      setShowBgMenu(false);
                    }}
                      className="flex items-center gap-3 w-full px-2 py-1.5 text-xs text-white/60 hover:bg-white/5 rounded transition-all">
                      <div className="w-5 h-5 rounded border border-white/10" style={{ background: c }} /> {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setShowAlignTools(!showAlignTools)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Alignment">
                <AlignLeft className="w-4 h-4" />
              </button>
              {showAlignTools && (
                <div className="absolute top-full left-0 mt-1 bg-[#2A2523] border border-white/10 rounded-lg p-2 shadow-xl z-50 w-36">
                  <div className="grid grid-cols-3 gap-1 mb-1">
                    <button onClick={() => handleAlign("left")} className="p-1.5 text-white/50 hover:bg-white/10 rounded transition-all"><AlignLeft className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleAlign("center")} className="p-1.5 text-white/50 hover:bg-white/10 rounded transition-all"><AlignCenter className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleAlign("right")} className="p-1.5 text-white/50 hover:bg-white/10 rounded transition-all"><AlignRight className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mb-1">
                    <button onClick={() => handleAlign("top")} className="p-1.5 text-white/50 hover:bg-white/10 rounded transition-all"><AlignStartVertical className="w-3.5 h-3.5 rotate-0" /></button>
                    <button onClick={() => handleAlign("middle")} className="p-1.5 text-white/50 hover:bg-white/10 rounded transition-all"><AlignCenter className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleAlign("bottom")} className="p-1.5 text-white/50 hover:bg-white/10 rounded transition-all"><AlignEndVertical className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-1 border-t border-white/10">
                    <button onClick={() => handleDistribute("horizontal")} className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/50 hover:bg-white/10 rounded transition-all"><AlignJustify className="w-3 h-3" /> H</button>
                    <button onClick={() => handleDistribute("vertical")} className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/50 hover:bg-white/10 rounded transition-all"><LayoutGrid className="w-3 h-3" /> V</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setShowAnimations(!showAnimations)} className={`p-1.5 rounded-lg transition-all shrink-0 ${showAnimations ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`} title="Animations">
              <Play className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded-lg transition-all shrink-0 ${showGrid ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`} title="Grid">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setSnapEnabled(!snapEnabled)} className={`p-1.5 rounded-lg transition-all shrink-0 ${snapEnabled ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`} title="Snap">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 ml-auto">
              <button onClick={() => setZoom(Math.max(25, zoom - 10))} className="p-1 text-white/40 hover:text-white/70 rounded transition-all shrink-0"><Minus className="w-3 h-3" /></button>
              <span className="text-[11px] text-white/40 w-8 text-center">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1 text-white/40 hover:text-white/70 rounded transition-all shrink-0"><Plus className="w-3 h-3" /></button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center bg-[#1A1715] p-8 overflow-auto" onContextMenu={handleCanvasContextMenu}>
            <div ref={canvasRef} className="relative shadow-2xl shadow-black/30 rounded-sm transition-all" style={{ width: 720 * zoom / 100, height: 405 * zoom / 100, background: currentSlide.background }}
              onMouseDown={handleCanvasMouseDown} data-canvas="true">
              {showGrid && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              )}
              {snapGuides.map((guide, i) => (
                <div key={i} className={`absolute pointer-events-none ${guide.type === "vertical" ? "w-px h-full" : "w-full h-px"} bg-sienna z-50`}
                  style={guide.type === "vertical" ? { left: guide.position * zoom / 100, top: 0 } : { top: guide.position * zoom / 100, left: 0 }} />
              ))}
              {currentSlide.elements.filter(el => el.visible).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map((el) => (
                <div key={el.id} data-element="true"
                  onMouseDown={(e) => handleElementMouseDown(e, el)}
                  onContextMenu={(e) => handleElementContextMenu(e, el)}
                  className={`absolute select-none ${activeElement === el.id ? "ring-2 ring-sienna" : "hover:ring-1 hover:ring-white/20"} ${el.locked ? "cursor-not-allowed" : !dragState ? "cursor-move" : ""} ${el.animation ? "animate__animated" : ""}`}
                  style={{
                    left: el.x * zoom / 100, top: el.y * zoom / 100,
                    width: el.width * zoom / 100, height: el.height * zoom / 100,
                    zIndex: el.zIndex || 0, opacity: el.opacity,
                    transform: `rotate(${el.rotation || 0}deg)`,
                    animation: el.animation ? `${el.animation.type} ${el.animation.duration || 500}ms ${el.animation.delay || 0}ms both` : undefined,
                  }}>
                  {el.type === "text" ? (
                    <div contentEditable suppressContentEditableWarning className="w-full h-full outline-none break-words"
                      style={{ color: el.color, fontSize: el.fontSize, fontFamily: el.fontFamily || "var(--font-heading)", fontWeight: el.fontWeight, fontStyle: el.fontStyle, textDecoration: el.textDecoration, textAlign: el.textAlign }}
                      onBlur={(e) => { const updated = JSON.parse(JSON.stringify(slides)) as Slide[]; const elem = updated[activeSlide].elements.find((x) => x.id === el.id); if (elem) elem.content = e.currentTarget.textContent || ""; updateSlides(updated); }}>
                      {el.content}
                    </div>
                  ) : el.type === "code" ? (
                    <div contentEditable suppressContentEditableWarning className="w-full h-full bg-[#1E1E1E] rounded-lg p-3 overflow-auto font-mono text-xs text-green-400 border border-white/10 outline-none" style={{ whiteSpace: "pre-wrap" }}
                      onBlur={(e) => { const updated = JSON.parse(JSON.stringify(slides)) as Slide[]; const elem = updated[activeSlide].elements.find((x) => x.id === el.id); if (elem) elem.content = e.currentTarget.textContent || ""; updateSlides(updated); }}>
                      {el.content}
                    </div>
                  ) : el.type === "divider" ? (
                    <div className="w-full h-full" style={{ background: el.color, borderRadius: el.borderRadius || 0 }} />
                  ) : el.type === "image" ? (
                    <img src={el.content} alt="" className="w-full h-full object-cover rounded" style={{ borderRadius: el.borderRadius || 0 }} draggable={false} />
                  ) : el.type === "youtube" ? (
                    <iframe src={el.content.replace(/youtube\.com\/watch\?v=/, "youtube.com/embed/").replace(/youtu\.be\//, "youtube.com/embed/")} className="w-full h-full" allowFullScreen />
                  ) : el.type === "shape" ? (
                    <div className="w-full h-full flex items-center justify-center" style={{ borderRadius: el.borderRadius || 0 }}
                      dangerouslySetInnerHTML={{ __html: renderShapeSVG(el) }} />
                  ) : (
                    <div className="w-full h-full rounded" style={{ background: el.color, borderRadius: el.borderRadius || 0 }} />
                  )}
                  {activeElement === el.id && !el.locked && (
                    <div onMouseDown={(e) => handleResizeMouseDown(e, el)}
                      className="absolute bottom-0 right-0 w-3 h-3 bg-sienna rounded-full cursor-se-resize translate-x-1/2 translate-y-1/2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Animation panel (overlay/tray) */}
          {showAnimations && activeEl && (
            <div className="h-28 bg-[#231F1D] border-t border-white/5 flex flex-col shrink-0">
              <div className="px-4 py-1.5 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-medium text-white/40">Animation</span>
                <button onClick={() => { if (activeEl) setAnimation(activeEl.id, null); }} className="text-[10px] text-white/30 hover:text-red-400 transition-colors">Remove</button>
              </div>
              <div className="flex-1 flex items-center gap-3 px-4 overflow-x-auto">
                {animationNames.map((a) => (
                  <button key={a.value} onClick={() => setAnimation(activeEl.id, { type: a.value, duration: 500, delay: 0, easing: "ease-out" })}
                    className={`text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      activeEl.animation?.type === a.value ? "bg-sienna text-white" : "text-white/50 hover:bg-white/5 hover:text-white/70"
                    }`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Speaker notes panel */}
          {showNotes && (
            <div className="h-28 bg-[#231F1D] border-t border-white/5 flex flex-col shrink-0">
              <div className="px-4 py-1.5 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-medium text-white/40">Speaker Notes</span>
                <span className="text-[10px] text-white/20">Not visible to students</span>
              </div>
              <textarea value={currentSlide.notes || ""} placeholder="Add notes for this slide..."
                onChange={(e) => { const updated = JSON.parse(JSON.stringify(slides)) as Slide[]; updated[activeSlide].notes = e.target.value; setSlides(updated); }}
                className="flex-1 bg-transparent text-sm text-white/60 p-3 resize-none outline-none placeholder:text-white/20" />
            </div>
          )}

          <div className="h-8 bg-[#231F1D] border-t border-white/5 flex items-center justify-between px-4 shrink-0">
            <span className="text-[11px] text-white/25">Slide {activeSlide + 1} of {slides.length}</span>
            <div className="flex items-center gap-3 text-[11px] text-white/25">
              <span>Ctrl+Z Undo</span>
              <span>Del Delete</span>
              <span>Arrows Nudge</span>
              <span>720 x 405</span>
            </div>
          </div>
        </div>

        {/* Properties panel */}
        <div className="w-64 bg-[#231F1D] border-l border-white/5 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-medium text-white/40">{activeElement ? "Properties" : "Slide"}</span>
            <button onClick={() => setShowNotes(!showNotes)} className={`p-1 rounded ${showNotes ? "text-sienna" : "text-white/30 hover:text-white/60"}`}><StickyNote className="w-3.5 h-3.5" /></button>
          </div>
          {activeElement && activeEl ? (
            <div className="flex-1 space-y-4 p-4">
              {/* Element type label */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-white/30 bg-white/5 px-2 py-0.5 rounded">{activeEl.type}</span>
                <button onClick={() => { toggleVisibility(activeEl.id); }} className={`p-0.5 rounded ${activeEl.visible ? "text-white/50" : "text-white/20"}`}>
                  {activeEl.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button onClick={() => { toggleLock(activeEl.id); }} className={`p-0.5 rounded ${activeEl.locked ? "text-sienna" : "text-white/50"}`}>
                  {activeEl.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </button>
              </div>

              {/* Rich text toolbar for text elements */}
              {activeEl.type === "text" && (
                <RichTextToolbar
                  onBold={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.fontWeight = e.fontWeight === "bold" ? "normal" : "bold"; setSlides(u); } }}
                  onItalic={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.fontStyle = e.fontStyle === "italic" ? "normal" : "italic"; setSlides(u); } }}
                  onUnderline={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.textDecoration = e.textDecoration === "underline" ? undefined : "underline"; setSlides(u); } }}
                  onAlign={(a) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.textAlign = a; setSlides(u); } }}
                  onBulletList={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.content = "• " + e.content.split("\n").join("\n• "); setSlides(u); } }}
                  onNumberedList={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { const lines = e.content.split("\n"); e.content = lines.map((l, i) => `${i + 1}. ${l}`).join("\n"); setSlides(u); } }}
                  onFontSize={(d) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.fontSize = Math.max(8, Math.min(120, (e.fontSize || 18) + d)); setSlides(u); } }}
                  onFontFamily={(f) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.fontFamily = f; setSlides(u); } }}
                  fontSize={activeEl.fontSize}
                  fontFamily={activeEl.fontFamily}
                />
              )}

              {/* Color */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Color</label>
                <ColorPicker value={activeEl.color || "#1C1917"} onChange={(c) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.color = c; setSlides(u); } }} />
              </div>

              {/* Opacity & Rotation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Opacity</label>
                  <input type="range" min="0" max="100" value={Math.round((activeEl.opacity || 1) * 100)}
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.opacity = parseInt(e.target.value) / 100; setSlides(u); } }}
                    className="w-full accent-sienna" />
                  <span className="text-[10px] text-white/30">{Math.round((activeEl.opacity || 1) * 100)}%</span>
                </div>
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Rotation</label>
                  <input type="range" min="-180" max="180" value={activeEl.rotation || 0}
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.rotation = parseInt(e.target.value); setSlides(u); } }}
                    className="w-full accent-sienna" />
                  <span className="text-[10px] text-white/30">{activeEl.rotation || 0}°</span>
                </div>
              </div>

              {/* Font Size (for text) */}
              {activeEl.type === "text" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Font Size</label>
                  <input type="range" min="8" max="120" value={activeEl.fontSize || 18}
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.fontSize = parseInt(e.target.value); setSlides(u); } }}
                    className="w-full accent-sienna" />
                  <span className="text-[10px] text-white/30">{activeEl.fontSize || 18}px</span>
                </div>
              )}

              {/* Position */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-[10px] text-white/20">X</span><input type="number" value={Math.round(activeEl.x)}
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.x = parseInt(e.target.value) || 0; setSlides(u); } }}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/60 outline-none" /></div>
                  <div><span className="text-[10px] text-white/20">Y</span><input type="number" value={Math.round(activeEl.y)}
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.y = parseInt(e.target.value) || 0; setSlides(u); } }}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/60 outline-none" /></div>
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-[10px] text-white/20">W</span><input type="number" value={Math.round(activeEl.width)}
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.width = parseInt(e.target.value) || 0; setSlides(u); } }}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/60 outline-none" /></div>
                  <div><span className="text-[10px] text-white/20">H</span><input type="number" value={Math.round(activeEl.height)}
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.height = parseInt(e.target.value) || 0; setSlides(u); } }}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/60 outline-none" /></div>
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Border Radius</label>
                <input type="range" min="0" max="50" value={activeEl.borderRadius || 0}
                  onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.borderRadius = parseInt(e.target.value); setSlides(u); } }}
                  className="w-full accent-sienna" />
              </div>

              {/* Z-Index */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Layer</label>
                <div className="flex gap-1">
                  <button onClick={bringToFront} className="flex-1 flex items-center justify-center gap-1 text-[11px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 rounded-lg py-1.5 transition-all"><ArrowUp className="w-3 h-3" /> Front</button>
                  <button onClick={sendToBack} className="flex-1 flex items-center justify-center gap-1 text-[11px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 rounded-lg py-1.5 transition-all"><ArrowDown className="w-3 h-3" /> Back</button>
                  <button onClick={duplicateElement} className="flex-1 flex items-center justify-center gap-1 text-[11px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 rounded-lg py-1.5 transition-all"><Copy className="w-3 h-3" /> Clone</button>
                </div>
              </div>

              <button onClick={() => deleteElement(activeElement)}
                className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-400/5">
                <Trash2 className="w-3.5 h-3.5" /> Delete Element
              </button>
            </div>
          ) : (
            <div className="flex-1 space-y-4 p-4">
              {/* Layers panel */}
              <div>
                <label className="text-[10px] text-white/30 mb-1.5 block uppercase tracking-wider">Layers ({currentSlide.elements.filter(e => e.visible).length})</label>
                <LayersPanel
                  layers={currentSlide.elements.map((el) => ({
                    id: el.id, type: el.type, label: el.content || el.type,
                    visible: el.visible, locked: el.locked, zIndex: el.zIndex || 0,
                  }))}
                  activeId={activeElement}
                  onSelect={(id) => setActiveElement(id)}
                  onToggleVisibility={toggleVisibility}
                  onToggleLock={toggleLock}
                  onDelete={(id) => deleteElement(id)}
                  onReorder={reorderLayer}
                />
              </div>

              {/* Background */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Background</label>
                <ColorPicker value={currentSlide.background} onChange={(c) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; u[activeSlide].background = c; updateSlides(u); }} />
              </div>

              {/* Slide Transition */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Transition</label>
                <select value={currentSlide.transition || "none"}
                  onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; u[activeSlide].transition = e.target.value as Slide["transition"]; setSlides(u); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none">
                  <option value="none">None</option>
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ElementContextMenu
          x={contextMenu.x} y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCopy={() => {
            const el = currentSlide.elements.find(e => e.id === contextMenu.elId);
            if (el) {
              navigator.clipboard.writeText(el.content || "").catch(() => {});
            }
            duplicateElement();
          }}
          onDelete={() => deleteElement(contextMenu.elId)}
          onBringFront={bringToFront}
          onSendBack={sendToBack}
          onDuplicate={duplicateElement}
        />
      )}

      {/* QR Dialog */}
      {showQRDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowQRDialog(false)}>
          <div className="bg-[#2A2523] rounded-xl p-6 w-96 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-white mb-4">Generate QR Code</h3>
            <label className="text-[11px] text-white/30 mb-1.5 block uppercase tracking-wider">URL or Text</label>
            <input value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none mb-3" />
            <button onClick={addQRElement} disabled={!qrUrl}
              className="w-full bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all disabled:opacity-50">Add QR Code</button>
          </div>
        </div>
      )}

      {/* Share modal */}
      {showShare && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowShare(false)}>
          <div className="bg-[#2A2523] rounded-xl p-6 w-96 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-white mb-4">Share Presentation</h3>
            <label className="text-[11px] text-white/30 mb-1.5 block uppercase tracking-wider">View Link</label>
            <div className="flex gap-2">
              <input value={shareLink} readOnly className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none" />
              <button onClick={() => { navigator.clipboard.writeText(shareLink); }}
                className="bg-sienna text-white text-xs px-4 py-2 rounded-lg hover:bg-sienna-dark transition-all">Copy</button>
            </div>
            <button onClick={() => setShowShare(false)} className="w-full mt-4 text-xs text-white/40 hover:text-white/60 transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
          <div className="bg-[#2A2523] rounded-xl p-6 w-96 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-white mb-4">Presentation Settings</h3>
            <label className="text-[11px] text-white/30 mb-1.5 block uppercase tracking-wider">Default Transition</label>
            <select value={presentationTransition} onChange={(e) => setPresentationTransition(e.target.value as typeof presentationTransition)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none mb-4">
              <option value="none">None</option>
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="zoom">Zoom</option>
            </select>
            <button onClick={() => setShowSettings(false)} className="w-full bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all">Done</button>
          </div>
        </div>
      )}

      {/* Version History modal */}
      {showVersions && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowVersions(false)}>
          <div className="bg-[#2A2523] rounded-xl p-6 w-96 border border-white/10 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-white mb-4">Version History</h3>
            {versionHistory.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-6">No saved versions yet.</p>
            ) : (
              <div className="space-y-2">
                {versionHistory.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <div className="text-xs text-white/70">{v.title}</div>
                      <div className="text-[10px] text-white/30">{new Date(v.saved_at).toLocaleString()} — {v.slides.length} slides</div>
                    </div>
                    <button onClick={() => restoreVersion(i)} className="text-[11px] text-sienna hover:text-sienna/80 transition-colors">Restore</button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowVersions(false)} className="w-full mt-4 text-xs text-white/40 hover:text-white/60 transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
