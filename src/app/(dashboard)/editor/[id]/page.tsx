"use client";

import { useState, useRef, use, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Type,
  Image,
  Square,
  Palette,
  ChevronDown,
  Undo2,
  Redo2,
  Play,
  Share2,
  Save,
  ArrowLeft,
  MousePointer2,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

const colorPresets = ["#1C1917", "#C4653A", "#FFFFFF", "#F0EDE8", "#B91C1C", "#16A34A", "#2563EB", "#CA8A04"];

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([{ id: "1", background: "#FFFFFF", elements: [] }]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "text" | "shape">("select");
  const [showBgMenu, setShowBgMenu] = useState(false);
  const [title, setTitle] = useState("Untitled Presentation");
  const [presentationId, setPresentationId] = useState(id);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(id !== "new");
  const [uploading, setUploading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = slides[activeSlide];

  // Load or create presentation
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      if (id === "new") {
        const { data } = await supabase
          .from("presentations")
          .insert({
            user_id: user.id,
            title: "Untitled Presentation",
            slides: [{ id: "1", background: "#FFFFFF", elements: [] }],
          })
          .select()
          .single();

        if (data) {
          setPresentationId(data.id);
          router.replace(`/editor/${data.id}`, { scroll: false });
        }
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("presentations")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setTitle(data.title);
        if (data.slides && Array.isArray(data.slides) && data.slides.length > 0) {
          setSlides(data.slides as unknown as Slide[]);
        }
      }
      setLoading(false);
    };
    init();
  }, [id, supabase, router]);

  // Auto-save
  const autoSave = useCallback(async () => {
    if (presentationId === "new") return;
    setSaving(true);
    await supabase
      .from("presentations")
      .update({ title, slides, updated_at: new Date().toISOString() })
      .eq("id", presentationId);
    setSaving(false);
    setLastSaved(new Date());
  }, [presentationId, title, slides, supabase]);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(autoSave, 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [slides, title, autoSave]);

  const addSlide = () => {
    const newSlide: Slide = { id: String(Date.now()), background: "#FFFFFF", elements: [] };
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
        id: String(Date.now()),
        type: "image",
        x: 100,
        y: 100,
        width: 300,
        height: 200,
        content: urlData.publicUrl,
        color: "#FFFFFF",
      };
      const updated = [...slides];
      updated[activeSlide].elements.push(newElement);
      setSlides(updated);
      setActiveElement(newElement.id);
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-charcoal">
        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-charcoal overflow-hidden">
      {/* Top bar */}
      <div className="h-12 bg-[#2A2523] border-b border-white/5 flex items-center px-4 shrink-0">
        <Link href="/dashboard/presentations" className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors mr-4">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-sienna rounded-md flex items-center justify-center text-[10px] font-bold text-white">P</div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm text-white/80 font-medium bg-transparent border-none outline-none"
          />
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {saving && <span className="text-[11px] text-white/30 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>}
          {!saving && lastSaved && <span className="text-[11px] text-white/30">Saved {lastSaved.toLocaleTimeString()}</span>}
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button onClick={autoSave} className="p-2 text-white/40 hover:text-white/70 transition-colors"><Save className="w-4 h-4" /></button>
          <Link
            href={`/present/${presentationId}`}
            className="flex items-center gap-2 text-xs font-medium text-white bg-sienna px-4 py-1.5 rounded-lg hover:bg-sienna-dark transition-all duration-300"
          >
            <Play className="w-3.5 h-3.5" /> Present
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Slide panel */}
        <div className="w-52 bg-[#231F1D] border-r border-white/5 flex flex-col shrink-0">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-medium text-white/40">Slides</span>
            <button onClick={addSlide} className="p-1 text-white/40 hover:text-white/70 hover:bg-white/5 rounded transition-all"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                onClick={() => setActiveSlide(i)}
                className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  activeSlide === i ? "border-sienna" : "border-transparent hover:border-white/10"
                }`}
              >
                <div className="aspect-video flex items-center justify-center text-[8px] text-white/30" style={{ background: slide.background }}>
                  {slide.elements.length === 0 ? <span>Empty</span> : (
                    <div className="w-full h-full p-2 flex flex-col justify-center">
                      {slide.elements.filter((e) => e.type === "text").slice(0, 2).map((el) => (
                        <div key={el.id} className="truncate text-charcoal" style={{ fontSize: "6px", color: el.color }}>{el.content}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="absolute top-1 left-1 bg-black/60 text-[9px] text-white/70 w-4 h-4 rounded flex items-center justify-center">{i + 1}</div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSlide(i); }}
                  className="absolute top-1 right-1 p-0.5 bg-black/60 text-white/50 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-12 bg-[#231F1D] border-b border-white/5 flex items-center px-4 gap-1 shrink-0">
            <button onClick={() => setActiveTool("select")} className={`p-2 rounded-lg transition-all ${activeTool === "select" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
              <MousePointer2 className="w-4 h-4" />
            </button>
            <button onClick={() => { setActiveTool("text"); addElement("text"); }} className={`p-2 rounded-lg transition-all ${activeTool === "text" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
              <Type className="w-4 h-4" />
            </button>
            <button onClick={() => { setActiveTool("shape"); addElement("shape"); }} className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all">
              <Square className="w-4 h-4" />
            </button>
            <label className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all cursor-pointer">
              <Image className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <div className="relative">
              <button onClick={() => setShowBgMenu(!showBgMenu)} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-all">
                <Palette className="w-3.5 h-3.5" /> Background <ChevronDown className="w-3 h-3" />
              </button>
              {showBgMenu && (
                <div className="absolute top-full left-0 mt-1 bg-[#2A2523] border border-white/10 rounded-lg p-2 shadow-xl z-10 w-48">
                  {colorPresets.map((c) => (
                    <button key={c} onClick={() => { const u = [...slides]; u[activeSlide].background = c; setSlides(u); setShowBgMenu(false); }}
                      className="flex items-center gap-3 w-full px-2 py-1.5 text-xs text-white/60 hover:bg-white/5 rounded transition-all">
                      <div className="w-5 h-5 rounded border border-white/10" style={{ background: c }} /> {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center bg-[#1A1715] p-8 overflow-auto">
            <div ref={canvasRef} className="relative shadow-2xl shadow-black/30 rounded-sm" style={{ width: 720, height: 405, background: currentSlide.background }}>
              {currentSlide.elements.map((el) => (
                <div
                  key={el.id}
                  onClick={() => setActiveElement(el.id)}
                  className={`absolute cursor-move select-none ${activeElement === el.id ? "ring-2 ring-sienna ring-offset-1" : "hover:ring-1 hover:ring-white/20"}`}
                  style={{ left: el.x, top: el.y, width: el.width, height: el.height }}
                >
                  {el.type === "text" ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="w-full h-full outline-none"
                      style={{ color: el.color, fontSize: el.fontSize, fontFamily: "var(--font-heading)" }}
                      onBlur={(e) => { const u = [...slides]; const elem = u[activeSlide].elements.find((x) => x.id === el.id); if (elem) elem.content = e.currentTarget.textContent || ""; setSlides(u); }}
                    >
                      {el.content}
                    </div>
                  ) : el.type === "image" ? (
                    <img src={el.content} alt="" className="w-full h-full object-cover rounded" draggable={false} />
                  ) : (
                    <div className="w-full h-full rounded" style={{ background: el.color }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="h-10 bg-[#231F1D] border-t border-white/5 flex items-center justify-between px-4 shrink-0">
            <span className="text-[11px] text-white/25">Slide {activeSlide + 1} of {slides.length}</span>
            <div className="flex items-center gap-3 text-[11px] text-white/25"><span>720 × 405</span></div>
          </div>
        </div>

        {/* Properties panel */}
        <div className="w-60 bg-[#231F1D] border-l border-white/5 flex flex-col shrink-0">
          <div className="p-3 border-b border-white/5">
            <span className="text-xs font-medium text-white/40">{activeElement ? "Element Properties" : "Slide Properties"}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {activeElement ? (
              <>
                <div>
                  <label className="text-[11px] text-white/30 mb-1.5 block uppercase tracking-wider">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {colorPresets.map((c) => (
                      <button key={c} onClick={() => { const u = [...slides]; const el = u[activeSlide].elements.find((x) => x.id === activeElement); if (el) { el.color = c; setSlides(u); } }}
                        className="w-7 h-7 rounded border border-white/10 hover:scale-110 transition-transform" style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => { const u = [...slides]; u[activeSlide].elements = u[activeSlide].elements.filter((e) => e.id !== activeElement); setSlides(u); setActiveElement(null); }}
                  className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-400/5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Element
                </button>
              </>
            ) : (
              <div>
                <label className="text-[11px] text-white/30 mb-1.5 block uppercase tracking-wider">Background</label>
                <div className="flex flex-wrap gap-1.5">
                  {colorPresets.map((c) => (
                    <button key={c} onClick={() => { const u = [...slides]; u[activeSlide].background = c; setSlides(u); }}
                      className="w-7 h-7 rounded border border-white/10 hover:scale-110 transition-transform" style={{ background: c }} />
                  ))}
                </div>
                <label className="text-[11px] text-white/30 mt-4 mb-1.5 block uppercase tracking-wider">Elements</label>
                <div className="space-y-1">
                  {currentSlide.elements.map((el) => (
                    <button key={el.id} onClick={() => setActiveElement(el.id)} className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-white/50 hover:bg-white/5 rounded transition-all">
                      {el.type === "text" ? <Type className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                      <span className="truncate">{el.content || "Shape"}</span>
                    </button>
                  ))}
                  {currentSlide.elements.length === 0 && <span className="text-[11px] text-white/20">No elements yet</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
