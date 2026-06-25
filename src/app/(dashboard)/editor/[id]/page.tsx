"use client";

import { useState, useRef, use } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Copy,
  GripVertical,
  Type,
  Image,
  Square,
  Circle,
  Minus,
  Palette,
  ChevronDown,
  Undo2,
  Redo2,
  Play,
  Share2,
  Save,
  Settings,
  ArrowLeft,
  Layers,
  MousePointer2,
} from "lucide-react";

interface SlideElement {
  id: string;
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  fontSize?: number;
}

interface Slide {
  id: string;
  elements: SlideElement[];
  background: string;
}

const defaultSlides: Slide[] = [
  {
    id: "1",
    background: "#FFFFFF",
    elements: [
      {
        id: "e1",
        type: "text",
        x: 80,
        y: 120,
        width: 400,
        height: 60,
        content: "Presentation Title",
        color: "#1C1917",
        fontSize: 36,
      },
      {
        id: "e2",
        type: "text",
        x: 80,
        y: 200,
        width: 300,
        height: 30,
        content: "Your name and date",
        color: "#6B6560",
        fontSize: 16,
      },
    ],
  },
  {
    id: "2",
    background: "#FFFFFF",
    elements: [
      {
        id: "e3",
        type: "text",
        x: 60,
        y: 60,
        width: 500,
        height: 50,
        content: "Key Concepts",
        color: "#1C1917",
        fontSize: 28,
      },
      {
        id: "e4",
        type: "text",
        x: 60,
        y: 130,
        width: 500,
        height: 200,
        content: "Add your bullet points here. Keep them concise and impactful.",
        color: "#6B6560",
        fontSize: 16,
      },
    ],
  },
];

const templates = [
  { name: "Blank", bg: "#FFFFFF", color: "#C4653A" },
  { name: "Dark", bg: "#1C1917", color: "#C4653A" },
  { name: "Warm", bg: "#FAF8F5", color: "#C4653A" },
  { name: "Cool", bg: "#F0F4F8", color: "#3D5A80" },
];

const colorPresets = [
  "#1C1917", "#C4653A", "#FFFFFF", "#F0EDE8",
  "#B91C1C", "#16A34A", "#2563EB", "#CA8A04",
];

export default function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "text" | "shape">("select");
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[activeSlide];

  const addSlide = () => {
    const newSlide: Slide = {
      id: String(Date.now()),
      background: "#FFFFFF",
      elements: [],
    };
    setSlides([...slides, newSlide]);
    setActiveSlide(slides.length);
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    setActiveSlide(Math.min(activeSlide, newSlides.length - 1));
  };

  const addElement = (type: "text" | "shape") => {
    const newElement: SlideElement = {
      id: String(Date.now()),
      type,
      x: 100,
      y: 100,
      width: type === "text" ? 300 : 120,
      height: type === "text" ? 40 : 120,
      content: type === "text" ? "Double-click to edit" : "",
      color: "#1C1917",
      fontSize: 18,
    };
    const updated = [...slides];
    updated[activeSlide].elements.push(newElement);
    setSlides(updated);
    setActiveElement(newElement.id);
  };

  return (
    <div className="h-screen flex flex-col bg-charcoal overflow-hidden">
      {/* Top bar */}
      <div className="h-12 bg-[#2A2523] border-b border-white/5 flex items-center px-4 shrink-0">
        <Link
          href="/dashboard/presentations"
          className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors mr-4"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-sienna rounded-md flex items-center justify-center text-[10px] font-bold text-white">
            P
          </div>
          <span className="text-sm text-white/80 font-medium">Untitled Presentation</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button className="p-2 text-white/40 hover:text-white/70 transition-colors">
            <Undo2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-white/40 hover:text-white/70 transition-colors">
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button className="flex items-center gap-2 text-xs text-white/50 hover:text-white/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <Link
            href={`/present/${id}`}
            className="flex items-center gap-2 text-xs font-medium text-white bg-sienna px-4 py-1.5 rounded-lg hover:bg-sienna-dark transition-all duration-300"
          >
            <Play className="w-3.5 h-3.5" />
            Present
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Slide panel */}
        <div className="w-52 bg-[#231F1D] border-r border-white/5 flex flex-col shrink-0">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-medium text-white/40">Slides</span>
            <button
              onClick={addSlide}
              className="p-1 text-white/40 hover:text-white/70 hover:bg-white/5 rounded transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                onClick={() => setActiveSlide(i)}
                className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  activeSlide === i
                    ? "border-sienna"
                    : "border-transparent hover:border-white/10"
                }`}
              >
                <div
                  className="aspect-video flex items-center justify-center text-[8px] text-white/30"
                  style={{ background: slide.background }}
                >
                  {slide.elements.length === 0 ? (
                    <span>Empty</span>
                  ) : (
                    <div className="w-full h-full p-2 flex flex-col justify-center">
                      {slide.elements
                        .filter((e) => e.type === "text")
                        .slice(0, 2)
                        .map((el) => (
                          <div
                            key={el.id}
                            className="truncate text-charcoal"
                            style={{ fontSize: "6px", color: el.color }}
                          >
                            {el.content}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <div className="absolute top-1 left-1 bg-black/60 text-[9px] text-white/70 w-4 h-4 rounded flex items-center justify-center">
                  {i + 1}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSlide(i);
                  }}
                  className="absolute top-1 right-1 p-0.5 bg-black/60 text-white/50 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="h-12 bg-[#231F1D] border-b border-white/5 flex items-center px-4 gap-1 shrink-0">
            <button
              onClick={() => setActiveTool("select")}
              className={`p-2 rounded-lg transition-all ${
                activeTool === "select"
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <MousePointer2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setActiveTool("text");
                addElement("text");
              }}
              className={`p-2 rounded-lg transition-all ${
                activeTool === "text"
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <Type className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setActiveTool("shape");
                addElement("shape");
              }}
              className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all"
            >
              <Square className="w-4 h-4" />
            </button>
            <button className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all">
              <Image className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <div className="relative">
              <button
                onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-all"
              >
                <Palette className="w-3.5 h-3.5" />
                Background
                <ChevronDown className="w-3 h-3" />
              </button>
              {showTemplateMenu && (
                <div className="absolute top-full left-0 mt-1 bg-[#2A2523] border border-white/10 rounded-lg p-2 shadow-xl z-10 w-48">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        const updated = [...slides];
                        updated[activeSlide].background = c;
                        setSlides(updated);
                        setShowTemplateMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-2 py-1.5 text-xs text-white/60 hover:bg-white/5 rounded transition-all"
                    >
                      <div
                        className="w-5 h-5 rounded border border-white/10"
                        style={{ background: c }}
                      />
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {activeElement && (
              <>
                <div className="w-px h-5 bg-white/10 mx-1" />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    defaultValue="#1C1917"
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <select className="bg-white/5 text-white/60 text-xs border border-white/10 rounded px-2 py-1">
                    <option>12px</option>
                    <option>14px</option>
                    <option>16px</option>
                    <option selected>18px</option>
                    <option>24px</option>
                    <option>32px</option>
                    <option>48px</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Canvas area */}
          <div className="flex-1 flex items-center justify-center bg-[#1A1715] p-8 overflow-auto">
            <div
              ref={canvasRef}
              className="relative shadow-2xl shadow-black/30 rounded-sm"
              style={{
                width: 720,
                height: 405,
                background: currentSlide.background,
              }}
            >
              {currentSlide.elements.map((el) => (
                <div
                  key={el.id}
                  onClick={() => setActiveElement(el.id)}
                  className={`absolute cursor-move select-none ${
                    activeElement === el.id
                      ? "ring-2 ring-sienna ring-offset-1"
                      : "hover:ring-1 hover:ring-white/20"
                  }`}
                  style={{
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                  }}
                >
                  {el.type === "text" ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="w-full h-full outline-none"
                      style={{
                        color: el.color,
                        fontSize: el.fontSize,
                        fontFamily: "var(--font-heading)",
                      }}
                      onBlur={(e) => {
                        const updated = [...slides];
                        const elem = updated[activeSlide].elements.find(
                          (x) => x.id === el.id
                        );
                        if (elem) elem.content = e.currentTarget.textContent || "";
                        setSlides(updated);
                      }}
                    >
                      {el.content}
                    </div>
                  ) : (
                    <div
                      className="w-full h-full rounded"
                      style={{ background: el.color }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="h-10 bg-[#231F1D] border-t border-white/5 flex items-center justify-between px-4 shrink-0">
            <span className="text-[11px] text-white/25">
              Slide {activeSlide + 1} of {slides.length}
            </span>
            <div className="flex items-center gap-3 text-[11px] text-white/25">
              <span>720 × 405</span>
              <span>|</span>
              <button className="text-white/30 hover:text-white/60 transition-colors">
                <Save className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Properties panel */}
        <div className="w-60 bg-[#231F1D] border-l border-white/5 flex flex-col shrink-0">
          <div className="p-3 border-b border-white/5">
            <span className="text-xs font-medium text-white/40">
              {activeElement ? "Element Properties" : "Slide Properties"}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {activeElement ? (
              <>
                <div>
                  <label className="text-[11px] text-white/30 mb-1.5 block uppercase tracking-wider">
                    Position
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-white/20">X</span>
                      <input
                        type="number"
                        defaultValue="100"
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/70"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-white/20">Y</span>
                      <input
                        type="number"
                        defaultValue="100"
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/70"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-white/30 mb-1.5 block uppercase tracking-wider">
                    Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-white/20">W</span>
                      <input
                        type="number"
                        defaultValue="300"
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/70"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-white/20">H</span>
                      <input
                        type="number"
                        defaultValue="40"
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/70"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-white/30 mb-1.5 block uppercase tracking-wider">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {colorPresets.map((c) => (
                      <button
                        key={c}
                        className="w-7 h-7 rounded border border-white/10 hover:scale-110 transition-transform"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const updated = [...slides];
                    updated[activeSlide].elements = updated[
                      activeSlide
                    ].elements.filter((e) => e.id !== activeElement);
                    setSlides(updated);
                    setActiveElement(null);
                  }}
                  className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-400/5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Element
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="text-[11px] text-white/30 mb-1.5 block uppercase tracking-wider">
                    Background
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {colorPresets.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          const updated = [...slides];
                          updated[activeSlide].background = c;
                          setSlides(updated);
                        }}
                        className="w-7 h-7 rounded border border-white/10 hover:scale-110 transition-transform"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-white/30 mb-1.5 block uppercase tracking-wider">
                    Layout
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((t) => (
                      <button
                        key={t.name}
                        className="aspect-video rounded border border-white/10 hover:border-white/20 transition-all flex items-center justify-center text-[9px] text-white/30"
                        style={{ background: t.bg }}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-white/30 mb-1.5 block uppercase tracking-wider">
                    Elements on Slide
                  </label>
                  <div className="space-y-1">
                    {currentSlide.elements.map((el) => (
                      <button
                        key={el.id}
                        onClick={() => setActiveElement(el.id)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-white/50 hover:bg-white/5 rounded transition-all"
                      >
                        {el.type === "text" ? (
                          <Type className="w-3 h-3" />
                        ) : (
                          <Square className="w-3 h-3" />
                        )}
                        <span className="truncate">
                          {el.content || "Shape"}
                        </span>
                      </button>
                    ))}
                    {currentSlide.elements.length === 0 && (
                      <span className="text-[11px] text-white/20">
                        No elements yet
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
