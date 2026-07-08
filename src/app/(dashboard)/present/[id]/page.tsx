"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Maximize, Minimize, Timer,
  X, Loader2, PenTool, Trash2, MessageSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

const transitionStyles = `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideIn{from{transform:translateX(80px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes zoomIn{from{transform:scale(0.9);opacity:0}to{transform:scale(1);opacity:1}}.animate-fadeIn{animation:fadeIn .5s ease-out}.animate-slideIn{animation:slideIn .4s ease-out}.animate-zoomIn{animation:zoomIn .4s ease-out}`;

interface SlideElement {
  id: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  content: string;
  color: string;
  alt?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  borderRadius?: number;
  codeLanguage?: string;
  zIndex?: number;
}
interface Slide {
  id: string;
  background: string;
  elements: SlideElement[];
  notes?: string;
  transition?: string;
}

export default function PresentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [title, setTitle] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [laserOn, setLaserOn] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [inkOn, setInkOn] = useState(false);
  const [inkColor, setInkColor] = useState("#B91C1C");
  const [inkWidth, setInkWidth] = useState(4);
  const [inkDrawing, setInkDrawing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const lastInkPos = useRef<{ x: number; y: number } | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const presenterCanvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const toolbarTimer = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: pres } = await supabase
        .from("presentations")
        .select("*")
        .eq("id", id)
        .single();

      if (pres) {
        setTitle(pres.title || "Untitled");
        if (pres.slides) setSlides(pres.slides as Slide[]);
      }
      setLoading(false);
    };
    init();
  }, [id, supabase, router]);

  const goTo = useCallback((dir: number) => {
    setCurrentSlide((prev) => Math.max(0, Math.min(slides.length - 1, prev + dir)));
  }, [slides.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goTo(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(-1); }
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => { if (s <= 1) { setTimerRunning(false); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = transitionStyles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowToolbar(true);
      if (toolbarTimer.current) clearTimeout(toolbarTimer.current);
      toolbarTimer.current = setTimeout(() => setShowToolbar(false), 4000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleLaser = () => {
    const nextLaser = !laserOn;
    setLaserOn(nextLaser);
    if (nextLaser) {
      setInkOn(false);
    }
  };

  const toggleInk = () => {
    const nextInk = !inkOn;
    setInkOn(nextInk);
    if (nextInk) {
      setLaserOn(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSlideMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!laserOn || !slideContainerRef.current) return;
    const rect = slideContainerRef.current.getBoundingClientRect();
    setLaserPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleInkMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!inkOn || !presenterCanvasRef.current || !slideContainerRef.current) return;
    setInkDrawing(true);
    const rect = slideContainerRef.current.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    lastInkPos.current = { x: canvasX, y: canvasY };
    const ctx = presenterCanvasRef.current.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = inkWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, inkWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = inkColor;
      ctx.fill();
    }
  };

  const handleInkMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!inkDrawing || !inkOn || !presenterCanvasRef.current || !slideContainerRef.current || !lastInkPos.current) return;
    const rect = slideContainerRef.current.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const ctx = presenterCanvasRef.current.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = inkWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastInkPos.current.x, lastInkPos.current.y);
      ctx.lineTo(canvasX, canvasY);
      ctx.stroke();
    }
    lastInkPos.current = { x: canvasX, y: canvasY };
  };

  const handleInkMouseUp = () => {
    setInkDrawing(false);
    lastInkPos.current = null;
  };

  const clearInk = () => {
    const canvas = presenterCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    clearInk();
  }, [currentSlide]);

  if (loading) {
    return <div className="min-h-screen bg-charcoal flex items-center justify-center"><Loader2 className="w-6 h-6 text-white/40 animate-spin" /></div>;
  }

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-charcoal flex flex-col relative overflow-hidden">

      {/* Top toolbar */}
      <div className={`absolute top-0 left-0 right-0 z-[100] bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 ${showToolbar ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="h-14 flex items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </Link>
          <span className="ml-3 text-sm text-white/40 font-medium truncate max-w-[200px]">{title}</span>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <button onClick={() => setShowTimer(!showTimer)} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Timer">
              <Timer className="w-4 h-4" />
            </button>
            <button onClick={() => setShowNotes(!showNotes)} className={`p-2.5 rounded-lg transition-all ${showNotes ? "text-sienna bg-sienna/10" : "text-white/50 hover:text-white hover:bg-white/10"}`} title="Speaker Notes">
              <MessageSquare className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/20 mx-1" />
            <button onClick={toggleLaser} className={`p-2.5 rounded-lg transition-all ${laserOn ? "text-red-400 bg-red-400/10" : "text-white/50 hover:text-white hover:bg-white/10"}`} title="Laser Pointer">
              <div className="w-3 h-3 bg-red-500 rounded-full mx-auto" />
            </button>
            <button onClick={toggleInk} className={`p-2.5 rounded-lg transition-all ${inkOn ? "text-sienna bg-sienna/10" : "text-white/50 hover:text-white hover:bg-white/10"}`} title="Ink Annotations">
              <PenTool className="w-4 h-4" />
            </button>
            {inkOn && (
              <>
                <input type="color" value={inkColor} onChange={(e) => setInkColor(e.target.value)} className="w-6 h-6 p-0 bg-transparent border-0 cursor-pointer rounded" title="Ink Color" style={{ border: 'none', minWidth: '24px' }} />
                <select value={inkWidth} onChange={(e) => setInkWidth(Number(e.target.value))} className="bg-[#2A2523] text-white text-xs border border-white/20 rounded px-1.5 py-1 outline-none" title="Ink Size">
                  <option value="2">Thin</option>
                  <option value="4">Medium</option>
                  <option value="8">Thick</option>
                  <option value="12">Extra Thick</option>
                </select>
                <button onClick={clearInk} className="p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Clear Ink">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <div className="w-px h-6 bg-white/20 mx-1" />
            <button onClick={toggleFullscreen} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main slide */}
      <div className="flex-1 flex items-center justify-center p-4">
        {slide ? (
          <div key={currentSlide} ref={slideContainerRef} onMouseMove={handleSlideMouseMove}
            className={`w-full max-w-5xl aspect-video shadow-2xl shadow-black/30 flex items-center justify-center relative overflow-hidden rounded-lg ${
              slide.transition === "fade" ? "animate-fadeIn" :
              slide.transition === "slide" ? "animate-slideIn" :
              slide.transition === "zoom" ? "animate-zoomIn" : ""
            }`}
            style={{ background: slide.background }}>

            {/* Ink canvas */}
            <canvas
              ref={presenterCanvasRef}
              width={1280}
              height={720}
              className={`absolute inset-0 w-full h-full z-[85] ${inkOn ? "cursor-crosshair" : "pointer-events-none"}`}
              onMouseDown={handleInkMouseDown}
              onMouseMove={handleInkMouseMove}
              onMouseUp={handleInkMouseUp}
              onMouseLeave={handleInkMouseUp}
            />

            {/* Laser pointer */}
            {laserOn && (
              <div className="absolute z-[90] pointer-events-none w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse"
                style={{ left: laserPos.x - 8, top: laserPos.y - 8 }} />
            )}

            {/* Slide elements */}
            {(slide.elements || []).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map((el) => (
              <div key={el.id} className="absolute"
                style={{
                  left: el.x ?? 0, top: el.y ?? 0,
                  width: el.width ?? 200, height: el.height ?? 40,
                }}>
                {el.type === "text" ? (
                  <div style={{ color: el.color, fontSize: el.fontSize || 18, fontFamily: el.fontFamily || "var(--font-heading)", fontWeight: el.fontWeight, fontStyle: el.fontStyle }}>
                    {el.content}
                  </div>
                ) : el.type === "code" ? (
                  <div className="w-full h-full bg-[#1E1E1E] rounded-lg overflow-auto border border-white/10">
                    <pre className="p-3 m-0 font-mono text-xs overflow-auto" style={{ whiteSpace: "pre" }}><code className={`language-${el.codeLanguage || "plaintext"}`}
                      dangerouslySetInnerHTML={{ __html: hljs.highlight(el.content, { language: el.codeLanguage || "plaintext", ignoreIllegals: true }).value }} /></pre>
                  </div>
                ) : el.type === "image" ? (
                  <img src={el.content} alt={el.alt || ""} className="w-full h-full object-cover rounded" draggable={false} />
                ) : el.type === "youtube" ? (
                  <iframe src={el.content} className="w-full h-full" allowFullScreen />
                ) : (
                  <div className="w-full h-full rounded" style={{ background: el.color, borderRadius: el.borderRadius || 0 }} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/30">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No slides to display</p>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className={`absolute bottom-0 left-0 right-0 z-[100] bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-500 ${showToolbar ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="h-16 flex items-center justify-between px-6">
          <button onClick={() => goTo(-1)} disabled={currentSlide === 0}
            className="p-3 text-white/50 hover:text-white disabled:opacity-20 transition-all bg-white/5 hover:bg-white/10 rounded-full disabled:bg-transparent">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all ${i === currentSlide ? "w-6 bg-sienna" : "w-1.5 bg-white/30 hover:bg-white/50"}`} />
            ))}
          </div>
          <button onClick={() => goTo(1)} disabled={currentSlide === slides.length - 1}
            className="p-3 text-white/50 hover:text-white disabled:opacity-20 transition-all bg-white/5 hover:bg-white/10 rounded-full disabled:bg-transparent">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Speaker Notes */}
      {showNotes && slide?.notes && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[80vw] max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 z-[120]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-charcoal/40 uppercase tracking-wider">Speaker Notes</h3>
            <button onClick={() => setShowNotes(false)} className="text-charcoal/30 hover:text-charcoal/60">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-charcoal/80 whitespace-pre-wrap">{slide.notes}</p>
        </div>
      )}

      {/* Timer */}
      {showTimer && (
        <div className="fixed bottom-20 left-6 bg-white rounded-2xl shadow-2xl p-5 z-[120]">
          <div className="text-4xl font-mono text-charcoal text-center mb-3">{formatTime(timerSeconds)}</div>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setTimerRunning(!timerRunning)}
              className={`flex-1 text-xs py-2 rounded-lg font-medium transition-all ${timerRunning ? "bg-red-500 text-white" : "bg-sienna text-white hover:bg-sienna-dark"}`}>
              {timerRunning ? "Pause" : "Start"}
            </button>
            <button onClick={() => { setTimerRunning(false); setTimerSeconds(300); }}
              className="flex-1 text-xs py-2 rounded-lg font-medium bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10 transition-all">Reset</button>
          </div>
          <div className="flex gap-1.5">
            {[60, 120, 300, 600].map((s) => (
              <button key={s} onClick={() => { setTimerSeconds(s); setTimerRunning(false); }}
                className="flex-1 text-[10px] py-1 bg-charcoal/5 rounded text-charcoal/40 hover:bg-charcoal/10 transition-all">
                {s >= 60 ? `${s / 60}m` : `${s}s`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
