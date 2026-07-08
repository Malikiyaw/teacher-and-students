"use client";

import { useState, useRef, use, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, Type, Image, Palette,
  Undo2, Redo2, Play, Share2, Save, ArrowLeft, MousePointer2,
  Loader2, Copy, ArrowUp, ArrowDown, StickyNote, Settings,
  Code, Minus, Download, Globe, History, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, AlignStartVertical, AlignEndVertical,
  LayoutGrid, Lock, Unlock, Eye, EyeOff, GripVertical, Sparkles,
  ChartBar, QrCode, Shapes, Expand, Presentation,
  Video, Music, Film, Upload, LayoutTemplate, Wand2, Layout, List,
  FileUp, FileDown, FileVideo, FileImage, FileText,
  Sigma, Workflow, CheckCheck, AlertTriangle, Puzzle, Command, Keyboard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { presentationToHTML, downloadHTML } from "@/lib/export";
import ColorPicker from "@/components/color-picker";
import RichTextToolbar from "@/components/rich-text-toolbar";
import LayersPanel from "@/components/layers-panel";
import ElementContextMenu from "@/components/element-context-menu";
import { shapes, getShapeById } from "@/lib/editor/shapes";
import { alignElements, alignElementsToSlide, distributeElements, findSnapGuides } from "@/lib/editor/align";
import { generateDefaultChartData, renderChartSVG, type ChartType, type ChartData } from "@/lib/editor/charts";
import { iconLibrary, searchIcons, getIconSVG, type IconDef } from "@/lib/editor/icons";
import { generateQR } from "@/lib/editor/qr";
import { getAnimationCSS, getAllAnimationCSS, animationNames, easingOptions, directionOptions, fillModeOptions, type AnimationType, type AnimationDef } from "@/lib/editor/animate";
import { sequencifyAnimations, getTimelineCSS, getTotalDuration } from "@/lib/editor/animation-timeline";
import { generateMotionPath, getMotionPathCSS, MotionPathEditor, type MotionPath } from "@/lib/editor/motion-paths";
import { exportToPDF, exportToPPTX, exportSlideAsPNG } from "@/lib/editor/export-slides";
import { parsePPTXFile } from "@/lib/editor/import-pptx";
import { parseMarkdown } from "@/lib/editor/import-markdown";
import { parseSVGFile } from "@/lib/editor/import-svg";
import { exportAsVideoHTML, openVideoPlayer } from "@/lib/editor/export-video";
import { exportAsGIF } from "@/lib/editor/export-gif";
import { importFromGoogleSlides } from "@/lib/editor/import-google-slides";
import { exportToMarkdown, downloadMarkdown, copyMarkdownToClipboard } from "@/lib/editor/export-markdown";
import { searchUnsplash } from "@/lib/editor/unsplash";
import { generateSlidesFromPrompt, generateSlideContent } from "@/lib/editor/ai-slides";
import { generateImage, getStyleOptions } from "@/lib/editor/ai-images";
import { autoArrangeElements, autoSizeText, suggestLayout } from "@/lib/editor/smart-layout";
import { BackgroundRemoverModal } from "@/lib/editor/background-remover";
import { createCustomShow, saveCustomShow, loadCustomShows, type CustomSlideShow } from "@/lib/editor/custom-slide-show";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import LatexEditorModal, { renderLatexToSVG, preloadKaTeX } from "@/lib/editor/latex";
import MermaidEditorModal, { MermaidPreview } from "@/lib/editor/mermaid";
import { SpellCheckPanel, checkSpelling, checkGrammar } from "@/lib/editor/spell-check";
import { AccessibilityPanel, checkAccessibility, getContrastRatio, meetsWCAGAA, type A11yIssue } from "@/lib/editor/accessibility-checker";
import { CommandPalette, buildCommandList } from "@/lib/editor/command-palette";
import { themePresets as customThemePresets, applyThemeToSlides, CustomThemeEditor, type CustomTheme, loadCustomThemes, saveCustomThemes } from "@/lib/editor/custom-themes";
import { loadShortcuts, saveShortcuts, ShortcutCustomizer } from "@/lib/editor/shortcuts";
import { pluginRegistry, defaultPlugins, PluginManager, usePluginWordCount, usePluginSlideTimes } from "@/lib/editor/plugin-system";

interface SlideElement {
  id: string;
  type: "text" | "image" | "shape" | "code" | "divider" | "youtube" | "line" | "table" | "video" | "audio" | "gif" | "latex" | "mermaid";
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
  alt?: string;
  qrContent?: string;
  qrData?: string;
  fontFamily?: string;
  textDecoration?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  animation?: AnimationDef;
  animations?: AnimationDef[];
  strokeColor?: string;
  strokeWidth?: number;
  strokeDash?: string;
  shadow?: string;
  codeLanguage?: string;
  flipH?: boolean;
  flipV?: boolean;
  gradient?: string;
  crop?: { x: number; y: number; width: number; height: number };
  highlight?: string;
  groupId?: string;
  lineEndX?: number;
  lineEndY?: number;
  arrowStart?: string;
  arrowEnd?: string;
  tableRows?: number;
  tableCols?: number;
  tableData?: string[][];
  filter?: string;
  shapeText?: string;
  letterSpacing?: number;
  lineHeight?: number;
  href?: string;
  lockAspectRatio?: boolean;
  connectorStartId?: string;
  connectorEndId?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  tableHeaderBg?: string;
  tableRowAlt?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  speed?: number;
  svgContent?: string;
  maintainAspectRatio?: boolean;
  colorOverride?: string;
  collageTemplate?: string;
}

interface Slide {
  id: string;
  elements: SlideElement[];
  background: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  showSlideNumber?: boolean;
  section?: string;
  notes?: string;
  transition?: "none" | "fade" | "slide" | "zoom" | "morph";
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

function parseYouTubeUrl(url: string): string {
  if (url.includes("youtube.com/embed/")) return url;
  if (url.includes("youtube.com/shorts/")) return url.replace("youtube.com/shorts/", "youtube.com/embed/");
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  const directMatch = url.match(/^([a-zA-Z0-9_-]{11})$/);
  if (directMatch) return `https://www.youtube.com/embed/${directMatch[1]}`;
  return url;
}

const layoutPresets = [
  { name: "Blank", elements: [] },
  { name: "Title", elements: [{ type: "text" as const, x: 60, y: 140, width: 600, height: 60, content: "Presentation Title", color: "#1C1917", fontSize: 42, fontWeight: "bold" }, { type: "text" as const, x: 60, y: 220, width: 400, height: 30, content: "Subtitle goes here", color: "#6B6560", fontSize: 18 }] },
  { name: "Title + Content", elements: [{ type: "text" as const, x: 60, y: 40, width: 600, height: 50, content: "Slide Title", color: "#1C1917", fontSize: 32, fontWeight: "bold" }, { type: "divider" as const, x: 60, y: 100, width: 100, height: 3, content: "", color: "#C4653A" }, { type: "text" as const, x: 60, y: 130, width: 600, height: 250, content: "Add your content here.", color: "#3D3632", fontSize: 16 }] },
  { name: "Two Column", elements: [{ type: "text" as const, x: 60, y: 40, width: 600, height: 50, content: "Two Column Layout", color: "#1C1917", fontSize: 32, fontWeight: "bold" }, { type: "shape" as const, x: 60, y: 120, width: 290, height: 250, content: "", color: "#F0EDE8", borderRadius: 8 }, { type: "shape" as const, x: 370, y: 120, width: 290, height: 250, content: "", color: "#F0EDE8", borderRadius: 8 }, { type: "text" as const, x: 75, y: 180, width: 260, height: 120, content: "Left column content", color: "#3D3632", fontSize: 14 }, { type: "text" as const, x: 385, y: 180, width: 260, height: 120, content: "Right column content", color: "#3D3632", fontSize: 14 }] },
  { name: "Image + Text", elements: [{ type: "shape" as const, x: 40, y: 40, width: 300, height: 325, content: "", color: "#F0EDE8", borderRadius: 12 }, { type: "text" as const, x: 370, y: 60, width: 310, height: 50, content: "Image with Text", color: "#1C1917", fontSize: 28, fontWeight: "bold" }, { type: "text" as const, x: 370, y: 130, width: 310, height: 200, content: "Describe your image here.", color: "#3D3632", fontSize: 15 }] },
  { name: "Quote", elements: [{ type: "text" as const, x: 100, y: 120, width: 520, height: 20, content: "\u201C", color: "#C4653A", fontSize: 80, fontWeight: "bold" }, { type: "text" as const, x: 100, y: 170, width: 520, height: 100, content: "The only way to do great work is to love what you do.", color: "#1C1917", fontSize: 24, fontStyle: "italic" }, { type: "text" as const, x: 100, y: 290, width: 300, height: 30, content: "\u2014 Steve Jobs", color: "#6B6560", fontSize: 14 }] },
  { name: "Stats", elements: [{ type: "text" as const, x: 60, y: 40, width: 600, height: 50, content: "Key Statistics", color: "#1C1917", fontSize: 32, fontWeight: "bold" }, { type: "shape" as const, x: 60, y: 120, width: 180, height: 120, content: "", color: "#C4653A", borderRadius: 12 }, { type: "shape" as const, x: 270, y: 120, width: 180, height: 120, content: "", color: "#1C1917", borderRadius: 12 }, { type: "shape" as const, x: 480, y: 120, width: 180, height: 120, content: "", color: "#16A34A", borderRadius: 12 }, { type: "text" as const, x: 60, y: 145, width: 180, height: 40, content: "85%", color: "#FFFFFF", fontSize: 32, fontWeight: "bold" }, { type: "text" as const, x: 270, y: 145, width: 180, height: 40, content: "12K", color: "#FFFFFF", fontSize: 32, fontWeight: "bold" }, { type: "text" as const, x: 480, y: 145, width: 180, height: 40, content: "98%", color: "#FFFFFF", fontSize: 32, fontWeight: "bold" }, { type: "text" as const, x: 60, y: 190, width: 180, height: 30, content: "Pass Rate", color: "#FFFFFF", fontSize: 12 }, { type: "text" as const, x: 270, y: 190, width: 180, height: 30, content: "Students", color: "#FFFFFF", fontSize: 12 }, { type: "text" as const, x: 480, y: 190, width: 180, height: 30, content: "Satisfaction", color: "#FFFFFF", fontSize: 12 }] },
];

const themePresets = [
  { name: "Light", bg: "#FFFFFF", accent: "#C4653A", font: "var(--font-heading)" },
  { name: "Dark", bg: "#1C1917", accent: "#E8A87C", font: "var(--font-heading)" },
  { name: "Modern", bg: "#F8F9FA", accent: "#4361EE", font: "Inter, sans-serif" },
  { name: "Sunset", bg: "#FFF5E6", accent: "#E76F51", font: "Georgia, serif" },
  { name: "Ocean", bg: "#E8F4F8", accent: "#0077B6", font: "Inter, sans-serif" },
  { name: "Forest", bg: "#F0F7F0", accent: "#2D6A4F", font: "Georgia, serif" },
  { name: "Midnight", bg: "#1A1A2E", accent: "#E94560", font: "Inter, sans-serif" },
  { name: "Nature", bg: "#FAF3E0", accent: "#8B5CF6", font: "Georgia, serif" },
];

const applyTheme = (theme: typeof themePresets[0], slidesParam: Slide[]): Slide[] => {
  return slidesParam.map(s => ({
    ...s,
    background: theme.bg,
    elements: s.elements.map(el => ({
      ...el,
      fontFamily: (el.type === "text") ? theme.font : el.fontFamily,
      color: el.color === "#1C1917" || el.color === "#FFFFFF" ? (theme.bg === "#FFFFFF" || theme.bg === "#F8F9FA" || theme.bg === "#FFF5E6" || theme.bg === "#E8F4F8" || theme.bg === "#F0F7F0" || theme.bg === "#FAF3E0" ? "#1C1917" : "#FFFFFF") : el.color,
    })),
  }));
};

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
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showAlignTools, setShowAlignTools] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [title, setTitle] = useState("Untitled Presentation");
  const [presentationId, setPresentationId] = useState(id);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(id !== "new");
  const [uploading, setUploading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [presentationTransition, setPresentationTransition] = useState<"none" | "fade" | "slide" | "zoom" | "morph">("none");
  const [shareLink, setShareLink] = useState("");
  const [dragState, setDragState] = useState<{ elId: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [resizeState, setResizeState] = useState<{ elId: string; startX: number; startY: number; origW: number; origH: number; origX: number; origY: number; direction: string; lockAspect?: boolean } | null>(null);
  const [slideDragIndex, setSlideDragIndex] = useState<number | null>(null);
  const [slideDropIndex, setSlideDropIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapGuides, setSnapGuides] = useState<{ type: "vertical" | "horizontal"; position: number }[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elId: string } | null>(null);
  const [selectionRect, setSelectionRect] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animStyleRef = useRef<HTMLStyleElement | null>(null);
  const previewStyleRef = useRef<HTMLStyleElement | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [showMotionPath, setShowMotionPath] = useState(false);
  const [showSpellCheck, setShowSpellCheck] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [a11yIssues, setA11yIssues] = useState<A11yIssue[]>([]);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyIndexRef = useRef(-1);
  const activeSlideRef = useRef(activeSlide);
  useEffect(() => { activeSlideRef.current = activeSlide; }, [activeSlide]);
  useEffect(() => { historyIndexRef.current = historyIndex; }, [historyIndex]);
  const [versionHistory, setVersionHistory] = useState<{ slides: Slide[]; title: string; saved_at: string }[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showCustomThemeEditor, setShowCustomThemeEditor] = useState(false);
  const [showShortcutCustomizer, setShowShortcutCustomizer] = useState(false);
  const [showPluginManager, setShowPluginManager] = useState(false);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [slideClipboard, setSlideClipboard] = useState<SlideElement[] | null>(null);
  const [selectedSlides, setSelectedSlides] = useState<Set<number>>(new Set());
  const [showBrandKit, setShowBrandKit] = useState(false);
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [showStockImages, setShowStockImages] = useState(false);
  const [stockImageQuery, setStockImageQuery] = useState("");
  const [stockImageResults, setStockImageResults] = useState<any[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [showChartEditor, setShowChartEditor] = useState(false);
  const [chartEditorData, setChartEditorData] = useState<{ labels: string[]; values: number[]; colors: string[] } | null>(null);
  const [connectorMode, setConnectorMode] = useState(false);
  const [connectorSource, setConnectorSource] = useState<string | null>(null);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [showGIFDialog, setShowGIFDialog] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showCollageDialog, setShowCollageDialog] = useState(false);
  const [showLatexEditor, setShowLatexEditor] = useState(false);
  const [showMermaidEditor, setShowMermaidEditor] = useState(false);
  const [editingLatexId, setEditingLatexId] = useState<string | null>(null);
  const [editingMermaidId, setEditingMermaidId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [showCustomShow, setShowCustomShow] = useState(false);
  const [customShows, setCustomShows] = useState<CustomSlideShow[]>([]);
  const [customShowName, setCustomShowName] = useState("");
  const [selectedCustomIndices, setSelectedCustomIndices] = useState<Set<number>>(new Set());
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [showAIImage, setShowAIImage] = useState(false);
  const [showBackgroundRemover, setShowBackgroundRemover] = useState(false);
  const [aiGenerateTopic, setAiGenerateTopic] = useState("");
  const [aiGenerateCount, setAiGenerateCount] = useState(5);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedSlides, setAiGeneratedSlides] = useState<any[]>([]);
  const [aiImagePrompt, setAiImagePrompt] = useState("");
  const [aiImageStyle, setAiImageStyle] = useState("photorealistic");
  const [aiImageGenerating, setAiImageGenerating] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState("");

  const currentSlide = slides[activeSlide];

  useEffect(() => {
    if (showAccessibility && currentSlide) {
      const issues = checkAccessibility(currentSlide as any, (elId, changes) => {
        setSlides(prev => {
          const next = JSON.parse(JSON.stringify(prev)) as Slide[];
          const el = next[activeSlide].elements.find((x: SlideElement) => x.id === elId);
          if (el) Object.assign(el, changes);
          return next;
        });
      });
      setA11yIssues(issues);
    }
  }, [showAccessibility, currentSlide, activeSlide]);

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
    strokeColor: el.strokeColor ?? undefined,
    strokeWidth: el.strokeWidth ?? undefined,
    strokeDash: el.strokeDash ?? undefined,
    shadow: el.shadow ?? undefined,
    flipH: el.flipH ?? undefined,
    flipV: el.flipV ?? undefined,
    gradient: el.gradient ?? undefined,
    highlight: el.highlight ?? undefined,
    filter: el.filter ?? undefined,
    shapeText: el.shapeText ?? undefined,
    letterSpacing: el.letterSpacing ?? undefined,
    lineHeight: el.lineHeight ?? undefined,
    href: el.href ?? undefined,
    lockAspectRatio: el.lockAspectRatio ?? undefined,
    connectorStartId: el.connectorStartId ?? undefined,
    connectorEndId: el.connectorEndId ?? undefined,
    brightness: el.brightness ?? undefined,
    contrast: el.contrast ?? undefined,
    saturation: el.saturation ?? undefined,
    tableHeaderBg: el.tableHeaderBg ?? undefined,
    tableRowAlt: el.tableRowAlt ?? undefined,
    autoPlay: el.autoPlay ?? undefined,
    loop: el.loop ?? undefined,
    muted: el.muted ?? undefined,
    controls: el.controls ?? undefined,
    speed: el.speed ?? undefined,
    svgContent: el.svgContent ?? undefined,
    maintainAspectRatio: el.maintainAspectRatio ?? undefined,
    colorOverride: el.colorOverride ?? undefined,
    collageTemplate: el.collageTemplate ?? undefined,
  });

  const pushHistory = useCallback((newSlides: Slide[], newActiveSlide?: number) => {
    setHistory((prev) => {
      const idx = historyIndexRef.current;
      const newEntry = { slides: JSON.parse(JSON.stringify(newSlides)), activeSlide: newActiveSlide ?? activeSlideRef.current };
      const truncated = prev.slice(0, idx + 1);
      return [...truncated, newEntry].slice(-50);
    });
    setHistoryIndex((prev) => { const next = Math.min(prev + 1, 49); historyIndexRef.current = next; return next; });
  }, []);

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
    const shortcuts = loadShortcuts();
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key;

      const matches = (action: string) => {
        const s = shortcuts[action];
        if (!s) return false;
        const parts = s.split("+");
        const hasCtrl = parts.includes("Ctrl");
        const hasShift = parts.includes("Shift");
        const hasAlt = parts.includes("Alt");
        const lastKey = parts[parts.length - 1];
        if (mod !== hasCtrl) return false;
        if (shift !== hasShift) return false;
        if ((e.altKey) !== hasAlt) return false;
        const keyMatch = key.toLowerCase() === lastKey.toLowerCase() ||
          (key === " " && lastKey === "Space") ||
          (key === "Delete" && lastKey === "Delete") ||
          (key === "Backspace" && lastKey === "Delete") ||
          (key === "?" && lastKey === "?") ||
          (key === "=" && lastKey === "=") ||
          (key === "-" && lastKey === "-") ||
          (key === "0" && lastKey === "0");
        return keyMatch;
      };

      if (matches("commandPalette")) { e.preventDefault(); setShowCommandPalette(c => !c); return; }
      if (matches("undo")) { e.preventDefault(); undo(); return; }
      if (matches("redo")) { e.preventDefault(); redo(); return; }
      if (matches("duplicate") && activeElement) { e.preventDefault(); duplicateElement(); return; }
      if (matches("selectAll") && (e.target as HTMLElement)?.tagName !== "INPUT" && (e.target as HTMLElement)?.tagName !== "TEXTAREA") {
        e.preventDefault();
        const all = currentSlide.elements.map(el => el.id);
        setSelectedElements(all);
        return;
      }
      if (matches("save")) { e.preventDefault(); autoSave(); return; }
      if (matches("showHelp")) { e.preventDefault(); setShowHelp(h => !h); return; }
      if (matches("present")) { e.preventDefault(); window.open(`/present/${presentationId}`, "_blank"); return; }
      if (key === "Delete" || key === "Backspace") {
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.contentEditable === "true")) {
          if (selectedElements.length > 0) {
            selectedElements.forEach(id => { if (id) deleteElement(id); });
          } else if (activeElement) {
            deleteElement(activeElement);
          }
        }
      }
      if (key === "ArrowUp" && activeElement) { e.preventDefault(); nudgeElement(0, -5); }
      if (key === "ArrowDown" && activeElement) { e.preventDefault(); nudgeElement(0, 5); }
      if (key === "ArrowLeft" && activeElement) { e.preventDefault(); nudgeElement(-5, 0); }
      if (key === "ArrowRight" && activeElement) { e.preventDefault(); nudgeElement(5, 0); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeElement, slides, activeSlide, undo, redo, currentSlide.elements, autoSave, presentationId]);

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

  useEffect(() => {
    preloadKaTeX();
    if (!animStyleRef.current) {
      const style = document.createElement("style");
      style.textContent = getAllAnimationCSS();
      document.head.appendChild(style);
      animStyleRef.current = style;
    }
  }, []);

  // Load custom themes
  useEffect(() => {
    setCustomThemes(loadCustomThemes());
  }, []);

  // Register default plugins on mount
  useEffect(() => {
    defaultPlugins.forEach((p) => pluginRegistry.register(p));
    pluginRegistry.executeInit();
    return () => {
      defaultPlugins.forEach((p) => pluginRegistry.unregister(p.id));
    };
  }, []);

  // Execute plugin hooks
  useEffect(() => {
    pluginRegistry.executeSlideChange(activeSlide);
  }, [activeSlide]);

  useEffect(() => {
    pluginRegistry.executeElementSelect(activeEl || null);
  }, [activeElement]);

  const wordCount = usePluginWordCount(slides);
  const slideTimes = usePluginSlideTimes();

  const exportHTML = () => {
    const html = presentationToHTML(slides, title);
    downloadHTML(html, `${title.replace(/[^a-z0-9]/gi, "_")}.html`);
  };

  const importPPTX = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pptx";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const imported = await parsePPTXFile(file);
        const converted = imported.map((s: any) => ({
          ...s,
          elements: s.elements.map((el: any) => ({ ...el, visible: true, locked: false, rotation: 0, opacity: 1 })),
        }));
        if (converted.length > 0) {
          const merged = [...slides, ...converted];
          updateSlides(merged);
        }
      } catch (err: any) {
        alert("PPTX import failed: " + (err.message || "Unknown error"));
      }
    };
    input.click();
  };

  const importMarkdownFile = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.markdown";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = parseMarkdown(text);
        const converted = imported.map((s: any) => ({
          ...s,
          elements: s.elements.map((el: any) => ({ ...el, visible: true, locked: false, rotation: 0, opacity: 1 })),
        }));
        if (converted.length > 0) {
          const merged = [...slides, ...converted];
          updateSlides(merged);
        }
      } catch (err: any) {
        alert("Markdown import failed: " + (err.message || "Unknown error"));
      }
    };
    input.click();
  };

  const importSVG = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".svg";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const element = await parseSVGFile(file);
        const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
        updated[activeSlide].elements.push(element as any);
        updateSlides(updated);
      } catch (err: any) {
        alert("SVG import failed: " + (err.message || "Unknown error"));
      }
    };
    input.click();
  };

  const importGoogleSlides = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".html,.htm";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = importFromGoogleSlides(text);
        const converted = imported.map((s: any) => ({
          ...s,
          elements: s.elements.map((el: any) => ({ ...el, visible: true, locked: false, rotation: 0, opacity: 1 })),
        }));
        if (converted.length > 0) {
          const merged = [...slides, ...converted];
          updateSlides(merged);
        }
      } catch (err: any) {
        alert("Google Slides import failed: " + (err.message || "Unknown error"));
      }
    };
    input.click();
  };

  const exportVideo = () => {
    openVideoPlayer(slides as any, title, { duration: 3, transition: "fade" });
  };

  const exportVideoDownload = () => {
    exportAsVideoHTML(slides as any, title, { duration: 3, transition: "fade" });
  };

  const exportGIF = async () => {
    try {
      await exportAsGIF(slides as any, { frameDelay: 1500, quality: 0.8 });
    } catch (err: any) {
      alert("GIF export failed: " + (err.message || "Unknown error"));
    }
  };

  const exportMarkdownFile = () => {
    downloadMarkdown(slides as any, title);
  };

  const copyMarkdown = () => {
    copyMarkdownToClipboard(slides as any);
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

  const addElement = (type: "text" | "shape" | "code" | "divider" | "youtube" | "line" | "table" | "video" | "audio" | "gif", content?: string) => {
    const newElement: SlideElement = {
      id: String(Date.now()),
      type,
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      width: type === "text" ? 300 : type === "code" ? 400 : type === "divider" ? 200 : type === "youtube" ? 400 : type === "line" ? 200 : type === "table" ? 350 : type === "video" ? 400 : type === "audio" ? 300 : type === "gif" ? 300 : 120,
      height: type === "text" ? 40 : type === "code" ? 200 : type === "divider" ? 3 : type === "youtube" ? 225 : type === "line" ? 3 : type === "table" ? 200 : type === "video" ? 225 : type === "audio" ? 60 : type === "gif" ? 200 : 120,
      content: content || (type === "text" ? "Double-click to edit" : type === "code" ? "// Your code here" : type === "youtube" ? content || "https://youtube.com/watch?v=..." : type === "video" ? content || "" : type === "audio" ? content || "" : type === "gif" ? content || "" : ""),
      color: type === "shape" ? "#F0EDE8" : type === "divider" ? "#C4653A" : type === "line" ? "#C4653A" : "#1C1917",
      fontSize: 18,
      zIndex: currentSlide.elements.length,
      visible: true,
      locked: false,
      rotation: 0,
      opacity: 1,
      strokeWidth: type === "line" ? 3 : undefined,
      lineEndX: type === "line" ? 200 : undefined,
      lineEndY: type === "line" ? 0 : undefined,
      arrowEnd: type === "line" ? "arrow" : undefined,
      tableRows: type === "table" ? 3 : undefined,
      tableCols: type === "table" ? 3 : undefined,
      tableData: type === "table" ? Array.from({ length: 3 }, () => Array(3).fill("")) : undefined,
    };
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    updated[activeSlide].elements.push(newElement);
    updateSlides(updated);
    setActiveElement(newElement.id);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) { alert("Image must be under 10MB"); return; }
    const validTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) { alert("Only PNG, JPEG, GIF, WebP allowed"); return; }
    setUploading(true);
    let imgUrl = "";
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("files").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("files").getPublicUrl(path);
        if (urlData?.publicUrl) imgUrl = urlData.publicUrl;
      }
    }
    if (!imgUrl) {
      imgUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
    const newElement: SlideElement = {
      id: String(Date.now()), type: "image", x: 100, y: 100,
      width: 300, height: 200, content: imgUrl,
      alt: file.name.replace(/\.[^.]+$/, ""),
      color: "#FFFFFF", zIndex: currentSlide.elements.length,
      visible: true, locked: false, rotation: 0, opacity: 1,
    };
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    updated[activeSlide].elements.push(newElement);
    updateSlides(updated);
    setActiveElement(newElement.id);
    setUploading(false);
  };

  const addVideoElement = () => {
    if (!videoUrl) return;
    addElement("video", videoUrl);
    setShowVideoDialog(false);
    setVideoUrl("");
  };

  const addAudioElement = () => {
    if (!audioUrl) return;
    addElement("audio", audioUrl);
    setShowAudioDialog(false);
    setAudioUrl("");
  };

  const addGIFElement = () => {
    if (!gifUrl) return;
    addElement("gif", gifUrl);
    setShowGIFDialog(false);
    setGifUrl("");
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) { alert("Video must be under 50MB"); return; }
    const validTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!validTypes.includes(file.type)) { alert("Only MP4, WebM, Ogg allowed"); return; }
    setUploading(true);
    let url = "";
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/video/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("files").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("files").getPublicUrl(path);
        if (urlData?.publicUrl) url = urlData.publicUrl;
      }
    }
    if (!url) {
      url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
    const newElement: SlideElement = {
      id: String(Date.now()), type: "video", x: 100, y: 100,
      width: 400, height: 225, content: url,
      autoPlay: false, loop: false, muted: false, controls: true,
      color: "#FFFFFF", zIndex: currentSlide.elements.length,
      visible: true, locked: false, rotation: 0, opacity: 1,
    };
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    updated[activeSlide].elements.push(newElement);
    updateSlides(updated);
    setActiveElement(newElement.id);
    setUploading(false);
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) { alert("Audio must be under 20MB"); return; }
    const validTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/aac"];
    if (!validTypes.includes(file.type)) { alert("Only MP3, WAV, Ogg, AAC allowed"); return; }
    setUploading(true);
    let url = "";
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/audio/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("files").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("files").getPublicUrl(path);
        if (urlData?.publicUrl) url = urlData.publicUrl;
      }
    }
    if (!url) {
      url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
    const newElement: SlideElement = {
      id: String(Date.now()), type: "audio", x: 100, y: 100,
      width: 300, height: 60, content: url,
      autoPlay: false, loop: false,
      color: "#FFFFFF", zIndex: currentSlide.elements.length,
      visible: true, locked: false, rotation: 0, opacity: 1,
    };
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    updated[activeSlide].elements.push(newElement);
    updateSlides(updated);
    setActiveElement(newElement.id);
    setUploading(false);
  };

  const handleSVGUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".svg")) { alert("Only SVG files allowed"); return; }
    setUploading(true);
    const text = await file.text();
    if (!text.includes("<svg") && !text.includes("<SVG")) { alert("Invalid SVG file"); setUploading(false); return; }
    const newElement: SlideElement = {
      id: String(Date.now()), type: "image", x: 100, y: 100,
      width: 200, height: 200, content: "",
      svgContent: text, maintainAspectRatio: true,
      color: "#FFFFFF", zIndex: currentSlide.elements.length,
      visible: true, locked: false, rotation: 0, opacity: 1,
    };
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    updated[activeSlide].elements.push(newElement);
    updateSlides(updated);
    setActiveElement(newElement.id);
    setUploading(false);
  };

  const handleCollageTemplate = (template: string) => {
    const templates: Record<string, { x: number; y: number; width: number; height: number }[]> = {
      "2-grid": [
        { x: 10, y: 10, width: 340, height: 380 },
        { x: 365, y: 10, width: 340, height: 380 },
      ],
      "3-grid": [
        { x: 10, y: 10, width: 223, height: 380 },
        { x: 243, y: 10, width: 223, height: 380 },
        { x: 476, y: 10, width: 223, height: 380 },
      ],
      "4-grid": [
        { x: 10, y: 10, width: 340, height: 180 },
        { x: 365, y: 10, width: 340, height: 180 },
        { x: 10, y: 200, width: 340, height: 180 },
        { x: 365, y: 200, width: 340, height: 180 },
      ],
      "3-column": [
        { x: 10, y: 10, width: 223, height: 180 },
        { x: 243, y: 10, width: 223, height: 180 },
        { x: 476, y: 10, width: 223, height: 180 },
        { x: 10, y: 200, width: 223, height: 180 },
        { x: 243, y: 200, width: 223, height: 180 },
        { x: 476, y: 200, width: 223, height: 180 },
      ],
      "4-column": [
        { x: 10, y: 10, width: 165, height: 180 },
        { x: 185, y: 10, width: 165, height: 180 },
        { x: 360, y: 10, width: 165, height: 180 },
        { x: 535, y: 10, width: 165, height: 180 },
        { x: 10, y: 200, width: 165, height: 180 },
        { x: 185, y: 200, width: 165, height: 180 },
        { x: 360, y: 200, width: 165, height: 180 },
        { x: 535, y: 200, width: 165, height: 180 },
      ],
      "2+1": [
        { x: 10, y: 10, width: 460, height: 380 },
        { x: 480, y: 10, width: 220, height: 180 },
        { x: 480, y: 200, width: 220, height: 180 },
      ],
      "1+2": [
        { x: 10, y: 10, width: 220, height: 180 },
        { x: 10, y: 200, width: 220, height: 180 },
        { x: 240, y: 10, width: 460, height: 380 },
      ],
      "spotlight": [
        { x: 160, y: 40, width: 400, height: 320 },
      ],
    };
    const layout = templates[template];
    if (!layout) return;
    const groupId = `collage-${Date.now()}`;
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    layout.forEach((pos, i) => {
      const placeholder: SlideElement = {
        id: String(Date.now() + i), type: "image", x: pos.x, y: pos.y,
        width: pos.width, height: pos.height, content: "",
        alt: `Collage image ${i + 1}`,
        color: "#2A2523", zIndex: currentSlide.elements.length + i,
        visible: true, locked: false, rotation: 0, opacity: 1,
        borderRadius: 4, groupId, collageTemplate: template,
      };
      updated[activeSlide].elements.push(placeholder);
    });
    updateSlides(updated);
    setShowCollageDialog(false);
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

  const handleLatexInsert = (latex: string) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    if (editingLatexId) {
      const el = updated[activeSlide].elements.find((x: SlideElement) => x.id === editingLatexId);
      if (el) { el.content = latex; updateSlides(updated); setEditingLatexId(null); return; }
    }
    const newElement: SlideElement = {
      id: String(Date.now()),
      type: "latex",
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      width: 400,
      height: 100,
      content: latex,
      color: "#1C1917",
      fontSize: 24,
      zIndex: currentSlide.elements.length,
      visible: true,
      locked: false,
      rotation: 0,
      opacity: 1,
    };
    updated[activeSlide].elements.push(newElement);
    updateSlides(updated);
    setActiveElement(newElement.id);
  };

  const handleMermaidInsert = (code: string) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    if (editingMermaidId) {
      const el = updated[activeSlide].elements.find((x: SlideElement) => x.id === editingMermaidId);
      if (el) { el.content = code; updateSlides(updated); setEditingMermaidId(null); return; }
    }
    const newElement: SlideElement = {
      id: String(Date.now()),
      type: "mermaid",
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      width: 400,
      height: 300,
      content: code,
      color: "#1C1917",
      zIndex: currentSlide.elements.length,
      visible: true,
      locked: false,
      rotation: 0,
      opacity: 1,
    };
    updated[activeSlide].elements.push(newElement);
    updateSlides(updated);
    setActiveElement(newElement.id);
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
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const startX = (e.clientX - rect.left) / (zoom / 100);
      const startY = (e.clientY - rect.top) / (zoom / 100);
      setSelectionRect({ startX, startY, endX: startX, endY: startY });
    }
    setContextMenu(null);
  };

  useEffect(() => {
    if (!selectionRect) return;
    const handleMove = (e: MouseEvent) => {
      const rect = (e.target as HTMLElement).closest("[data-canvas]")?.getBoundingClientRect();
      if (!rect) return;
      setSelectionRect(prev => prev ? { ...prev, endX: (e.clientX - rect.left) / (zoom / 100), endY: (e.clientY - rect.top) / (zoom / 100) } : null);
    };
    const handleUp = () => {
      if (selectionRect) {
        const sx = Math.min(selectionRect.startX, selectionRect.endX);
        const sy = Math.min(selectionRect.startY, selectionRect.endY);
        const sw = Math.abs(selectionRect.endX - selectionRect.startX);
        const sh = Math.abs(selectionRect.endY - selectionRect.startY);
        const hits = currentSlide.elements.filter(el =>
          el.visible && el.x < sx + sw && el.x + el.width > sx && el.y < sy + sh && el.y + el.height > sy
        );
        if (hits.length > 0) {
          setActiveElement(hits[0].id);
          setSelectedElements(hits.map(h => h.id));
        }
      }
      setSelectionRect(null);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [selectionRect, currentSlide.elements, zoom]);

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.canvas === "true") {
      e.preventDefault();
      setActiveElement(null);
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    if (el.locked) return;
    if (connectorMode && (el.type === "shape" || el.type === "text")) {
      if (!connectorSource) {
        setConnectorSource(el.id);
      } else if (connectorSource !== el.id) {
        const u = JSON.parse(JSON.stringify(slides)) as Slide[];
        const startEl = u[activeSlide].elements.find(x => x.id === connectorSource);
        const endEl = u[activeSlide].elements.find(x => x.id === el.id);
        if (startEl && endEl) {
          startEl.connectorEndId = el.id;
          endEl.connectorStartId = connectorSource;
          updateSlides(u);
        }
        setConnectorSource(null);
        setConnectorMode(false);
      }
      return;
    }
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

        const finalDx = nx - dragState.origX;
        const finalDy = ny - dragState.origY;
        el.x = nx; el.y = ny;

        // Move grouped elements together by the same delta
        if (el.groupId) {
          updated[activeSlide].elements.forEach((ge) => {
            if (ge.groupId === el.groupId && ge.id !== el.id) {
              ge.x = Math.max(0, Math.min(720 - ge.width, ge.x + (nx - dragState.origX)));
              ge.y = Math.max(0, Math.min(405 - ge.height, ge.y + (ny - dragState.origY)));
            }
          });
        }

        setSlides(updated);
      }
    };
    const handleUp = () => { pushHistory(slides); setDragState(null); setSnapGuides([]); };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [dragState, slides, activeSlide, pushHistory, snapEnabled]);

  const handleResizeMouseDown = (e: React.MouseEvent, el: SlideElement, direction: string = "se") => {
    e.stopPropagation();
    const lockAspect = e.shiftKey || !!el.lockAspectRatio;
    setResizeState({ elId: el.id, startX: e.clientX, startY: e.clientY, origW: el.width, origH: el.height, origX: el.x, origY: el.y, direction, lockAspect });
  };

  const handleRotationMouseDown = (e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    const startAngle = Math.atan2(e.clientY - (el.y * zoom / 100 + 405 * zoom / 200), e.clientX - (el.x * zoom / 100 + 720 * zoom / 200));
    const handleRotate = (ev: MouseEvent) => {
      const currentAngle = Math.atan2(ev.clientY - (el.y * zoom / 100 + 720 * zoom / 200), ev.clientX - (el.x * zoom / 100 + 720 * zoom / 200));
      const delta = (currentAngle - startAngle) * (180 / Math.PI);
      const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
      const elem = updated[activeSlide].elements.find((x) => x.id === el.id);
      if (elem) { elem.rotation = (elem.rotation || 0) + delta; setSlides(updated); }
    };
    const handleUp = () => { window.removeEventListener("mousemove", handleRotate); window.removeEventListener("mouseup", handleUp); pushHistory(slides); };
    window.addEventListener("mousemove", handleRotate);
    window.addEventListener("mouseup", handleUp);
  };

  useEffect(() => {
    if (!resizeState) return;
    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeState.startX;
      const dy = e.clientY - resizeState.startY;
      const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
      const el = updated[activeSlide].elements.find((x) => x.id === resizeState.elId);
      if (!el) return;
      let { origW, origH, origX, origY } = resizeState;
      const dir = resizeState.direction;
      let newW = origW, newH = origH, newX = origX, newY = origY;
      const aspect = origW / origH;
      switch (dir) {
        case "e": newW = Math.max(20, origW + dx); if (resizeState.lockAspect) { newH = newW / aspect; } break;
        case "w": newW = Math.max(20, origW - dx); newX = origX + origW - newW; if (resizeState.lockAspect) { newH = newW / aspect; newY = origY + (origH - newH); } break;
        case "s": newH = Math.max(20, origH + dy); if (resizeState.lockAspect) { newW = newH * aspect; } break;
        case "n": newH = Math.max(20, origH - dy); newY = origY + origH - newH; if (resizeState.lockAspect) { newW = newH * aspect; newX = origX + (origW - newW); } break;
        case "se": newW = Math.max(20, origW + dx); newH = resizeState.lockAspect ? newW / aspect : Math.max(20, origH + dy); break;
        case "sw": newW = Math.max(20, origW - dx); newX = origX + origW - newW; newH = resizeState.lockAspect ? newW / aspect : Math.max(20, origH + dy); break;
        case "ne": newW = Math.max(20, origW + dx); newH = resizeState.lockAspect ? newW / aspect : Math.max(20, origH - dy); newY = origY + origH - newH; break;
        case "nw": newW = Math.max(20, origW - dx); newX = origX + origW - newW; newH = resizeState.lockAspect ? newW / aspect : Math.max(20, origH - dy); newY = origY + origH - newH; break;
      }
      el.width = newW; el.height = newH; el.x = newX; el.y = newY;
      setSlides(updated);
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
    setShareLink(`${window.location.origin}/present/${presentationId}`);
    setShowShare(true);
  };

  const handleAlignToSlide = (type: "slide-left" | "slide-center" | "slide-right" | "slide-top" | "slide-middle" | "slide-bottom") => {
    const targetIds = activeElement && !selectedElements.length ? [activeElement] : selectedElements;
    if (targetIds.length < 1) return;
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const elements = updated[activeSlide].elements.filter(el => targetIds.includes(el.id));
    const aligned = alignElementsToSlide(elements.map(e => ({ id: e.id, x: e.x, y: e.y, width: e.width, height: e.height })), type, 720, 405);
    for (const a of aligned) {
      const el = updated[activeSlide].elements.find(e => e.id === a.id);
      if (el) { el.x = a.x; el.y = a.y; }
    }
    updateSlides(updated);
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
    if (el) { el.animation = anim || undefined; updateSlides(updated); }
  };

  const addAnimation = (elId: string, anim: AnimationDef) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements.find(x => x.id === elId);
    if (el) {
      if (!el.animations) el.animations = [];
      if (el.animation) { el.animations.unshift(el.animation); el.animation = undefined; }
      el.animations.push(anim);
      updateSlides(updated);
    }
  };

  const removeAnimation = (elId: string, idx: number) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements.find(x => x.id === elId);
    if (el && el.animations) {
      el.animations.splice(idx, 1);
      if (el.animations.length === 0) el.animations = undefined;
      updateSlides(updated);
    }
  };

  const updateAnimation = (elId: string, idx: number, anim: Partial<AnimationDef>) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements.find(x => x.id === elId);
    if (el) {
      const anims = el.animations || (el.animation ? [el.animation] : []);
      if (anims[idx]) { Object.assign(anims[idx], anim); }
      if (anims.length === 1 && !el.animations) el.animation = anims[0];
      else el.animations = anims;
      updateSlides(updated);
    }
  };

  const moveAnimation = (elId: string, fromIdx: number, toIdx: number) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements.find(x => x.id === elId);
    if (el) {
      const anims = el.animations || (el.animation ? [el.animation] : []);
      const [moved] = anims.splice(fromIdx, 1);
      anims.splice(toIdx, 0, moved);
      if (anims.length === 1 && !el.animations) el.animation = anims[0];
      else el.animations = anims;
      updateSlides(updated);
    }
  };

  const getAllElementAnimations = (el: SlideElement): AnimationDef[] => {
    if (el.animations && el.animations.length > 0) return el.animations;
    if (el.animation) return [el.animation];
    return [];
  };

  const enterPreviewMode = () => {
    setIsPreviewMode(true);
    setPreviewPlaying(true);
  };

  const exitPreviewMode = () => {
    setIsPreviewMode(false);
    setPreviewPlaying(false);
    if (previewStyleRef.current) {
      previewStyleRef.current.remove();
      previewStyleRef.current = null;
    }
  };

  useEffect(() => {
    if (!isPreviewMode || !previewPlaying) return;
    const elements = currentSlide.elements.filter(el => el.visible);
    const seq = sequencifyAnimations(elements);
    const css = getTimelineCSS(seq);
    if (previewStyleRef.current) previewStyleRef.current.remove();
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    previewStyleRef.current = style;
    const totalDur = getTotalDuration(seq);
    const timer = setTimeout(() => setPreviewPlaying(false), totalDur + 500);
    return () => { clearTimeout(timer); if (previewStyleRef.current) { previewStyleRef.current.remove(); previewStyleRef.current = null; } };
  }, [isPreviewMode, previewPlaying, currentSlide]);

  const toggleVisibility = (elId: string) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements.find(x => x.id === elId);
    if (el) { el.visible = !el.visible; updateSlides(updated); }
  };

  const toggleLock = (elId: string) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements.find(x => x.id === elId);
    if (el) { el.locked = !el.locked; updateSlides(updated); }
  };

  const reorderLayer = (fromIndex: number, toIndex: number) => {
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    const el = updated[activeSlide].elements[fromIndex];
    if (!el) return;
    updated[activeSlide].elements.splice(fromIndex, 1);
    updated[activeSlide].elements.splice(toIndex, 0, el);
    updateSlides(updated);
  };

  const groupElements = () => {
    const targets = selectedElements.length > 0 ? selectedElements : (activeElement ? [activeElement] : []);
    if (targets.length < 2) return;
    const groupId = `group-${Date.now()}`;
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    targets.forEach((id) => {
      const el = updated[activeSlide].elements.find((e) => e.id === id);
      if (el) el.groupId = groupId;
    });
    updateSlides(updated);
  };

  const ungroupElements = () => {
    const targets = selectedElements.length > 0 ? selectedElements : (activeElement ? [activeElement] : []);
    if (targets.length === 0) return;
    const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
    targets.forEach((id) => {
      const el = updated[activeSlide].elements.find((e) => e.id === id);
      if (el) el.groupId = undefined;
    });
    updateSlides(updated);
  };

  const copySelectedToClipboard = () => {
    const targets = selectedElements.length > 0 ? selectedElements : (activeElement ? [activeElement] : []);
    if (targets.length === 0) return;
    const els = currentSlide.elements.filter(e => targets.includes(e.id));
    setSlideClipboard(JSON.parse(JSON.stringify(els)));
  };

  const pasteFromClipboard = () => {
    if (!slideClipboard || slideClipboard.length === 0) return;
    const u = JSON.parse(JSON.stringify(slides)) as Slide[];
    const newIds: string[] = [];
    slideClipboard.forEach((el) => {
      const clone = { ...el, id: String(Date.now()) + Math.random(), x: el.x + 20, y: el.y + 20 };
      u[activeSlide].elements.push(clone);
      newIds.push(clone.id);
    });
    updateSlides(u);
    setActiveElement(newIds[0]);
    setSelectedElements(newIds);
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

          {/* Import dropdown */}
          <div className="relative">
            <button onClick={() => setShowImportMenu(!showImportMenu)} className="p-2 text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5" title="Import">
              <FileUp className="w-4 h-4" />
            </button>
            {showImportMenu && (
              <div className="absolute top-full right-0 mt-1 bg-[#2A2523] border border-white/10 rounded-lg p-1 shadow-xl z-50 w-56">
                <button onClick={() => { setShowImportMenu(false); importPPTX(); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all"><FileDown className="w-3.5 h-3.5" /> Import PowerPoint (.pptx)</button>
                <button onClick={() => { setShowImportMenu(false); importMarkdownFile(); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all"><FileText className="w-3.5 h-3.5" /> Import Markdown (.md)</button>
                <button onClick={() => { setShowImportMenu(false); importSVG(); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all"><FileImage className="w-3.5 h-3.5" /> Import SVG</button>
                <button onClick={() => { setShowImportMenu(false); importGoogleSlides(); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all"><FileText className="w-3.5 h-3.5" /> Import Google Slides (HTML)</button>
              </div>
            )}
          </div>

          {/* Export dropdown */}
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="p-2 text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5" title="Export">
              <Download className="w-4 h-4" />
            </button>
            {showExportMenu && (
              <div className="absolute top-full right-0 mt-1 bg-[#2A2523] border border-white/10 rounded-lg p-1 shadow-xl z-50 w-44">
                <button onClick={() => { exportToPDF(title, slides); setShowExportMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all"><FileDown className="w-3.5 h-3.5" /> Export as PDF</button>
                <button onClick={() => { exportToPPTX(title, slides); setShowExportMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all"><FileDown className="w-3.5 h-3.5" /> Export as PPTX</button>
                <button onClick={() => { exportHTML(); setShowExportMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all"><FileText className="w-3.5 h-3.5" /> Export as HTML</button>
                <button onClick={() => { exportSlideAsPNG(canvasRef.current, title, activeSlide); setShowExportMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all"><FileImage className="w-3.5 h-3.5" /> Export Slide PNG</button>
                <div className="w-full h-px bg-white/5 my-1" />
                <button onClick={() => { setShowExportMenu(false); exportVideo(); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all"><FileVideo className="w-3.5 h-3.5" /> Export as Video</button>
                <button onClick={() => { setShowExportMenu(false); exportVideoDownload(); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all"><FileVideo className="w-3.5 h-3.5" /> Download Video HTML</button>
                <button onClick={() => { setShowExportMenu(false); exportGIF(); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all"><FileImage className="w-3.5 h-3.5" /> Export as GIF</button>
                <div className="w-full h-px bg-white/5 my-1" />
                <button onClick={() => { setShowExportMenu(false); exportMarkdownFile(); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all"><FileText className="w-3.5 h-3.5" /> Export as Markdown</button>
                <button onClick={() => { setShowExportMenu(false); copyMarkdown(); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 rounded transition-all"><FileText className="w-3.5 h-3.5" /> Copy Markdown</button>
              </div>
            )}
          </div>

          <button onClick={saveVersion} className="p-2 text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5" title="Save Version"><Save className="w-4 h-4" /></button>
          <button onClick={() => setShowVersions(true)} className="p-2 text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5" title="Version History"><History className="w-4 h-4" /></button>
          <button onClick={generateShareLink} className="p-2 text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5"><Share2 className="w-4 h-4" /></button>
          <button onClick={togglePublic} className={`p-2 rounded-lg transition-all ${isPublic ? "text-sienna bg-sienna/10" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
            <Globe className="w-4 h-4" />
          </button>
          <button onClick={async () => { setShowCustomShow(true); const shows = await loadCustomShows(presentationId); setCustomShows(shows); setSelectedCustomIndices(new Set()); setCustomShowName(""); }} className="p-2 text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5" title="Custom Slide Show"><Presentation className="w-4 h-4" /></button>
          <button onClick={() => setShowSettings(true)} className="p-2 text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5"><Settings className="w-4 h-4" /></button>
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
              <span className="text-xs font-medium text-white/40">
                {selectedSlides.size > 0 ? `${selectedSlides.size} selected` : "Slides"}
              </span>
              <div className="flex items-center gap-1">
                {selectedSlides.size > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); const sorted = [...selectedSlides].sort((a,b) => b-a); const u = JSON.parse(JSON.stringify(slides)) as Slide[]; sorted.forEach(i => { if (u.length > 1) u.splice(i, 1); }); updateSlides(u, Math.min(activeSlide, u.length-1)); setSelectedSlides(new Set()); }}
                      className="p-1 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded transition-all" title="Delete Selected">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const sorted = [...selectedSlides].sort((a,b) => b-a); sorted.forEach(i => { const dup = JSON.parse(JSON.stringify(u[i])); dup.id = String(Date.now()) + Math.random(); dup.elements = (dup.elements || []).map((el: SlideElement) => ({ ...el, id: String(Date.now()) + Math.random() })); u.splice(i + 1, 0, dup); }); updateSlides(u); setSelectedSlides(new Set()); }}
                      className="p-1 text-white/40 hover:text-sienna hover:bg-sienna/10 rounded transition-all" title="Duplicate Selected">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
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
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    const next = new Set(selectedSlides);
                    if (next.has(i)) next.delete(i); else next.add(i);
                    setSelectedSlides(next);
                  } else {
                    setActiveSlide(i);
                    setSelectedSlides(new Set());
                  }
                }}
                className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  activeSlide === i ? "border-sienna" : selectedSlides.has(i) ? "border-sienna/50 ring-2 ring-sienna/30" : slideDragIndex === i ? "border-white/20 opacity-50" : slideDropIndex === i ? "border-sienna/50" : "border-transparent hover:border-white/10"
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
                {slide.section && <div className="absolute top-1 left-6 text-[7px] text-white/40 truncate max-w-[80px]">{slide.section}</div>}
                {slide.notes && <div className="absolute bottom-1 right-1"><StickyNote className="w-3 h-3 text-white/40" /></div>}
                <button onClick={(e) => { e.stopPropagation(); const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const dup = JSON.parse(JSON.stringify(slides[i])); dup.id = String(Date.now()); dup.elements = (dup.elements || []).map((el: SlideElement) => ({ ...el, id: String(Date.now()) + Math.random() })); u.splice(i + 1, 0, dup); updateSlides(u, i + 1); }}
                  className="absolute top-1 right-6 p-0.5 bg-black/60 text-white/50 hover:text-sienna rounded opacity-0 group-hover:opacity-100 transition-all">
                  <Copy className="w-3 h-3" />
                </button>
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
                  {(["bar", "line", "pie", "donut", "area", "scatter"] as ChartType[]).map((t) => (
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
            <button onClick={() => setShowStockImages(true)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Stock Images">
              <Globe className="w-4 h-4" />
            </button>
            <button onClick={() => { const url = prompt("Enter YouTube video URL:"); if (url) { addElement("youtube", url); } }} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="YouTube">
              <Play className="w-4 h-4" />
            </button>
            <button onClick={() => setShowVideoDialog(true)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Video">
              <Video className="w-4 h-4" />
            </button>
            <button onClick={() => setShowAudioDialog(true)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Audio">
              <Music className="w-4 h-4" />
            </button>
            <button onClick={() => setShowGIFDialog(true)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="GIF">
              <Film className="w-4 h-4" />
            </button>
            <div className="relative">
              <button onClick={() => setShowUploadMenu(!showUploadMenu)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Upload">
                <Upload className="w-4 h-4" />
              </button>
              {showUploadMenu && (
                <div className="absolute top-full left-0 mt-1 bg-[#2A2523] border border-white/10 rounded-lg p-1 shadow-xl z-50 w-36">
                  <label className="flex items-center gap-2 px-2 py-1.5 text-xs text-white/60 hover:bg-white/5 rounded cursor-pointer transition-all">
                    <Image className="w-3.5 h-3.5" /> Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <label className="flex items-center gap-2 px-2 py-1.5 text-xs text-white/60 hover:bg-white/5 rounded cursor-pointer transition-all">
                    <Video className="w-3.5 h-3.5" /> Upload Video
                    <input type="file" accept="video/mp4,video/webm,video/ogg" className="hidden" onChange={handleVideoUpload} />
                  </label>
                  <label className="flex items-center gap-2 px-2 py-1.5 text-xs text-white/60 hover:bg-white/5 rounded cursor-pointer transition-all">
                    <Music className="w-3.5 h-3.5" /> Upload Audio
                    <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
                  </label>
                  <label className="flex items-center gap-2 px-2 py-1.5 text-xs text-white/60 hover:bg-white/5 rounded cursor-pointer transition-all">
                    <Code className="w-3.5 h-3.5" /> Upload SVG
                    <input type="file" accept=".svg" className="hidden" onChange={handleSVGUpload} />
                  </label>
                </div>
              )}
            </div>
            <button onClick={() => setShowCollageDialog(true)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Photo Collage">
              <LayoutTemplate className="w-4 h-4" />
            </button>
            <button onClick={() => setShowQRDialog(true)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="QR Code">
              <QrCode className="w-4 h-4" />
            </button>
            <button onClick={() => addElement("line")} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Line / Arrow">
              <Minus className="w-4 h-4 rotate-45" />
            </button>
            <button onClick={() => { setConnectorMode(!connectorMode); setConnectorSource(null); }} className={`p-1.5 rounded-lg transition-all shrink-0 ${connectorMode ? "bg-sienna/20 text-sienna" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`} title="Connector Mode">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 8l10 10"/></svg>
            </button>
            <button onClick={() => addElement("table")} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Table">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setShowLatexEditor(true)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="LaTeX Equation">
              <Sigma className="w-4 h-4" />
            </button>
            <button onClick={() => setShowMermaidEditor(true)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all shrink-0" title="Mermaid Diagram">
              <Workflow className="w-4 h-4" />
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
                <div className="absolute top-full left-0 mt-1 bg-[#2A2523] border border-white/10 rounded-lg p-2 shadow-xl z-50 w-44">
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
                  <div className="grid grid-cols-3 gap-1 mb-1 pt-1 border-t border-white/10">
                    <button onClick={() => handleAlignToSlide("slide-left")} className="p-1.5 text-white/50 hover:bg-white/10 rounded transition-all" title="Align Left to Slide"><AlignLeft className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleAlignToSlide("slide-center")} className="p-1.5 text-white/50 hover:bg-white/10 rounded transition-all" title="Align Center to Slide"><AlignCenter className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleAlignToSlide("slide-right")} className="p-1.5 text-white/50 hover:bg-white/10 rounded transition-all" title="Align Right to Slide"><AlignRight className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleAlignToSlide("slide-top")} className="p-1.5 text-white/50 hover:bg-white/10 rounded transition-all" title="Align Top to Slide"><AlignStartVertical className="w-3.5 h-3.5 rotate-0" /></button>
                    <button onClick={() => handleAlignToSlide("slide-middle")} className="p-1.5 text-white/50 hover:bg-white/10 rounded transition-all" title="Align Middle to Slide"><AlignCenter className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleAlignToSlide("slide-bottom")} className="p-1.5 text-white/50 hover:bg-white/10 rounded transition-all" title="Align Bottom to Slide"><AlignEndVertical className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-1 border-t border-white/10">
                    <button onClick={() => handleDistribute("horizontal")} className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/50 hover:bg-white/10 rounded transition-all"><AlignJustify className="w-3 h-3" /> H</button>
                    <button onClick={() => handleDistribute("vertical")} className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/50 hover:bg-white/10 rounded transition-all"><LayoutGrid className="w-3 h-3" /> V</button>
                  </div>
                  <div className="pt-1 border-t border-white/10 mt-1">
                    <button onClick={() => {
                      const targets = selectedElements.length > 0 ? selectedElements : currentSlide.elements.map(e => e.id);
                      const els = currentSlide.elements.filter(e => targets.includes(e.id));
                      const arranged = autoArrangeElements(els, 720, 405);
                      const u = JSON.parse(JSON.stringify(slides)) as Slide[];
                      arranged.forEach((a) => {
                        const el = u[activeSlide].elements.find((e: SlideElement) => e.id === a.id);
                        if (el) { el.x = a.x; el.y = a.y; el.width = a.width; el.height = a.height; }
                      });
                      updateSlides(u);
                      setShowAlignTools(false);
                    }} className="flex items-center gap-1 w-full px-2 py-1.5 text-[10px] text-white/50 hover:bg-white/10 rounded transition-all">
                      <Layout className="w-3 h-3" /> Smart Layout
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setShowAIGenerate(true)} className="p-1.5 text-white/40 hover:text-sienna hover:bg-sienna/10 rounded-lg transition-all shrink-0" title="AI Generate Slides">
              <Wand2 className="w-4 h-4" />
            </button>
            <div className="relative">
              <button onClick={() => setShowThemeMenu(!showThemeMenu)} className={`p-1.5 rounded-lg transition-all shrink-0 ${showThemeMenu ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`} title="Themes">
                <Sparkles className="w-4 h-4" />
              </button>
              {showThemeMenu && (
                <div className="absolute top-full left-0 mt-1 bg-[#2A2523] border border-white/10 rounded-lg p-2 shadow-xl z-50 w-56 max-h-80 overflow-y-auto">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider px-1 mb-1.5">Preset Themes</div>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    {[...themePresets, ...customThemes.map(t => ({ name: t.name, bg: t.background, accent: t.accentColor, font: t.fontFamily }))].map((t) => (
                      <button key={t.name} onClick={() => { const u = applyTheme(t, slides); updateSlides(u); setShowThemeMenu(false); }}
                        className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 transition-all">
                        <div className="w-full h-6 rounded border border-white/10" style={{ background: t.bg, borderBottom: `3px solid ${t.accent}` }} />
                        <span className="text-[9px] text-white/50 truncate w-full text-center">{t.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-1.5">
                    <button onClick={() => { setShowThemeMenu(false); setShowCustomThemeEditor(true); }}
                      className="flex items-center gap-1.5 w-full px-2 py-1.5 text-[10px] text-sienna hover:bg-sienna/10 rounded transition-all">
                      <Palette className="w-3 h-3" /> Custom Theme
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setShowAnimations(!showAnimations)} className={`p-1.5 rounded-lg transition-all shrink-0 ${showAnimations ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`} title="Animations">
              <Play className="w-4 h-4" />
            </button>
            <button onClick={enterPreviewMode} disabled={isPreviewMode} className="p-1.5 text-white/40 hover:text-sienna hover:bg-sienna/10 rounded-lg transition-all shrink-0 disabled:opacity-30" title="Preview Animation">
              <List className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded-lg transition-all shrink-0 ${showGrid ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`} title="Grid">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setSnapEnabled(!snapEnabled)} className={`p-1.5 rounded-lg transition-all shrink-0 ${snapEnabled ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`} title="Snap">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button onClick={() => { setShowSpellCheck(!showSpellCheck); setShowAccessibility(false); }} className={`p-1.5 rounded-lg transition-all shrink-0 relative ${showSpellCheck ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`} title="Spell Check">
              <CheckCheck className="w-4 h-4" />
              {(() => { try { const el = currentSlide?.elements; if (!el) return null; const content = el.filter(e => e.type === "text" && e.content).map(e => e.content).join(" "); const issues = checkSpelling(content); const grammar = checkGrammar(content); const total = issues.length + grammar.length; if (total === 0) return null; return <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-sienna text-white text-[7px] font-bold rounded-full flex items-center justify-center">{total > 9 ? "9+" : total}</span>; } catch { return null; }})()}
            </button>
            <button onClick={() => { setShowAccessibility(!showAccessibility); setShowSpellCheck(false); }} className={`p-1.5 rounded-lg transition-all shrink-0 relative ${showAccessibility ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`} title="Accessibility Check">
              <Eye className="w-4 h-4" />
              {(() => { try { const el = currentSlide; if (!el || !el.elements) return null; const issues = checkAccessibility(el as any, () => {}); if (issues.length === 0) return null; return <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-sienna text-white text-[7px] font-bold rounded-full flex items-center justify-center">{issues.length > 9 ? "9+" : issues.length}</span>; } catch { return null; }})()}
            </button>
            <button onClick={() => setZoom(100)} className="p-1 text-[10px] text-white/30 hover:text-white/60 rounded transition-all shrink-0" title="Reset Zoom">100%</button>
            <button onClick={() => setZoom(Math.max(25, Math.min(200, Math.floor(window.innerHeight / 405 * 100))))} className="p-1 text-white/40 hover:text-white/70 rounded transition-all shrink-0" title="Fit to Canvas"><Expand className="w-3 h-3" /></button>
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom(Math.max(25, zoom - 10))} className="p-1 text-white/40 hover:text-white/70 rounded transition-all shrink-0"><Minus className="w-3 h-3" /></button>
              <span className="text-[11px] text-white/40 w-8 text-center">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1 text-white/40 hover:text-white/70 rounded transition-all shrink-0"><Plus className="w-3 h-3" /></button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center bg-[#1A1715] p-8 overflow-auto relative" onContextMenu={handleCanvasContextMenu}>
            {isPreviewMode && (
              <div className="absolute top-0 left-0 right-0 z-50 bg-sienna/90 text-white text-[11px] font-medium px-4 py-1.5 flex items-center justify-between">
                <span>Preview Mode — Animations playing in sequence</span>
                <div className="flex items-center gap-2">
                  {!previewPlaying && <span className="text-white/70">Playback complete</span>}
                  <button onClick={exitPreviewMode} className="text-[10px] bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded transition-all">Exit Preview</button>
                </div>
              </div>
            )}
            <div className="flex flex-col">
              {/* Top ruler */}
              <div className="flex" style={{ marginLeft: "20px" }}>
                <div className="h-5 bg-[#2A2523] border-b border-white/5 flex items-end" style={{ width: 720 * zoom / 100 }}>
                  {Array.from({ length: Math.ceil(720 / 50) }).map((_, i) => (
                    <div key={i} className="flex-1 flex items-start justify-start" style={{ width: 50 * zoom / 100 }}>
                      <span className="text-[8px] text-white/20 leading-none" style={{ marginLeft: "1px" }}>{i * 50}</span>
                      <div className="w-px h-2 bg-white/10 ml-px" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex">
                {/* Left ruler */}
                <div className="w-5 bg-[#2A2523] border-r border-white/5 flex flex-col items-center shrink-0" style={{ height: 405 * zoom / 100 }}>
                  {Array.from({ length: Math.ceil(405 / 50) }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center justify-start" style={{ height: 50 * zoom / 100 }}>
                      <span className="text-[8px] text-white/20 leading-none">{i * 50}</span>
                      <div className="h-px w-2 bg-white/10" />
                    </div>
                  ))}
                </div>
            <div ref={canvasRef} className="relative shadow-2xl shadow-black/30 rounded-sm transition-all" style={{ width: 720 * zoom / 100, height: 405 * zoom / 100, background: currentSlide.backgroundGradient || (currentSlide.backgroundImage ? `url(${currentSlide.backgroundImage}) center/cover` : currentSlide.background), backgroundColor: currentSlide.backgroundImage || currentSlide.backgroundGradient ? "transparent" : currentSlide.background }}
              onMouseDown={handleCanvasMouseDown} data-canvas="true"
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith("image/")) {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  const dropX = rect ? (e.clientX - rect.left) / (zoom / 100) - 75 : 100;
                  const dropY = rect ? (e.clientY - rect.top) / (zoom / 100) - 50 : 100;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const u = JSON.parse(JSON.stringify(slides)) as Slide[];
                    u[activeSlide].elements.push({
                      id: String(Date.now()), type: "image", x: Math.max(0, dropX), y: Math.max(0, dropY),
                      width: 150, height: 100, content: reader.result as string, alt: file.name.replace(/\.[^.]+$/, ""),
                      color: "#FFFFFF", zIndex: currentSlide.elements.length, visible: true, locked: false, rotation: 0, opacity: 1,
                    });
                    updateSlides(u);
                  };
                  reader.readAsDataURL(file);
                }
              }}>
              {currentSlide.showSlideNumber && (
                <div className="absolute bottom-2 right-3 text-[10px] text-white/30 pointer-events-none z-50">{activeSlide + 1}</div>
              )}
              {selectionRect && (
                <div className="absolute border border-sienna bg-sienna/10 pointer-events-none z-40"
                  style={{
                    left: Math.min(selectionRect.startX, selectionRect.endX) * zoom / 100,
                    top: Math.min(selectionRect.startY, selectionRect.endY) * zoom / 100,
                    width: Math.abs(selectionRect.endX - selectionRect.startX) * zoom / 100,
                    height: Math.abs(selectionRect.endY - selectionRect.startY) * zoom / 100,
                  }} />
              )}
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
                <div key={el.id} data-element="true" data-seq-id={el.id}
                  onMouseDown={(e) => { if (!isPreviewMode) handleElementMouseDown(e, el); }}
                  onContextMenu={(e) => { if (!isPreviewMode) handleElementContextMenu(e, el); }}
                  className={`absolute select-none ${isPreviewMode ? "pointer-events-none" : ""} ${activeElement === el.id && !isPreviewMode ? "ring-2 ring-sienna" : "hover:ring-1 hover:ring-white/20"} ${el.locked ? "cursor-not-allowed" : !dragState ? "cursor-move" : ""}`}
                  style={{
                    left: el.x * zoom / 100, top: el.y * zoom / 100,
                    width: el.width * zoom / 100, height: el.height * zoom / 100,
                    zIndex: el.zIndex || 0, opacity: el.opacity,
                    transform: `rotate(${el.rotation || 0}deg)${el.flipH ? " scaleX(-1)" : ""}${el.flipV ? " scaleY(-1)" : ""}`,
                    boxShadow: el.shadow || undefined,
                    animation: !isPreviewMode && el.animation ? `${el.animation.type} ${el.animation.duration || 500}ms ${el.animation.delay || 0}ms both` : undefined,
                  }}>
                  {el.type === "text" ? (
                    <div contentEditable suppressContentEditableWarning className="w-full h-full outline-none break-words"
                      style={{ color: el.color, fontSize: el.fontSize, fontFamily: el.fontFamily || "var(--font-heading)", fontWeight: el.fontWeight, fontStyle: el.fontStyle, textDecoration: el.textDecoration, textAlign: el.textAlign, backgroundColor: el.highlight || undefined, borderRadius: el.borderRadius || 0, padding: "2px 4px", letterSpacing: el.letterSpacing !== undefined ? `${el.letterSpacing}px` : undefined, lineHeight: el.lineHeight || undefined }}
                      onBlur={(e) => { const updated = JSON.parse(JSON.stringify(slides)) as Slide[]; const elem = updated[activeSlide].elements.find((x) => x.id === el.id); if (elem) elem.content = e.currentTarget.textContent || ""; updateSlides(updated); }}>
                      {el.content}
                    </div>
                  ) : el.type === "code" ? (
                    <div className="w-full h-full bg-[#1E1E1E] rounded-lg overflow-auto border border-white/10">
                      <div className="px-3 py-1 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[9px] text-white/20">{el.codeLanguage || "code"}</span>
                        <span className="text-[9px] text-white/20">editable</span>
                      </div>
                      <pre className="p-3 m-0 font-mono text-xs overflow-auto" style={{ whiteSpace: "pre-wrap" }}><code className={`language-${el.codeLanguage || "plaintext"}`}
                        dangerouslySetInnerHTML={{ __html: hljs.highlight(el.content, { language: el.codeLanguage || "plaintext", ignoreIllegals: true }).value }}
                        contentEditable suppressContentEditableWarning
                        onBlur={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const elem = u[activeSlide].elements.find((x) => x.id === el.id); if (elem) elem.content = e.currentTarget.textContent || ""; updateSlides(u); }}
                      /></pre>
                    </div>
                  ) : el.type === "divider" ? (
                    <div className="w-full h-full" style={{ background: el.color || el.gradient, borderRadius: el.borderRadius || 0 }} />
                  ) : el.svgContent ? (
                    <div className="w-full h-full flex items-center justify-center p-2 overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: el.colorOverride ? el.svgContent.replace(/fill="[^"]*"/g, `fill="${el.colorOverride}"`).replace(/stroke="[^"]*"/g, `stroke="${el.colorOverride}"`) : el.svgContent }} />
                  ) : el.type === "image" ? (
                    <div className="w-full h-full overflow-hidden relative" style={{
                      borderRadius: el.borderRadius || 0,
                      filter: [el.brightness !== undefined && el.brightness !== 100 ? `brightness(${el.brightness}%)` : "", el.contrast !== undefined && el.contrast !== 100 ? `contrast(${el.contrast}%)` : "", el.saturation !== undefined && el.saturation !== 100 ? `saturate(${el.saturation}%)` : "", el.filter || ""].filter(Boolean).join(" ") || undefined,
                      clipPath: el.shapeId && el.shapeId !== "rect" && el.shapeId !== "rounded-rect" ? `url(#shape-mask-${el.id})` : undefined
                    }}>
                      {el.crop ? (
                        <img src={el.content} alt={el.alt || ""} className="absolute" draggable={false}
                          style={{ left: -el.crop.x, top: -el.crop.y, width: el.crop.width, height: el.crop.height, objectFit: "none" }} />
                      ) : (
                        <img src={el.content} alt={el.alt || ""} className="w-full h-full object-cover" draggable={false} />
                      )}
                    </div>
                  ) : el.type === "video" ? (
                    <video src={el.content} autoPlay={el.autoPlay} loop={el.loop} muted={el.muted} controls={el.controls !== false}
                      className="w-full h-full object-cover rounded" />
                  ) : el.type === "audio" ? (
                    <div className="w-full h-full flex items-center gap-2 px-3 bg-[#1E1E1E] rounded-lg border border-white/10">
                      <button className="text-white/60 hover:text-white shrink-0" onClick={() => {
                        const aud = document.getElementById(`audio-${el.id}`) as HTMLAudioElement;
                        if (aud) { if (aud.paused) aud.play(); else aud.pause(); }
                      }}>
                        <Play className="w-4 h-4" />
                      </button>
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-sienna rounded-full transition-all" style={{ width: "0%" }} />
                      </div>
                      <span className="text-[10px] text-white/30 truncate max-w-[120px]">{el.content.split("/").pop()?.split("?")[0] || "audio"}</span>
                      <audio id={`audio-${el.id}`} src={el.content} autoPlay={el.autoPlay} loop={el.loop} />
                    </div>
                  ) : el.type === "gif" ? (
                    <img src={el.content} alt={el.alt || "GIF"} className="w-full h-full object-cover rounded" draggable={false}
                      style={el.speed ? { animationDuration: `${el.speed}s` } : undefined} />
                  ) : el.type === "youtube" ? (
                    <iframe src={parseYouTubeUrl(el.content)} className="w-full h-full" allowFullScreen />
                  ) : el.type === "line" ? (
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <line x1="0" y1="0" x2={el.lineEndX ?? el.width} y2={el.lineEndY ?? 0}
                        stroke={el.strokeColor || el.color} strokeWidth={el.strokeWidth || 3}
                        strokeDasharray={el.strokeDash || undefined}
                        markerStart={el.arrowStart === "arrow" ? "url(#arrowStart)" : undefined}
                        markerEnd={el.arrowEnd === "arrow" ? "url(#arrowEnd)" : undefined} />
                      <defs>
                        <marker id="arrowStart" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
                          <polygon points="8 0, 0 3, 8 6" fill={el.strokeColor || el.color} />
                        </marker>
                        <marker id="arrowEnd" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                          <polygon points="0 0, 8 3, 0 6" fill={el.strokeColor || el.color} />
                        </marker>
                      </defs>
                    </svg>
                  ) : el.type === "table" ? (
                    <table className="w-full h-full border-collapse" style={{ color: el.color }}>
                      <tbody>
                        {(el.tableData || Array.from({ length: el.tableRows || 3 }, () => Array(el.tableCols || 3).fill("") as string[])).map((row: string[], ri: number) => (
                          <tr key={ri} style={el.tableRowAlt && ri % 2 === 1 ? { backgroundColor: el.tableRowAlt } : undefined}>
                            {row.map((cell, ci) => (
                              <td key={ci}
                                className="border border-white/20 px-2 py-1 text-xs"
                                style={el.tableHeaderBg && ri === 0 ? { backgroundColor: el.tableHeaderBg, color: "#FFFFFF", fontWeight: "bold" } : undefined}
                                contentEditable suppressContentEditableWarning
                                 onBlur={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const elem = u[activeSlide].elements.find((x) => x.id === el.id); if (elem) { if (!elem.tableData) { elem.tableData = Array.from({ length: el.tableRows || 3 }, () => Array(el.tableCols || 3).fill("")); } (elem.tableData as string[][])[ri][ci] = e.currentTarget.textContent || ""; updateSlides(u); } }}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : el.type === "shape" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center"
                      style={{ background: el.gradient || "transparent", borderRadius: el.borderRadius || 0, border: el.strokeWidth ? `${el.strokeWidth}px ${el.strokeDash || "solid"} ${el.strokeColor || el.color}` : undefined }}>
                      <div dangerouslySetInnerHTML={{ __html: renderShapeSVG(el) }} className="flex-1 w-full h-full" />
                      {el.shapeText && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-sm font-medium"
                          style={{ color: "#FFFFFF", textShadow: "0 1px 4px rgba(0,0,0,0.5)", padding: "4px" }}>
                          {el.shapeText}
                        </div>
                      )}
                    </div>
                  ) : el.type === "latex" ? (
                    <div className="w-full h-full flex items-center justify-center overflow-x-auto" style={{ fontSize: el.fontSize || 24 }}
                      dangerouslySetInnerHTML={{ __html: (() => { try { return renderLatexToSVG(el.content); } catch { return `<div style="font-family:monospace;color:#4ade80;background:#1a1a1a;padding:8px;border-radius:4px;white-space:pre-wrap">${el.content.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>`; } })() }} />
                  ) : el.type === "mermaid" ? (
                    <MermaidPreview code={el.content} />
                  ) : (
                    <div className="w-full h-full rounded" style={{ background: el.color || el.gradient, borderRadius: el.borderRadius || 0, border: el.strokeWidth ? `${el.strokeWidth}px ${el.strokeDash || "solid"} ${el.strokeColor || el.color}` : undefined }} />
                  )}
                  {activeElement === el.id && !el.locked && (
                    <>
                      {/* Group badge */}
                      {el.groupId && (
                        <div className="absolute -top-6 right-0 text-[8px] bg-sienna/80 text-white px-1.5 py-0.5 rounded leading-none z-20">Group</div>
                      )}
                      <div onMouseDown={(e) => handleResizeMouseDown(e, el, "se")}
                        className="absolute bottom-0 right-0 w-3 h-3 bg-sienna rounded-full cursor-se-resize translate-x-1/2 translate-y-1/2 z-10" />
                      <div onMouseDown={(e) => handleResizeMouseDown(e, el, "sw")}
                        className="absolute bottom-0 left-0 w-3 h-3 bg-sienna rounded-full cursor-sw-resize -translate-x-1/2 translate-y-1/2 z-10" />
                      <div onMouseDown={(e) => handleResizeMouseDown(e, el, "ne")}
                        className="absolute top-0 right-0 w-3 h-3 bg-sienna rounded-full cursor-ne-resize translate-x-1/2 -translate-y-1/2 z-10" />
                      <div onMouseDown={(e) => handleResizeMouseDown(e, el, "nw")}
                        className="absolute top-0 left-0 w-3 h-3 bg-sienna rounded-full cursor-nw-resize -translate-x-1/2 -translate-y-1/2 z-10" />
                      <div onMouseDown={(e) => handleResizeMouseDown(e, el, "n")}
                        className="absolute top-0 left-1/2 w-3 h-3 bg-sienna/70 rounded-full cursor-n-resize -translate-x-1/2 -translate-y-1/2 z-10" />
                      <div onMouseDown={(e) => handleResizeMouseDown(e, el, "s")}
                        className="absolute bottom-0 left-1/2 w-3 h-3 bg-sienna/70 rounded-full cursor-s-resize -translate-x-1/2 translate-y-1/2 z-10" />
                      <div onMouseDown={(e) => handleResizeMouseDown(e, el, "e")}
                        className="absolute top-1/2 right-0 w-3 h-3 bg-sienna/70 rounded-full cursor-e-resize translate-x-1/2 -translate-y-1/2 z-10" />
                      <div onMouseDown={(e) => handleResizeMouseDown(e, el, "w")}
                        className="absolute top-1/2 left-0 w-3 h-3 bg-sienna/70 rounded-full cursor-w-resize -translate-x-1/2 -translate-y-1/2 z-10" />
                      {/* Rotation handle */}
                      <div onMouseDown={(e) => handleRotationMouseDown(e, el)}
                        className="absolute -top-6 left-1/2 w-4 h-4 bg-white border-2 border-sienna rounded-full cursor-grab -translate-x-1/2 z-10">
                        <div className="absolute top-4 left-1/2 w-px h-3 bg-sienna -translate-x-1/2" />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            {/* Connector lines SVG overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" style={{ overflow: "visible" }}>
              {(() => {
                const connectors: { start: SlideElement; end: SlideElement }[] = [];
                currentSlide.elements.forEach(el => {
                  if (el.connectorEndId) {
                    const endEl = currentSlide.elements.find(e => e.id === el.connectorEndId);
                    if (endEl) connectors.push({ start: el, end: endEl });
                  }
                });
                return connectors.map((conn, i) => {
                  const sx = conn.start.x + conn.start.width / 2;
                  const sy = conn.start.y + conn.start.height / 2;
                  const ex = conn.end.x + conn.end.width / 2;
                  const ey = conn.end.y + conn.end.height / 2;
                  const d = Math.max(30, Math.abs(ex - sx) * 0.5);
                  const cp1x = sx + (ex > sx ? d : -d);
                  const cp1y = sy;
                  const cp2x = ex + (ex > sx ? d : -d);
                  const cp2y = ey;
                  return (
                    <path key={i}
                      d={`M${sx},${sy} C${cp1x},${cp1y} ${cp2x},${cp2y} ${ex},${ey}`}
                      fill="none" stroke="#C4653A" strokeWidth="2" strokeLinecap="round"
                      strokeDasharray="4,3" />
                  );
                });
              })()}
            </svg>
            {/* Shape mask definitions for image clipping */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: 0, height: 0, overflow: "hidden" }}>
              <defs>
                {currentSlide.elements.filter(el => el.type === "image" && el.shapeId && el.shapeId !== "rect" && el.shapeId !== "rounded-rect").map((el) => {
                  const shape = getShapeById(el.shapeId!);
                  return shape ? <clipPath key={el.id} id={`shape-mask-${el.id}`}><path d={shape.path} /></clipPath> : null;
                })}
              </defs>
            </svg>
            </div>{/* end canvas ref div */}
              </div>{/* end left-ruler + canvas flex row */}
            </div>{/* end top-ruler flex-col wrapper */}
          </div>{/* end canvas centering div */}

          {/* Animation panel (overlay/tray) */}
          {showAnimations && activeEl && (
            <div className="bg-[#231F1D] border-t border-white/5 flex flex-col shrink-0" style={{ maxHeight: "240px" }}>
              <div className="px-4 py-1.5 border-b border-white/5 flex items-center justify-between shrink-0">
                <span className="text-xs font-medium text-white/40">Animation</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowMotionPath(!showMotionPath)}
                    className={`text-[10px] px-2 py-0.5 rounded transition-all ${showMotionPath ? "bg-sienna text-white" : "text-white/30 hover:text-white/60"}`}>
                    Motion Path
                  </button>
                  <button onClick={() => { if (activeEl) setAnimation(activeEl.id, null); }}
                    className="text-[10px] text-white/30 hover:text-red-400 transition-colors">Remove</button>
                </div>
              </div>
              {showMotionPath ? (
                <div className="flex-1 overflow-y-auto">
                  <MotionPathEditor onApply={(path, duration) => {
                    addAnimation(activeEl.id, { type: "motion-path", duration, delay: 0, easing: "ease-out", motionPath: path });
                    setShowMotionPath(false);
                  }} />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                  {/* Animation type selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-wrap">
                    {animationNames.map((a) => {
                      const anims = getAllElementAnimations(activeEl);
                      const isActive = anims.length > 0 && anims[anims.length - 1]?.type === a.value;
                      return (
                        <button key={a.value} onClick={() => addAnimation(activeEl.id, { type: a.value, duration: 500, delay: 0, easing: "ease-out" })}
                          className={`text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                            isActive ? "bg-sienna text-white" : "text-white/50 hover:bg-white/5 hover:text-white/70"
                          }`}>
                          {a.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Multi-animation list */}
                  {(() => {
                    const anims = getAllElementAnimations(activeEl);
                    if (anims.length === 0) return (
                      <div className="text-[10px] text-white/20 text-center py-4">Select an animation type above to add</div>
                    );
                    return (
                      <div className="space-y-1">
                        {anims.map((anim, idx) => (
                          <div key={idx} className="bg-[#1A1715] rounded-lg p-2 space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <GripVertical className="w-3 h-3 text-white/20 shrink-0 cursor-grab" />
                                <span className="text-[10px] font-medium text-white/60 truncate">{animationNames.find(n => n.value === anim.type)?.label || anim.type}</span>
                              </div>
                              <button onClick={() => removeAnimation(activeEl.id, idx)}
                                className="text-white/20 hover:text-red-400 transition-colors shrink-0">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                              {/* Duration */}
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] text-white/20 w-10">Duration</span>
                                <input type="range" min="100" max="5000" step="100" value={anim.duration}
                                  onChange={(e) => updateAnimation(activeEl.id, idx, { duration: parseInt(e.target.value) })}
                                  className="flex-1 accent-sienna h-0.5" />
                                <span className="text-[8px] text-white/20 w-8 text-right">{anim.duration}ms</span>
                              </div>
                              {/* Delay */}
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] text-white/20 w-10">Delay</span>
                                <input type="range" min="0" max="5000" step="100" value={anim.delay}
                                  onChange={(e) => updateAnimation(activeEl.id, idx, { delay: parseInt(e.target.value) })}
                                  className="flex-1 accent-sienna h-0.5" />
                                <span className="text-[8px] text-white/20 w-8 text-right">{anim.delay}ms</span>
                              </div>
                            </div>
                            {/* Timing controls */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Easing */}
                              <select value={anim.easing} onChange={(e) => updateAnimation(activeEl.id, idx, { easing: e.target.value })}
                                className="bg-[#2A2523] text-white/60 text-[9px] px-1.5 py-0.5 rounded border border-white/5 outline-none">
                                {easingOptions.map((o) => (
                                  <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                              {/* Direction */}
                              <select value={anim.direction || "normal"} onChange={(e) => updateAnimation(activeEl.id, idx, { direction: e.target.value as any })}
                                className="bg-[#2A2523] text-white/60 text-[9px] px-1.5 py-0.5 rounded border border-white/5 outline-none">
                                {directionOptions.map((o) => (
                                  <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                              {/* Fill mode */}
                              <select value={anim.fillMode || "both"} onChange={(e) => updateAnimation(activeEl.id, idx, { fillMode: e.target.value as any })}
                                className="bg-[#2A2523] text-white/60 text-[9px] px-1.5 py-0.5 rounded border border-white/5 outline-none">
                                {fillModeOptions.map((o) => (
                                  <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                              {/* Iteration count */}
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] text-white/20">Loop</span>
                                <input type="number" min="1" max="10" value={anim.iterationCount === "infinite" ? 1 : (anim.iterationCount || 1)}
                                  onChange={(e) => updateAnimation(activeEl.id, idx, { iterationCount: parseInt(e.target.value) || 1 })}
                                  className="w-6 bg-[#2A2523] text-white/60 text-[9px] px-1 py-0.5 rounded border border-white/5 outline-none text-center" />
                                <button onClick={() => updateAnimation(activeEl.id, idx, { iterationCount: anim.iterationCount === "infinite" ? 1 : "infinite" })}
                                  className={`text-[8px] px-1 py-0.5 rounded ${anim.iterationCount === "infinite" ? "text-sienna bg-sienna/10" : "text-white/20"} transition-all`}>
                                  ∞
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* Add animation button */}
                        <button onClick={() => {
                          const lastType = anims[anims.length - 1]?.type || "fade-in";
                          addAnimation(activeEl.id, { type: lastType, duration: 500, delay: 0, easing: "ease-out" });
                        }} className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors w-full justify-center py-1">
                          <Plus className="w-3 h-3" /> Add Animation
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Speaker notes panel */}
          {showNotes && (
            <div className="h-28 bg-[#231F1D] border-t border-white/5 flex flex-col shrink-0">
              <div className="px-4 py-1.5 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-medium text-white/40">Speaker Notes</span>
                <span className="text-[10px] text-white/20">Private speaker notes</span>
              </div>
              <textarea value={currentSlide.notes || ""} placeholder="Add notes for this slide..."
                onChange={(e) => { const updated = JSON.parse(JSON.stringify(slides)) as Slide[]; updated[activeSlide].notes = e.target.value; setSlides(updated); }}
                className="flex-1 bg-transparent text-sm text-white/60 p-3 resize-none outline-none placeholder:text-white/20" />
            </div>
          )}

          <div className="h-8 bg-[#231F1D] border-t border-white/5 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3 text-[11px] text-white/25">
              <span>Slide {activeSlide + 1} of {slides.length}</span>
              {wordCount > 0 && <span className="text-white/20">{wordCount} words</span>}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white/25">
              <span>720 x 405</span>
              <button onClick={() => setShowPluginManager(true)} className="text-white/30 hover:text-white/60 transition-colors" title="Plugins"><Puzzle className="w-3 h-3 inline" /> Plugins</button>
              <button onClick={() => setShowHelp(!showHelp)} className="text-white/30 hover:text-white/60 transition-colors" title="Keyboard Shortcuts">? Help</button>
            </div>
          </div>
        </div>

        {/* Properties panel - right side */}
        <div className="w-64 bg-[#231F1D] border-l border-white/10 flex flex-col shrink-0 overflow-y-auto">
          {showSpellCheck ? (
            <SpellCheckPanel
              elements={currentSlide.elements.map(el => ({ id: el.id, type: el.type, content: el.content }))}
              onFix={(elId, original, replacement) => {
                const updated = JSON.parse(JSON.stringify(slides)) as Slide[];
                const el = updated[activeSlide].elements.find((x: SlideElement) => x.id === elId);
                if (!el) return;
                el.content = el.content.replace(original, replacement);
                updateSlides(updated);
              }}
              onIgnore={() => {}}
            />
          ) : showAccessibility ? (
            <AccessibilityPanel
              issues={a11yIssues}
              onFix={(issue) => {
                if (issue.fix) issue.fix();
                setA11yIssues(prev => prev.filter(i => i !== issue));
              }}
              onFixAll={() => {
                for (const issue of a11yIssues) {
                  if (issue.fix) issue.fix();
                }
                setA11yIssues([]);
              }}
            />
          ) : (<>
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
                  onBold={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.fontWeight = e.fontWeight === "bold" ? "normal" : "bold"; updateSlides(u); } }}
                  onItalic={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.fontStyle = e.fontStyle === "italic" ? "normal" : "italic"; updateSlides(u); } }}
                  onUnderline={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.textDecoration = e.textDecoration === "underline" ? undefined : "underline"; updateSlides(u); } }}
                  onAlign={(a) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.textAlign = a; updateSlides(u); } }}
                  onBulletList={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { const lines = e.content.split("\n"); const isList = lines.every(l => l.startsWith("• ")); e.content = isList ? lines.map(l => l.replace(/^• /, "")).join("\n") : lines.map(l => "• " + l).join("\n"); updateSlides(u); } }}
                  onNumberedList={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { const lines = e.content.split("\n"); const isList = lines.every(l => /^\d+\.\s/.test(l)); e.content = isList ? lines.map(l => l.replace(/^\d+\.\s*/, "")).join("\n") : lines.map((l, i) => `${i + 1}. ${l}`).join("\n"); updateSlides(u); } }}
                  onFontSize={(d) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.fontSize = Math.max(8, Math.min(120, (e.fontSize || 18) + d)); updateSlides(u); } }}
                  onFontFamily={(f) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.fontFamily = f; updateSlides(u); } }}
                  onIndent={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { const lines = e.content.split("\n"); e.content = lines.map(l => l.startsWith("  ") ? l : "  " + l).join("\n"); updateSlides(u); } }}
                  onOutdent={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { const lines = e.content.split("\n"); e.content = lines.map(l => l.startsWith("  ") ? l.slice(2) : l).join("\n"); updateSlides(u); } }}
                  fontSize={activeEl.fontSize}
                  fontFamily={activeEl.fontFamily}
                />
              )}

              {/* Color */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Color</label>
                {brandColors.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {brandColors.map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-sm border border-white/10 cursor-pointer hover:scale-110 transition-transform"
                        style={{ background: c }}
                        onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.color = c; updateSlides(u); } }} />
                    ))}
                  </div>
                )}
                <ColorPicker value={activeEl.color || "#1C1917"} onChange={(c) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const e = u[activeSlide].elements.find(x => x.id === activeElement); if (e) { e.color = c; updateSlides(u); } }} />
              </div>

              {/* Hyperlink */}
              {(activeEl.type === "text" || activeEl.type === "image" || activeEl.type === "shape" || activeEl.type === "video" || activeEl.type === "audio" || activeEl.type === "gif") && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Hyperlink</label>
                  <input type="text" value={activeEl.href || ""} placeholder="https://..."
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.href = e.target.value || undefined; setSlides(u); } }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 outline-none" />
                </div>
              )}

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

              {/* Letter Spacing (for text) */}
              {activeEl.type === "text" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Letter Spacing</label>
                  <input type="range" min="-2" max="10" step="0.5" value={activeEl.letterSpacing ?? 0}
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.letterSpacing = parseFloat(e.target.value); setSlides(u); } }}
                    className="w-full accent-sienna" />
                  <span className="text-[10px] text-white/30">{activeEl.letterSpacing ?? 0}px</span>
                </div>
              )}

              {/* Line Height (for text) */}
              {activeEl.type === "text" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Line Height</label>
                  <input type="range" min="0.5" max="3" step="0.1" value={activeEl.lineHeight ?? 1.5}
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.lineHeight = parseFloat(e.target.value); setSlides(u); } }}
                    className="w-full accent-sienna" />
                  <span className="text-[10px] text-white/30">{activeEl.lineHeight ?? 1.5}</span>
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

              {/* Stroke controls for shapes/lines */}
              {(activeEl.type === "shape" || activeEl.type === "line") && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Stroke</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input type="color" value={activeEl.strokeColor || activeEl.color || "#C4653A"}
                        onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.strokeColor = e.target.value; updateSlides(u); } }}
                        className="w-full h-7 rounded cursor-pointer bg-transparent border border-white/10" />
                    </div>
                    <div>
                      <input type="number" min="0" max="20" value={activeEl.strokeWidth || 0}
                        onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.strokeWidth = parseInt(e.target.value) || 0; updateSlides(u); } }}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/60 outline-none" />
                    </div>
                  </div>
                  <select value={activeEl.strokeDash || "solid"} onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.strokeDash = e.target.value === "solid" ? undefined : e.target.value; updateSlides(u); } }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/60 outline-none mt-1">
                    <option value="solid">Solid</option>
                    <option value="5,5">Dashed</option>
                    <option value="2,4">Dotted</option>
                    <option value="10,5">Long Dash</option>
                  </select>
                </div>
              )}

              {/* Arrow options for lines */}
              {activeEl.type === "line" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Arrows</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={activeEl.arrowStart || "none"} onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.arrowStart = e.target.value === "none" ? undefined : e.target.value; updateSlides(u); } }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/60 outline-none">
                      <option value="none">Start: None</option>
                      <option value="arrow">Start: Arrow</option>
                    </select>
                    <select value={activeEl.arrowEnd || "none"} onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.arrowEnd = e.target.value === "none" ? undefined : e.target.value; updateSlides(u); } }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/60 outline-none">
                      <option value="none">End: None</option>
                      <option value="arrow">End: Arrow</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div><span className="text-[10px] text-white/20">End X</span>
                      <input type="number" value={activeEl.lineEndX || 0}
                        onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.lineEndX = parseInt(e.target.value) || 0; setSlides(u); } }}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/60 outline-none" /></div>
                    <div><span className="text-[10px] text-white/20">End Y</span>
                      <input type="number" value={activeEl.lineEndY || 0}
                        onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.lineEndY = parseInt(e.target.value) || 0; setSlides(u); } }}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/60 outline-none" /></div>
                  </div>
                </div>
              )}

              {/* Shadow effect */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Shadow</label>
                <select value={activeEl.shadow || "none"} onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.shadow = e.target.value === "none" ? undefined : e.target.value; updateSlides(u); } }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/60 outline-none">
                  <option value="none">None</option>
                  <option value="0 2px 8px rgba(0,0,0,0.15)">Soft</option>
                  <option value="0 4px 16px rgba(0,0,0,0.2)">Medium</option>
                  <option value="0 8px 32px rgba(0,0,0,0.3)">Strong</option>
                  <option value="0 0 20px rgba(196,101,58,0.3)">Glow (Sienna)</option>
                  <option value="0 0 20px rgba(37,99,235,0.3)">Glow (Blue)</option>
                </select>
              </div>

              {/* Flip controls */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Flip</label>
                <div className="flex gap-2">
                  <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.flipH = !el.flipH; updateSlides(u); } }}
                    className={`flex-1 text-[11px] py-1.5 rounded-lg transition-all ${activeEl.flipH ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40 hover:text-white/70"}`}>Flip H</button>
                  <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.flipV = !el.flipV; updateSlides(u); } }}
                    className={`flex-1 text-[11px] py-1.5 rounded-lg transition-all ${activeEl.flipV ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40 hover:text-white/70"}`}>Flip V</button>
                </div>
              </div>

              {/* Gradient for shapes */}
              {activeEl.type === "shape" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Gradient</label>
                  <input type="text" value={activeEl.gradient || ""} placeholder="e.g. linear-gradient(45deg, #C4653A, #1C1917)"
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.gradient = e.target.value || undefined; setSlides(u); } }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 outline-none" />
                </div>
              )}

              {/* Shape text */}
              {activeEl.type === "shape" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Shape Text</label>
                  <input type="text" value={activeEl.shapeText || ""} placeholder="Add text on shape"
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.shapeText = e.target.value || undefined; setSlides(u); } }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 outline-none" />
                </div>
              )}

              {/* Chart data editor */}
              {activeEl.type === "shape" && activeEl.chartType && (
                <div>
                  <button onClick={() => { setChartEditorData(activeEl.chartData ? { labels: [...activeEl.chartData.labels], values: [...activeEl.chartData.values], colors: [...activeEl.chartData.colors] } : null); setShowChartEditor(true); }}
                    className="w-full text-[11px] bg-sienna/20 text-sienna py-1.5 rounded-lg hover:bg-sienna/30 transition-all">Edit Chart Data</button>
                </div>
              )}

              {/* Lock aspect ratio */}
              {(activeEl.type === "image" || activeEl.type === "shape" || activeEl.svgContent) && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider">Lock Aspect Ratio</span>
                  <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.lockAspectRatio = !el.lockAspectRatio; setSlides(u); } }}
                    className={`text-[11px] px-3 py-1 rounded-lg transition-all ${activeEl.lockAspectRatio ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40"}`}>
                    {activeEl.lockAspectRatio ? "Locked" : "Unlocked"}
                  </button>
                </div>
              )}

              {/* Crop for images */}
              {activeEl.type === "image" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Crop</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(["x", "y", "width", "height"] as const).map((k) => (
                      <div key={k}><span className="text-[10px] text-white/20">{k}</span>
                        <input type="number" value={activeEl.crop?.[k] ?? (k === "width" ? activeEl.width : k === "height" ? activeEl.height : 0)}
                          onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { if (!el.crop) el.crop = { x: 0, y: 0, width: el.width, height: el.height }; el.crop[k] = parseInt(e.target.value) || 0; setSlides(u); } }}
                          className="w-full bg-white/5 border border-white/10 rounded px-1 py-1 text-[10px] text-white/60 outline-none" /></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code language selector */}
              {activeEl.type === "code" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Language</label>
                  <select value={activeEl.codeLanguage || "plaintext"} onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.codeLanguage = e.target.value === "plaintext" ? undefined : e.target.value; updateSlides(u); } }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/60 outline-none">
                    {["plaintext", "javascript", "typescript", "python", "html", "css", "json", "sql", "bash", "java", "cpp", "csharp", "rust", "go", "ruby", "php", "swift", "kotlin"].map(l => (
                      <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* LaTeX properties */}
              {activeEl.type === "latex" && (
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Equation (LaTeX)</label>
                    <textarea value={activeEl.content} placeholder="\\frac{a}{b}"
                      onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.content = e.target.value; setSlides(u); } }}
                      className="w-full bg-[#1A1715] border border-white/10 rounded-lg px-3 py-2 text-xs text-green-400 font-mono outline-none resize-none" style={{ minHeight: 60 }} />
                  </div>
                  <button onClick={() => { setEditingLatexId(activeElement); setShowLatexEditor(true); }}
                    className="w-full text-[11px] bg-sienna/20 text-sienna py-1.5 rounded-lg hover:bg-sienna/30 transition-all">Edit in LaTeX Editor</button>
                  <div>
                    <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Font Size</label>
                    <input type="range" min="12" max="72" value={activeEl.fontSize || 24}
                      onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.fontSize = parseInt(e.target.value); setSlides(u); } }}
                      className="w-full accent-sienna" />
                    <span className="text-[10px] text-white/30">{activeEl.fontSize || 24}px</span>
                  </div>
                </div>
              )}

              {/* Mermaid properties */}
              {activeEl.type === "mermaid" && (
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Diagram Source</label>
                    <textarea value={activeEl.content} placeholder="graph TD&#10;  A[Start] --> B[End]"
                      onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.content = e.target.value; setSlides(u); } }}
                      className="w-full bg-[#1A1715] border border-white/10 rounded-lg px-3 py-2 text-xs text-green-400 font-mono outline-none resize-none" style={{ minHeight: 80 }} />
                  </div>
                  <button onClick={() => { setEditingMermaidId(activeElement); setShowMermaidEditor(true); }}
                    className="w-full text-[11px] bg-sienna/20 text-sienna py-1.5 rounded-lg hover:bg-sienna/30 transition-all">Edit in Mermaid Editor</button>
                </div>
              )}

              {/* Text highlight */}
              {activeEl.type === "text" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Text Highlight</label>
                  <div className="flex gap-2">
                    <input type="color" value={activeEl.highlight || "#FFEB3B"}
                      onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.highlight = e.target.value === "#FFEB3B" && !activeEl.highlight ? undefined : e.target.value; updateSlides(u); } }}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/10" />
                    <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.highlight = undefined; updateSlides(u); } }}
                      className="text-[10px] text-white/30 hover:text-white/60 px-2">Clear</button>
                  </div>
                </div>
              )}

              {/* Table controls */}
              {activeEl.type === "table" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Table Size</label>
                  <div className="flex gap-2">
                    <div><span className="text-[10px] text-white/20">Rows</span>
                      <input type="number" min="1" max="20" value={activeEl.tableRows || 3}
                        onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { const r = parseInt(e.target.value) || 1; el.tableRows = r; el.tableData = Array.from({ length: r }, (_, ri) => Array(el.tableCols || 3).fill(el.tableData?.[ri]?.[0] || "")); setSlides(u); } }}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/60 outline-none" /></div>
                    <div><span className="text-[10px] text-white/20">Cols</span>
                      <input type="number" min="1" max="20" value={activeEl.tableCols || 3}
                        onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { const c = parseInt(e.target.value) || 1; el.tableCols = c; el.tableData = (el.tableData || Array.from({ length: el.tableRows || 3 }, () => Array(c).fill(""))).map(row => { while (row.length < c) row.push(""); return row.slice(0, c); }); setSlides(u); } }}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/60 outline-none" /></div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">Header Row</span>
                      <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.tableHeaderBg = el.tableHeaderBg ? undefined : (el.color || "#C4653A"); setSlides(u); } }}
                        className={`text-[10px] px-2 py-0.5 rounded transition-all ${activeEl.tableHeaderBg ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40"}`}>
                        {activeEl.tableHeaderBg ? "On" : "Off"}
                      </button>
                    </div>
                  </div>
                  {activeEl.tableHeaderBg && (
                    <div className="mt-1">
                      <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Header Color</label>
                      <input type="color" value={activeEl.tableHeaderBg || "#C4653A"}
                        onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.tableHeaderBg = e.target.value; setSlides(u); } }}
                        className="w-full h-7 rounded cursor-pointer bg-transparent border border-white/10" />
                    </div>
                  )}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">Alternating Rows</span>
                      <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.tableRowAlt = el.tableRowAlt ? undefined : "#2A2523"; setSlides(u); } }}
                        className={`text-[10px] px-2 py-0.5 rounded transition-all ${activeEl.tableRowAlt ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40"}`}>
                        {activeEl.tableRowAlt ? "On" : "Off"}
                      </button>
                    </div>
                  </div>
                  {activeEl.tableRowAlt && (
                    <div className="mt-1">
                      <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Alt Row Color</label>
                      <input type="color" value={activeEl.tableRowAlt || "#2A2523"}
                        onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.tableRowAlt = e.target.value; setSlides(u); } }}
                        className="w-full h-7 rounded cursor-pointer bg-transparent border border-white/10" />
                    </div>
                  )}
                </div>
              )}

              {/* Image adjustments */}
              {activeEl.type === "image" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Brightness</label>
                  <input type="range" min="0" max="200" value={activeEl.brightness ?? 100}
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.brightness = parseInt(e.target.value); setSlides(u); } }}
                    className="w-full accent-sienna" />
                  <span className="text-[10px] text-white/30">{activeEl.brightness ?? 100}%</span>
                </div>
              )}
              {activeEl.type === "image" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Contrast</label>
                  <input type="range" min="0" max="200" value={activeEl.contrast ?? 100}
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.contrast = parseInt(e.target.value); setSlides(u); } }}
                    className="w-full accent-sienna" />
                  <span className="text-[10px] text-white/30">{activeEl.contrast ?? 100}%</span>
                </div>
              )}
              {activeEl.type === "image" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Saturation</label>
                  <input type="range" min="0" max="300" value={activeEl.saturation ?? 100}
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.saturation = parseInt(e.target.value); setSlides(u); } }}
                    className="w-full accent-sienna" />
                  <span className="text-[10px] text-white/30">{activeEl.saturation ?? 100}%</span>
                </div>
              )}
              {activeEl.type === "image" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Image Filter</label>
                  <select value={activeEl.filter || "none"} onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.filter = e.target.value === "none" ? undefined : e.target.value; updateSlides(u); } }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/60 outline-none mb-2">
                    <option value="none">Original</option>
                    <option value="grayscale(100%)">Grayscale</option>
                    <option value="sepia(80%)">Sepia</option>
                    <option value="blur(2px)">Blur</option>
                    <option value="hue-rotate(90deg)">Hue Shift</option>
                    <option value="invert(100%)">Invert</option>
                  </select>
                </div>
              )}

              {/* AI Image */}
              {activeEl.type === "image" && (
                <div>
                  <button onClick={() => setShowAIImage(true)}
                    className="w-full text-[11px] bg-sienna/20 text-sienna py-1.5 rounded-lg hover:bg-sienna/30 transition-all flex items-center justify-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" /> AI Generate Image
                  </button>
                </div>
              )}
              {activeEl.type === "image" && (
                <div>
                  <button onClick={() => setShowBackgroundRemover(true)}
                    className="w-full text-[11px] bg-white/5 text-white/50 py-1.5 rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Remove Background
                  </button>
                </div>
              )}

              {/* Shape mask for images */}
              {activeEl.type === "image" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Shape Mask</label>
                  <div className="grid grid-cols-5 gap-1">
                    <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.shapeId = undefined; setSlides(u); } }}
                      className={`p-1 rounded text-[8px] transition-all ${!activeEl.shapeId || activeEl.shapeId === "rect" ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>None</button>
                    {["circle", "diamond", "star", "heart", "hexagon", "pentagon", "octagon", "cloud", "teardrop", "ribbon"].map((sid) => {
                      const s = getShapeById(sid);
                      return s ? (
                        <button key={sid} onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.shapeId = sid; setSlides(u); } }}
                          className={`p-1 rounded transition-all ${activeEl.shapeId === sid ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40 hover:bg-white/10"}`} title={s.name}>
                          <svg viewBox="0 0 100 100" className="w-4 h-4 mx-auto" xmlns="http://www.w3.org/2000/svg"><path d={s.path} fill="currentColor" /></svg>
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Alt text */}
              {activeEl.type === "image" && (
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Alt Text</label>
                  <input type="text" value={activeEl.alt || ""}
                    onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.alt = e.target.value; setSlides(u); } }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 outline-none" />
                </div>
              )}

              {/* Video properties */}
              {activeEl.type === "video" && (
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Video URL</label>
                    <input type="text" value={activeEl.content || ""} placeholder="https://example.com/video.mp4"
                      onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.content = e.target.value; setSlides(u); } }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30">Auto Play</span>
                      <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.autoPlay = !el.autoPlay; setSlides(u); } }}
                        className={`text-[11px] px-2 py-0.5 rounded transition-all ${activeEl.autoPlay ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40"}`}>{activeEl.autoPlay ? "On" : "Off"}</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30">Loop</span>
                      <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.loop = !el.loop; setSlides(u); } }}
                        className={`text-[11px] px-2 py-0.5 rounded transition-all ${activeEl.loop ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40"}`}>{activeEl.loop ? "On" : "Off"}</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30">Muted</span>
                      <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.muted = !el.muted; setSlides(u); } }}
                        className={`text-[11px] px-2 py-0.5 rounded transition-all ${activeEl.muted ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40"}`}>{activeEl.muted ? "On" : "Off"}</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30">Controls</span>
                      <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.controls = el.controls === false ? true : false; setSlides(u); } }}
                        className={`text-[11px] px-2 py-0.5 rounded transition-all ${activeEl.controls !== false ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40"}`}>{activeEl.controls !== false ? "Show" : "Hide"}</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio properties */}
              {activeEl.type === "audio" && (
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Audio URL</label>
                    <input type="text" value={activeEl.content || ""} placeholder="https://example.com/audio.mp3"
                      onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.content = e.target.value; setSlides(u); } }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30">Auto Play</span>
                      <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.autoPlay = !el.autoPlay; setSlides(u); } }}
                        className={`text-[11px] px-2 py-0.5 rounded transition-all ${activeEl.autoPlay ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40"}`}>{activeEl.autoPlay ? "On" : "Off"}</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30">Loop</span>
                      <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.loop = !el.loop; setSlides(u); } }}
                        className={`text-[11px] px-2 py-0.5 rounded transition-all ${activeEl.loop ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40"}`}>{activeEl.loop ? "On" : "Off"}</button>
                    </div>
                  </div>
                </div>
              )}

              {/* GIF properties */}
              {activeEl.type === "gif" && (
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">GIF URL</label>
                    <input type="text" value={activeEl.content || ""} placeholder="https://example.com/animation.gif"
                      onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.content = e.target.value; setSlides(u); } }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Speed</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="0.5" max="3" step="0.25" value={activeEl.speed || 1}
                        onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.speed = parseFloat(e.target.value); setSlides(u); } }}
                        className="flex-1 accent-sienna" />
                      <span className="text-[10px] text-white/30 w-8">{activeEl.speed || 1}x</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SVG properties */}
              {activeEl.svgContent && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30">Maintain Aspect Ratio</span>
                    <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.maintainAspectRatio = !el.maintainAspectRatio; setSlides(u); } }}
                      className={`text-[11px] px-2 py-0.5 rounded transition-all ${activeEl.maintainAspectRatio ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40"}`}>{activeEl.maintainAspectRatio ? "On" : "Off"}</button>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Color Override (mono SVGs)</label>
                    <input type="color" value={activeEl.colorOverride || "#C4653A"}
                      onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; const el = u[activeSlide].elements.find(x => x.id === activeElement); if (el) { el.colorOverride = e.target.value; setSlides(u); } }}
                      className="w-full h-7 rounded cursor-pointer bg-transparent border border-white/10" />
                  </div>
                </div>
              )}

              {/* Z-Index */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Layer</label>
                <div className="flex gap-1">
                  <button onClick={bringToFront} className="flex-1 flex items-center justify-center gap-1 text-[11px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 rounded-lg py-1.5 transition-all"><ArrowUp className="w-3 h-3" /> Front</button>
                  <button onClick={sendToBack} className="flex-1 flex items-center justify-center gap-1 text-[11px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 rounded-lg py-1.5 transition-all"><ArrowDown className="w-3 h-3" /> Back</button>
                  <button onClick={duplicateElement} className="flex-1 flex items-center justify-center gap-1 text-[11px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 rounded-lg py-1.5 transition-all"><Copy className="w-3 h-3" /> Clone</button>
                </div>
              </div>
              {/* Connector removal */}
              {activeEl && (activeEl.connectorEndId || currentSlide.elements.some(e => e.connectorEndId === activeEl.id)) && (
                <div>
                  <button onClick={() => {
                    const u = JSON.parse(JSON.stringify(slides)) as Slide[];
                    const el = u[activeSlide].elements.find(x => x.id === activeElement);
                    if (el) el.connectorEndId = undefined;
                    u[activeSlide].elements.forEach(e => { if (e.connectorEndId === activeElement) e.connectorEndId = undefined; if (e.connectorStartId === activeElement) e.connectorStartId = undefined; });
                    updateSlides(u);
                  }} className="w-full text-[10px] text-red-400/70 hover:text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg py-1.5 transition-all">Remove Connector</button>
                </div>
              )}

              {/* Copy/Paste between slides */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Cross-Slide</label>
                <div className="flex gap-1">
                  <button onClick={copySelectedToClipboard} disabled={!activeElement && selectedElements.length === 0}
                    className="flex-1 text-[11px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 rounded-lg py-1.5 transition-all disabled:opacity-30">Copy Elements</button>
                  <button onClick={pasteFromClipboard} disabled={!slideClipboard || slideClipboard.length === 0}
                    className="flex-1 text-[11px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 rounded-lg py-1.5 transition-all disabled:opacity-30">Paste Here</button>
                </div>
              </div>
              {/* Group/Ungroup */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Group</label>
                <div className="flex gap-1">
                  <button onClick={groupElements} disabled={selectedElements.length < 2 && !activeEl?.groupId}
                    className="flex-1 text-[11px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 rounded-lg py-1.5 transition-all disabled:opacity-30">Group</button>
                  <button onClick={ungroupElements} disabled={!activeEl?.groupId && !currentSlide.elements.some(e => e.groupId)}
                    className="flex-1 text-[11px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 rounded-lg py-1.5 transition-all disabled:opacity-30">Ungroup</button>
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

              {/* Brand Kit */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/30 uppercase tracking-wider">Brand Kit</label>
                  <button onClick={() => setShowBrandKit(!showBrandKit)} className="text-[10px] text-sienna/70 hover:text-sienna transition-colors">
                    {showBrandKit ? "Done" : "Edit"}
                  </button>
                </div>
                {showBrandKit && (
                  <div className="space-y-2 mb-2">
                    <div className="flex flex-wrap gap-1.5">
                      {brandColors.map((c, i) => (
                        <div key={i} className="relative group">
                          <div className="w-6 h-6 rounded border border-white/10 cursor-pointer"
                            style={{ background: c }}
                            onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; u[activeSlide].background = c; updateSlides(u); }} />
                          <button onClick={() => { setBrandColors(prev => prev.filter((_, j) => j !== i)); }}
                            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white hidden group-hover:flex items-center justify-center"
                            style={{ fontSize: "6px", lineHeight: "1" }}>×</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <input type="color" className="w-8 h-7 rounded cursor-pointer bg-transparent border border-white/10 shrink-0"
                        onChange={(e) => { const c = e.target.value; if (!brandColors.includes(c)) setBrandColors(prev => [...prev, c]); }} />
                      <input type="text" placeholder="#hex or paste color" maxLength={7}
                        onKeyDown={(e) => { if (e.key === "Enter") { const c = (e.currentTarget as HTMLInputElement).value; if (/^#[0-9A-Fa-f]{6}$/.test(c) && !brandColors.includes(c)) { setBrandColors(prev => [...prev, c]); (e.currentTarget as HTMLInputElement).value = ""; } } }}
                        className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white/60 outline-none" />
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {brandColors.slice(0, 10).map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded border border-white/10 cursor-pointer hover:scale-110 transition-transform"
                      style={{ background: c }}
                      onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; u[activeSlide].background = c; updateSlides(u); }} />
                  ))}
                </div>
              </div>

              {/* Background */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Background Color</label>
                <ColorPicker value={currentSlide.background} onChange={(c) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; u[activeSlide].background = c; updateSlides(u); }} />
              </div>

              {/* Background Image */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Background Image URL</label>
                <input type="text" value={currentSlide.backgroundImage || ""} placeholder="https://..." 
                  onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; u[activeSlide].backgroundImage = e.target.value || undefined; updateSlides(u); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 outline-none" />
                {currentSlide.backgroundImage && (
                  <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; u[activeSlide].backgroundImage = undefined; updateSlides(u); }}
                    className="text-[10px] text-red-400/70 hover:text-red-400 mt-1">Remove Image</button>
                )}
              </div>

              {/* Background Gradient */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Background Gradient</label>
                <input type="text" value={currentSlide.backgroundGradient || ""} placeholder="e.g. linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; u[activeSlide].backgroundGradient = e.target.value || undefined; updateSlides(u); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 outline-none" />
              </div>

              {/* Slide Section */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Section</label>
                <input type="text" value={currentSlide.section || ""} placeholder="e.g. Introduction"
                  onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; u[activeSlide].section = e.target.value || undefined; updateSlides(u); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 outline-none" />
              </div>

              {/* Slide Number */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">Slide Number</span>
                <button onClick={() => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; u[activeSlide].showSlideNumber = !u[activeSlide].showSlideNumber; updateSlides(u); }}
                  className={`text-[11px] px-3 py-1 rounded-lg transition-all ${currentSlide.showSlideNumber ? "bg-sienna/20 text-sienna" : "bg-white/5 text-white/40"}`}>
                  {currentSlide.showSlideNumber ? "Show" : "Hide"}
                </button>
              </div>

              {/* Slide Transition */}
              <div>
                <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Transition</label>
                <select value={currentSlide.transition || "none"}
                  onChange={(e) => { const u = JSON.parse(JSON.stringify(slides)) as Slide[]; u[activeSlide].transition = e.target.value as Slide["transition"]; updateSlides(u); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none">
                  <option value="none">None</option>
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom</option>
                  <option value="morph">Morph</option>
                </select>
              </div>
            </div>
          )}
          </>)}
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
              navigator.clipboard.writeText(JSON.stringify(el, null, 2)).catch(() => {});
            }
          }}
          onDelete={() => deleteElement(contextMenu.elId)}
          onBringFront={bringToFront}
          onSendBack={sendToBack}
          onDuplicate={duplicateElement}
        />
      )}

      {/* Video Dialog */}
      {showVideoDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => { setShowVideoDialog(false); setVideoUrl(""); }}>
          <div className="bg-[#2A2523] rounded-xl p-6 w-96 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-white mb-4">Insert Video</h3>
            <label className="text-[11px] text-white/30 mb-1.5 block uppercase tracking-wider">Video URL (mp4, webm)</label>
            <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://example.com/video.mp4"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none mb-3" />
            <button onClick={addVideoElement} disabled={!videoUrl}
              className="w-full bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all disabled:opacity-50">Add Video</button>
          </div>
        </div>
      )}

      {/* Audio Dialog */}
      {showAudioDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => { setShowAudioDialog(false); setAudioUrl(""); }}>
          <div className="bg-[#2A2523] rounded-xl p-6 w-96 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-white mb-4">Insert Audio</h3>
            <label className="text-[11px] text-white/30 mb-1.5 block uppercase tracking-wider">Audio URL (mp3, wav, ogg)</label>
            <input value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="https://example.com/audio.mp3"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none mb-3" />
            <button onClick={addAudioElement} disabled={!audioUrl}
              className="w-full bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all disabled:opacity-50">Add Audio</button>
          </div>
        </div>
      )}

      {/* GIF Dialog */}
      {showGIFDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => { setShowGIFDialog(false); setGifUrl(""); }}>
          <div className="bg-[#2A2523] rounded-xl p-6 w-96 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-white mb-4">Insert GIF</h3>
            <label className="text-[11px] text-white/30 mb-1.5 block uppercase tracking-wider">GIF URL</label>
            <input value={gifUrl} onChange={(e) => setGifUrl(e.target.value)} placeholder="https://example.com/animation.gif"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none mb-3" />
            <button onClick={addGIFElement} disabled={!gifUrl}
              className="w-full bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all disabled:opacity-50">Add GIF</button>
          </div>
        </div>
      )}

      {/* Collage Dialog */}
      {showCollageDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowCollageDialog(false)}>
          <div className="bg-[#2A2523] rounded-xl p-6 w-[420px] border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-white mb-4">Photo Collage</h3>
            <p className="text-xs text-white/40 mb-4">Choose a layout template. Image placeholders will be added to the slide.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "2-grid", label: "2 Grid", cols: 2, rows: 1 },
                { id: "3-grid", label: "3 Grid", cols: 3, rows: 1 },
                { id: "4-grid", label: "4 Grid", cols: 2, rows: 2 },
                { id: "3-column", label: "3 Column", cols: 3, rows: 2 },
                { id: "4-column", label: "4 Column", cols: 4, rows: 2 },
                { id: "2+1", label: "2+1", cols: 3, rows: 2, desc: "Large + 2 small" },
                { id: "1+2", label: "1+2", cols: 3, rows: 2, desc: "2 small + Large" },
                { id: "spotlight", label: "Spotlight", cols: 1, rows: 1 },
              ].map((t) => (
                <button key={t.id} onClick={() => handleCollageTemplate(t.id)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 transition-all group">
                  <div className="grid gap-0.5 mb-1.5" style={{ gridTemplateColumns: `repeat(${t.cols}, 1fr)`, gridTemplateRows: `repeat(${t.rows}, 1fr)` }}>
                    {Array.from({ length: t.cols * t.rows }).map((_, i) => (
                      <div key={i} className="aspect-video bg-white/10 rounded group-hover:bg-sienna/30 transition-colors" />
                    ))}
                  </div>
                  <span className="text-[11px] text-white/50 group-hover:text-white transition-colors">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
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

      {/* LaTeX Editor Modal */}
      {showLatexEditor && (
        <LatexEditorModal
          initialValue={editingLatexId ? currentSlide.elements.find(e => e.id === editingLatexId)?.content : undefined}
          onInsert={handleLatexInsert}
          onClose={() => { setShowLatexEditor(false); setEditingLatexId(null); }} />
      )}

      {/* Mermaid Editor Modal */}
      {showMermaidEditor && (
        <MermaidEditorModal
          initialValue={editingMermaidId ? currentSlide.elements.find(e => e.id === editingMermaidId)?.content : undefined}
          onInsert={handleMermaidInsert}
          onClose={() => { setShowMermaidEditor(false); setEditingMermaidId(null); }} />
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
            <select value={presentationTransition} onChange={(e) => { const t = e.target.value as typeof presentationTransition; setPresentationTransition(t); const u = JSON.parse(JSON.stringify(slides)) as Slide[]; u.forEach(s => s.transition = t); updateSlides(u); }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none mb-4">
              <option value="none">None</option>
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="zoom">Zoom</option>
              <option value="morph">Morph</option>
            </select>
            <button onClick={() => setShowSettings(false)} className="w-full bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all">Done</button>
          </div>
        </div>
      )}

      {/* Custom Slide Show */}
      {showCustomShow && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowCustomShow(false)}>
          <div className="bg-[#2A2523] rounded-xl p-6 w-[480px] border border-white/10 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-white mb-4">Custom Slide Show</h3>
            {customShows.length > 0 && (
              <div className="mb-4">
                <label className="text-[11px] text-white/30 mb-2 block uppercase tracking-wider">Saved Shows</label>
                <div className="space-y-1">
                  {customShows.map((show) => (
                    <div key={show.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-xs text-white/70">{show.name}</span>
                        <span className="text-[10px] text-white/30 ml-2">({show.slideIndices.length} slides)</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { window.open(`/present/${presentationId}?show=${show.id}`, "_blank"); }}
                          className="text-[10px] bg-sienna text-white px-3 py-1 rounded hover:bg-sienna-dark transition-all">Present</button>
                        <button onClick={async () => {
                          const updated = customShows.filter((s) => s.id !== show.id);
                          setCustomShows(updated);
                          const supabase = (await import("@/lib/supabase/client")).createClient();
                          await supabase.from("presentations").update({ custom_shows: updated as any }).eq("id", presentationId);
                        }}
                          className="text-[10px] text-red-400 px-2 py-1 rounded hover:bg-red-400/10 transition-all">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-3">
              <label className="text-[11px] text-white/30 mb-2 block uppercase tracking-wider">Select Slides</label>
              <div className="grid grid-cols-5 gap-1.5 max-h-40 overflow-y-auto">
                {slides.map((s, i) => (
                  <button key={s.id} onClick={() => {
                    const next = new Set(selectedCustomIndices);
                    if (next.has(i)) next.delete(i); else next.add(i);
                    setSelectedCustomIndices(next);
                  }}
                    className={`aspect-video rounded border text-[8px] transition-all ${
                      selectedCustomIndices.has(i) ? "border-sienna bg-sienna/10" : "border-white/10 hover:border-white/30"
                    }`}
                    style={{ background: s.background }}>
                    <div className="w-full h-full flex items-center justify-center text-white/40">{i + 1}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <input value={customShowName} onChange={(e) => setCustomShowName(e.target.value)}
                placeholder="Show name..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none" />
              <button onClick={async () => {
                if (selectedCustomIndices.size === 0) return;
                const show = createCustomShow(slides, Array.from(selectedCustomIndices).sort((a, b) => a - b), customShowName || `Custom Show ${customShows.length + 1}`);
                await saveCustomShow(show, presentationId);
                setCustomShows([...customShows, show]);
                setSelectedCustomIndices(new Set());
                setCustomShowName("");
              }}
                className="bg-sienna text-white text-xs px-4 py-2 rounded-lg hover:bg-sienna-dark transition-all disabled:opacity-50"
                disabled={selectedCustomIndices.size === 0}>
                Create Show
              </button>
            </div>
            <button onClick={() => setShowCustomShow(false)} className="w-full bg-white/5 text-white/50 text-xs py-2 rounded-lg hover:bg-white/10 transition-all">Close</button>
          </div>
        </div>
      )}

      {/* Stock Images */}
      {showStockImages && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowStockImages(false)}>
          <div className="bg-[#2A2523] rounded-xl p-6 w-[560px] border border-white/10 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-white mb-4">Stock Images</h3>
            <div className="flex gap-2 mb-4">
              <input value={stockImageQuery} onChange={(e) => setStockImageQuery(e.target.value)}
                placeholder="Search images (e.g. nature, office, technology)..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none"
                onKeyDown={async (e) => { if (e.key === "Enter") { setStockLoading(true); const results = await searchUnsplash(stockImageQuery); setStockImageResults(results); setStockLoading(false); } }} />
              <button onClick={async () => { setStockLoading(true); const results = await searchUnsplash(stockImageQuery); setStockImageResults(results); setStockLoading(false); }} disabled={stockLoading || !stockImageQuery}
                className="bg-sienna text-white text-xs px-4 py-2 rounded-lg hover:bg-sienna-dark transition-all disabled:opacity-50">
                {stockLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </button>
            </div>
            {stockImageResults.length === 0 && !stockLoading && (
              <button onClick={async () => { setStockLoading(true); const results = await searchUnsplash("nature"); setStockImageResults(results); setStockLoading(false); }}
                className="text-xs text-white/40 hover:text-white/60 mb-4">Load example images</button>
            )}
            <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1">
              {stockImageResults.map((photo: any) => (
                <div key={photo.id} className="group relative rounded-lg overflow-hidden bg-white/5 cursor-pointer"
                  onClick={() => {
                    const u = JSON.parse(JSON.stringify(slides)) as Slide[];
                    u[activeSlide].elements.push({
                      id: String(Date.now()), type: "image", x: 100, y: 100,
                      width: 300, height: 200, content: photo.urls?.regular || photo.urls?.full || "",
                      alt: photo.alt_description || "Stock image", color: "#FFFFFF",
                      zIndex: currentSlide.elements.length, visible: true, locked: false, rotation: 0, opacity: 1,
                    });
                    updateSlides(u);
                    setShowStockImages(false);
                  }}>
                  <img src={photo.urls?.small || photo.urls?.thumb} alt={photo.alt_description || ""} className="w-full h-28 object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <span className="text-white text-[10px] opacity-0 group-hover:opacity-100 transition-all bg-sienna px-3 py-1 rounded">Insert</span>
                  </div>
                  {photo.user && (
                    <div className="absolute bottom-1 left-1 text-[7px] text-white/40 truncate max-w-[90%]">
                      Photo by {photo.user.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chart Data Editor */}
      {showChartEditor && chartEditorData && activeEl?.chartType && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowChartEditor(false)}>
          <div className="bg-[#2A2523] rounded-xl p-6 w-[480px] border border-white/10 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-white mb-4">Edit Chart Data</h3>
            <div className="space-y-2 mb-4">
              {chartEditorData.labels.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="color" value={chartEditorData.colors[i] || "#C4653A"}
                    onChange={(e) => { const next = { ...chartEditorData, colors: [...chartEditorData.colors] }; next.colors[i] = e.target.value; setChartEditorData(next); }}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border border-white/10 shrink-0" />
                  <input type="text" value={label} placeholder="Label"
                    onChange={(e) => { const next = { ...chartEditorData, labels: [...chartEditorData.labels] }; next.labels[i] = e.target.value; setChartEditorData(next); }}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/60 outline-none" />
                  <input type="number" value={chartEditorData.values[i]} placeholder="Value"
                    onChange={(e) => { const next = { ...chartEditorData, values: [...chartEditorData.values] }; next.values[i] = Math.max(0, parseInt(e.target.value) || 0); setChartEditorData(next); }}
                    className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/60 outline-none" />
                  <button onClick={() => { const next = { labels: chartEditorData.labels.filter((_, j) => j !== i), values: chartEditorData.values.filter((_, j) => j !== i), colors: chartEditorData.colors.filter((_, j) => j !== i) }; setChartEditorData(next); }}
                    className="p-1 text-white/30 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => { setChartEditorData({ labels: [...chartEditorData.labels, ""], values: [...chartEditorData.values, 0], colors: [...chartEditorData.colors, "#C4653A"] }); }}
              className="text-xs text-white/40 hover:text-white/60 mb-4 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Row</button>
            <div className="flex gap-2">
              <button onClick={() => {
                const u = JSON.parse(JSON.stringify(slides)) as Slide[];
                const el = u[activeSlide].elements.find(x => x.id === activeElement);
                if (el && el.chartData) { el.chartData = chartEditorData; updateSlides(u); }
                setShowChartEditor(false);
              }} className="flex-1 bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all">Apply</button>
              <button onClick={() => setShowChartEditor(false)} className="flex-1 bg-white/5 text-white/40 text-xs py-2 rounded-lg hover:bg-white/10 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Slides Modal */}
      {showAIGenerate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => { setShowAIGenerate(false); setAiGeneratedSlides([]); }}>
          <div className="bg-[#2A2523] rounded-xl p-6 w-[540px] border border-white/10 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-white mb-4">AI Generate Slides</h3>
            <div className="flex gap-2 mb-4">
              <input value={aiGenerateTopic} onChange={(e) => setAiGenerateTopic(e.target.value)}
                placeholder="Enter a topic (e.g. Climate Change, React Hooks, Marketing Strategy)..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none"
                onKeyDown={async (e) => { if (e.key === "Enter" && aiGenerateTopic) { setAiGenerating(true); setAiGeneratedSlides([]); const s = await generateSlideContent(aiGenerateTopic, aiGenerateCount); setAiGeneratedSlides(s); setAiGenerating(false); } }} />
              <button onClick={async () => { if (!aiGenerateTopic) return; setAiGenerating(true); setAiGeneratedSlides([]); const s = await generateSlideContent(aiGenerateTopic, aiGenerateCount); setAiGeneratedSlides(s); setAiGenerating(false); }}
                disabled={aiGenerating || !aiGenerateTopic}
                className="bg-sienna text-white text-xs px-4 py-2 rounded-lg hover:bg-sienna-dark transition-all disabled:opacity-50 flex items-center gap-1.5">
                {aiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                {aiGenerating ? "Generating..." : "Generate"}
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] text-white/30 uppercase tracking-wider">Slides: {aiGenerateCount}</span>
              <input type="range" min="3" max="15" value={aiGenerateCount} onChange={(e) => setAiGenerateCount(parseInt(e.target.value))} className="flex-1 accent-sienna h-1" />
            </div>
            {aiGeneratedSlides.length > 0 && (
              <>
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {aiGeneratedSlides.map((slide, i) => (
                    <div key={slide.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium text-white/70">Slide {i + 1}</span>
                        <div className="w-3 h-3 rounded-full" style={{ background: slide.background.startsWith("linear") ? "#1A1715" : slide.background }} />
                      </div>
                      <div className="text-xs text-white/90 font-medium mb-1">{slide.title}</div>
                      <div className="space-y-0.5">
                        {slide.elements?.filter((e: any) => e.type === "text" && e.content?.startsWith("•")).map((e: any, j: number) => (
                          <div key={j} className="text-[10px] text-white/50 truncate">{e.content}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => {
                  const u = JSON.parse(JSON.stringify(slides)) as Slide[];
                  aiGeneratedSlides.forEach((s) => { u.splice(activeSlide + 1, 0, s); });
                  updateSlides(u, activeSlide + 1);
                  setShowAIGenerate(false);
                  setAiGeneratedSlides([]);
                }} className="w-full bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all flex items-center justify-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add All ({aiGeneratedSlides.length} slides)
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* AI Image Modal */}
      {showAIImage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => { setShowAIImage(false); setAiGeneratedImage(""); }}>
          <div className="bg-[#2A2523] rounded-xl p-6 w-[480px] border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-white mb-4">AI Generate Image</h3>
            <input value={aiImagePrompt} onChange={(e) => setAiImagePrompt(e.target.value)}
              placeholder="Describe the image you want..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none mb-3" />
            <div className="mb-3">
              <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Style</label>
              <select value={aiImageStyle} onChange={(e) => setAiImageStyle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none">
                {getStyleOptions().map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}</option>
                ))}
              </select>
            </div>
            <button onClick={async () => { if (!aiImagePrompt) return; setAiImageGenerating(true); const url = await generateImage(aiImagePrompt, aiImageStyle); setAiGeneratedImage(url); setAiImageGenerating(false); }}
              disabled={aiImageGenerating || !aiImagePrompt}
              className="w-full bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 mb-4">
              {aiImageGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              {aiImageGenerating ? "Generating..." : "Generate Image"}
            </button>
            {aiGeneratedImage && (
              <div>
                <div className="rounded-lg overflow-hidden bg-[#1A1715] mb-3 flex items-center justify-center" style={{ minHeight: 160 }}>
                  <img src={aiGeneratedImage} alt="AI Generated" className="max-w-full max-h-48 object-contain" />
                </div>
                <button onClick={() => {
                  const u = JSON.parse(JSON.stringify(slides)) as Slide[];
                  u[activeSlide].elements.push({
                    id: String(Date.now()), type: "image", x: 100, y: 100,
                    width: 300, height: 200, content: aiGeneratedImage,
                    alt: aiImagePrompt, color: "#FFFFFF",
                    zIndex: currentSlide.elements.length, visible: true, locked: false, rotation: 0, opacity: 1,
                  });
                  updateSlides(u);
                  setShowAIImage(false);
                  setAiGeneratedImage("");
                }} className="w-full bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all">Add to Slide</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Background Remover Modal */}
      {showBackgroundRemover && activeEl?.type === "image" && (
        <BackgroundRemoverModal
          onApply={(dataUrl) => {
            const u = JSON.parse(JSON.stringify(slides)) as Slide[];
            const el = u[activeSlide].elements.find(x => x.id === activeElement);
            if (el && el.type === "image") { el.content = dataUrl; updateSlides(u); }
            setShowBackgroundRemover(false);
          }}
          onClose={() => setShowBackgroundRemover(false)}
        />
      )}

      {/* Keyboard Shortcuts Help */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowHelp(false)}>
          <div className="bg-[#2A2523] rounded-xl p-6 w-96 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-white mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-xs text-white/60 max-h-60 overflow-y-auto">
              {Object.entries(loadShortcuts()).slice(0, 20).map(([action, shortcut]) => (
                <div key={action} className="flex justify-between items-center">
                  <kbd className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-white/40 font-mono">{shortcut}</kbd>
                  <span className="capitalize">{action.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setShowHelp(false); setShowShortcutCustomizer(true); }}
              className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-sienna bg-sienna/10 hover:bg-sienna/20 py-2 rounded-lg transition-all">
              <Keyboard className="w-3.5 h-3.5" /> Customize Shortcuts
            </button>
            <button onClick={() => setShowHelp(false)} className="w-full mt-2 text-xs text-white/40 hover:text-white/60 transition-colors">Close</button>
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

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={buildCommandList({
          addSlide: () => addSlide(),
          deleteSlide: () => deleteSlide(activeSlide),
          duplicateSlide: () => {
            const u = JSON.parse(JSON.stringify(slides)) as Slide[];
            const dup = JSON.parse(JSON.stringify(u[activeSlide]));
            dup.id = String(Date.now());
            dup.elements = (dup.elements || []).map((el: SlideElement) => ({ ...el, id: String(Date.now()) + Math.random() }));
            u.splice(activeSlide + 1, 0, dup);
            updateSlides(u, activeSlide + 1);
          },
          addText: () => addElement("text"),
          addImage: () => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.click(); },
          addShape: () => { setShowShapeMenu(true); },
          addVideo: () => setShowVideoDialog(true),
          addCode: () => addElement("code"),
          undo,
          redo,
          copy: copySelectedToClipboard,
          paste: pasteFromClipboard,
          deleteSelected: () => {
            if (selectedElements.length > 0) {
              selectedElements.forEach(id => { if (id) deleteElement(id); });
            } else if (activeElement) {
              deleteElement(activeElement);
            }
          },
          bold: () => {
            const u = JSON.parse(JSON.stringify(slides)) as Slide[];
            const e = u[activeSlide].elements.find((x: SlideElement) => x.id === activeElement);
            if (e) { e.fontWeight = e.fontWeight === "bold" ? "normal" : "bold"; updateSlides(u); }
          },
          italic: () => {
            const u = JSON.parse(JSON.stringify(slides)) as Slide[];
            const e = u[activeSlide].elements.find((x: SlideElement) => x.id === activeElement);
            if (e) { e.fontStyle = e.fontStyle === "italic" ? "normal" : "italic"; updateSlides(u); }
          },
          underline: () => {
            const u = JSON.parse(JSON.stringify(slides)) as Slide[];
            const e = u[activeSlide].elements.find((x: SlideElement) => x.id === activeElement);
            if (e) { e.textDecoration = e.textDecoration === "underline" ? undefined : "underline"; updateSlides(u); }
          },
          alignLeft: () => {
            const u = JSON.parse(JSON.stringify(slides)) as Slide[];
            const e = u[activeSlide].elements.find((x: SlideElement) => x.id === activeElement);
            if (e) { e.textAlign = "left"; updateSlides(u); }
          },
          alignCenter: () => {
            const u = JSON.parse(JSON.stringify(slides)) as Slide[];
            const e = u[activeSlide].elements.find((x: SlideElement) => x.id === activeElement);
            if (e) { e.textAlign = "center"; updateSlides(u); }
          },
          alignRight: () => {
            const u = JSON.parse(JSON.stringify(slides)) as Slide[];
            const e = u[activeSlide].elements.find((x: SlideElement) => x.id === activeElement);
            if (e) { e.textAlign = "right"; updateSlides(u); }
          },
          exportPDF: () => exportToPDF(title, slides),
          exportPPTX: () => exportToPPTX(title, slides),
          exportHTML,
          toggleGrid: () => setShowGrid(!showGrid),
          toggleSnap: () => setSnapEnabled(!snapEnabled),
          zoomIn: () => setZoom(Math.min(200, zoom + 10)),
          zoomOut: () => setZoom(Math.max(25, zoom - 10)),
          zoomReset: () => setZoom(100),
          zoomFit: () => setZoom(Math.max(25, Math.min(200, Math.floor(window.innerHeight / 405 * 100)))),
          toggleLayers: () => {},
          toggleAnimations: () => setShowAnimations(!showAnimations),
          toggleNotes: () => setShowNotes(!showNotes),
          showHelp: () => setShowHelp(true),
          showSettings: () => setShowSettings(true),
          present: () => window.open(`/present/${presentationId}`, "_blank"),
          aiGenerate: () => setShowAIGenerate(true),
          stockImages: () => setShowStockImages(true),
          fullscreen: () => { if (document.fullscreenElement) { document.exitFullscreen(); } else { document.documentElement.requestFullscreen(); } },
          selectAll: () => {
            const all = currentSlide.elements.map(el => el.id);
            setSelectedElements(all);
          },
          group: groupElements,
          ungroup: ungroupElements,
        })}
      />

      {/* Custom Theme Editor */}
      {showCustomThemeEditor && (
        <CustomThemeEditor
          onApply={(theme) => {
            const u = applyThemeToSlides(slides as any, theme);
            updateSlides(u as Slide[]);
            setShowCustomThemeEditor(false);
          }}
          onClose={() => setShowCustomThemeEditor(false)}
        />
      )}

      {/* Shortcut Customizer */}
      <ShortcutCustomizer
        isOpen={showShortcutCustomizer}
        onClose={() => setShowShortcutCustomizer(false)}
      />

      {/* Plugin Manager */}
      <PluginManager
        isOpen={showPluginManager}
        onClose={() => setShowPluginManager(false)}
        registry={pluginRegistry}
      />
    </div>
  );
}
