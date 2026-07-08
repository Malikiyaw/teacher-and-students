"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft, Maximize, Minimize, Timer,
  X, Loader2, PenTool, Trash2, MessageSquare, ChevronRight,
  ScrollText, Grid3X3, MessageCircle,
  Play, Pause, Plus, CheckCircle2, ThumbsUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import { type AnimationDef, getAnimationCSS } from "@/lib/editor/animate";
import { sequencifyAnimations, getTimelineCSS } from "@/lib/editor/animation-timeline";
import { applyCustomShow, loadCustomShows } from "@/lib/editor/custom-slide-show";
import { renderLatexToSVG, preloadKaTeX } from "@/lib/editor/latex";
import { MermaidPreview } from "@/lib/editor/mermaid";

const transitionStyles = `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideIn{from{transform:translateX(80px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes zoomIn{from{transform:scale(0.9);opacity:0}to{transform:scale(1);opacity:1}}@keyframes morphIn{from{opacity:0;filter:blur(4px)}to{opacity:1;filter:blur(0)}}@keyframes pulseCountdown{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}.animate-fadeIn{animation:fadeIn .5s ease-out}.animate-slideIn{animation:slideIn .4s ease-out}.animate-zoomIn{animation:zoomIn .4s ease-out}.animate-morphIn{animation:morphIn .6s ease-out}`;

const teleprompterScroll = `@keyframes tpScroll{0%{transform:translateY(0)}100%{transform:translateY(-50%)}}`;

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
  href?: string;
  shapeText?: string;
  visible?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  speed?: number;
  svgContent?: string;
  maintainAspectRatio?: boolean;
  colorOverride?: string;
  animation?: AnimationDef;
  animations?: AnimationDef[];
}
interface Slide {
  id: string;
  background: string;
  elements: SlideElement[];
  notes?: string;
  transition?: "none" | "fade" | "slide" | "zoom" | "morph";
}

interface QAQuestion {
  id: string;
  text: string;
  votes: number;
  answered: boolean;
  askedBy: string;
}

const SPEED_MAP: Record<string, number> = { slow: 20, medium: 35, fast: 50 };

export default function PresentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [allSlides, setAllSlides] = useState<Slide[]>([]);
  const [title, setTitle] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerMax, setTimerMax] = useState(300);
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
  const animStyleRef = useRef<HTMLStyleElement | null>(null);
  const supabase = createClient();
  const notesSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState<string>("medium");
  const [teleprompterSize, setTeleprompterSize] = useState<string>("medium");
  const [teleprompterPaused, setTeleprompterPaused] = useState(false);

  const [showSlideSorter, setShowSlideSorter] = useState(false);

  const [showQA, setShowQA] = useState(false);
  const [qaQuestions, setQaQuestions] = useState<QAQuestion[]>([]);

  const [notesFontSize, setNotesFontSize] = useState<string>("medium");
  const [notesLineHeight, setNotesLineHeight] = useState(1.6);
  const [notesHeight, setNotesHeight] = useState(240);
  const [notesText, setNotesText] = useState("");
  const notesResizeStart = useRef<{ y: number; height: number } | null>(null);

  const timerBarRef = useRef<HTMLDivElement>(null);

  const SIZE_MAP: Record<string, number> = { small: 12, medium: 16, large: 20 };
  const NOTE_SIZE_MAP: Record<string, number> = { small: 13, medium: 15, large: 18 };

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
        const loaded = (pres.slides || []) as Slide[];
        setAllSlides(loaded);

        const showId = searchParams.get("show");
        if (showId) {
          const shows = await loadCustomShows(id);
          const found = shows.find((s) => s.id === showId);
          if (found) {
            setSlides(applyCustomShow(loaded, found));
          } else {
            setSlides(loaded);
          }
        } else {
          setSlides(loaded);
        }
      }
      setLoading(false);
    };
    init();
  }, [id, supabase, router, searchParams]);

  const goTo = useCallback((dir: number) => {
    setCurrentSlide((prev) => Math.max(0, Math.min(slides.length - 1, prev + dir)));
  }, [slides.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showSlideSorter) {
        if (e.key === "Escape") { setShowSlideSorter(false); return; }
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); setCurrentSlide((p) => Math.min(slides.length - 1, p + 1)); }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); setCurrentSlide((p) => Math.max(0, p - 1)); }
        if (e.key === "Enter") { setShowSlideSorter(false); }
        return;
      }
      if (e.key === "Escape") {
        if (showTeleprompter) { setShowTeleprompter(false); return; }
        if (showSlideSorter) { setShowSlideSorter(false); return; }
        if (showQA) { setShowQA(false); return; }
      }
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goTo(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(-1); }
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo, showSlideSorter, showTeleprompter, showQA]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => { if (s <= 1) { setTimerRunning(false); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const timerKey = `present_timer_${id}`;
  useEffect(() => {
    const saved = localStorage.getItem(timerKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.seconds !== undefined) setTimerSeconds(parsed.seconds);
      if (parsed?.max !== undefined) setTimerMax(parsed.max);
    }
  }, [timerKey]);

  useEffect(() => {
    localStorage.setItem(timerKey, JSON.stringify({ seconds: timerSeconds, max: timerMax }));
  }, [timerSeconds, timerMax, timerKey]);

  useEffect(() => {
    preloadKaTeX();
    const style = document.createElement("style");
    style.textContent = transitionStyles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = teleprompterScroll;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    if (animStyleRef.current) { animStyleRef.current.remove(); animStyleRef.current = null; }
    const slide = slides[currentSlide];
    if (!slide) return;
    const visibleElements = slide.elements.filter(el => el.visible !== false);
    const seq = sequencifyAnimations(visibleElements);
    const css = getTimelineCSS(seq);
    if (css) {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      animStyleRef.current = style;
    }
    return () => { if (animStyleRef.current) { animStyleRef.current.remove(); animStyleRef.current = null; } };
  }, [currentSlide, slides]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowToolbar(true);
      if (toolbarTimer.current) clearTimeout(toolbarTimer.current);
      toolbarTimer.current = setTimeout(() => setShowToolbar(false), 4000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (showNotes) {
      setNotesText(slides[currentSlide]?.notes || "");
    }
  }, [showNotes, currentSlide, slides]);

  useEffect(() => {
    if (showNotes && slides[currentSlide]) {
      if (notesSaveTimer.current) clearTimeout(notesSaveTimer.current);
      notesSaveTimer.current = setTimeout(async () => {
        const slide = slides[currentSlide];
        if (slide && slide.notes !== notesText) {
          const updated = [...slides];
          updated[currentSlide] = { ...updated[currentSlide], notes: notesText };
          setSlides(updated);
          const { data: pres } = await supabase.from("presentations").select("slides").eq("id", id).single();
          if (pres) {
            const all = [...allSlides];
            all[currentSlide] = { ...all[currentSlide], notes: notesText };
            await supabase.from("presentations").update({ slides: all as any }).eq("id", id);
          }
        }
      }, 1000);
    }
    return () => { if (notesSaveTimer.current) clearTimeout(notesSaveTimer.current); };
  }, [notesText, showNotes, currentSlide, slides, allSlides, id, supabase]);

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
    if (nextLaser) setInkOn(false);
  };

  const toggleInk = () => {
    const nextInk = !inkOn;
    setInkOn(nextInk);
    if (nextInk) setLaserOn(false);
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

  useEffect(() => { clearInk(); }, [currentSlide]);

  const handleNotesResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    notesResizeStart.current = { y: e.clientY, height: notesHeight };
    const handleMove = (ev: MouseEvent) => {
      if (!notesResizeStart.current) return;
      const delta = notesResizeStart.current.y - ev.clientY;
      setNotesHeight(Math.max(120, Math.min(600, notesResizeStart.current.height + delta)));
    };
    const handleUp = () => { notesResizeStart.current = null; window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  const timerPercent = timerMax > 0 ? timerSeconds / timerMax : 0;
  const timerColor = timerPercent > 0.5 ? "#22C55E" : timerPercent > 0.25 ? "#EAB308" : "#EF4444";
  const isCountdown = timerRunning && timerSeconds <= 10;

  const qaSubmitRef = useRef<HTMLInputElement>(null);
  const addQAQuestion = () => {
    if (!qaSubmitRef.current?.value.trim()) return;
    const newQ: QAQuestion = {
      id: `qa_${Date.now()}`,
      text: qaSubmitRef.current.value.trim(),
      votes: 1,
      answered: false,
      askedBy: "Audience",
    };
    setQaQuestions((prev) => [newQ, ...prev]);
    qaSubmitRef.current.value = "";
  };

  const upvoteQA = (qid: string) => {
    setQaQuestions((prev) => prev.map((q) => q.id === qid ? { ...q, votes: q.votes + 1 } : q));
  };

  const toggleAnswerQA = (qid: string) => {
    setQaQuestions((prev) => prev.map((q) => q.id === qid ? { ...q, answered: !q.answered } : q));
  };

  const dismissQA = (qid: string) => {
    setQaQuestions((prev) => prev.filter((q) => q.id !== qid));
  };

  if (loading) {
    return <div className="min-h-screen bg-charcoal flex items-center justify-center"><Loader2 className="w-6 h-6 text-white/40 animate-spin" /></div>;
  }

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-charcoal flex flex-col relative overflow-hidden">

      {/* Timer bar */}
      {timerRunning && (
        <div ref={timerBarRef} className={`absolute top-0 left-0 right-0 z-[150] h-1 transition-all ${isCountdown ? "animate-pulseCountdown" : ""}`}
          style={{ background: timerColor, width: `${(timerMax > 0 ? (timerSeconds / timerMax) * 100 : 0)}%`, transition: "width 1s linear" }} />
      )}

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
            <button onClick={() => setShowTeleprompter(!showTeleprompter)} className={`p-2.5 rounded-lg transition-all ${showTeleprompter ? "text-sienna bg-sienna/10" : "text-white/50 hover:text-white hover:bg-white/10"}`} title="Teleprompter">
              <ScrollText className="w-4 h-4" />
            </button>
            <button onClick={() => setShowSlideSorter(true)} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Slide Sorter">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setShowQA(!showQA)} className={`p-2.5 rounded-lg transition-all ${showQA ? "text-sienna bg-sienna/10" : "text-white/50 hover:text-white hover:bg-white/10"}`} title="Q&A">
              <MessageCircle className="w-4 h-4" />
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
              slide.transition === "zoom" ? "animate-zoomIn" :
              slide.transition === "morph" ? "animate-morphIn" : ""
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
              <div key={el.id} data-seq-id={el.id} className="absolute"
                style={{
                  left: el.x ?? 0, top: el.y ?? 0,
                  width: el.width ?? 200, height: el.height ?? 40,
                }}>
                {el.type === "text" ? (
                  el.href ? (
                    <a href={el.href} target="_blank" rel="noopener noreferrer"
                      style={{ color: el.color, fontSize: el.fontSize || 18, fontFamily: el.fontFamily || "var(--font-heading)", fontWeight: el.fontWeight, fontStyle: el.fontStyle, textDecoration: "underline" }}>
                      {el.content}
                    </a>
                  ) : (
                    <div style={{ color: el.color, fontSize: el.fontSize || 18, fontFamily: el.fontFamily || "var(--font-heading)", fontWeight: el.fontWeight, fontStyle: el.fontStyle }}>
                      {el.content}
                    </div>
                  )
                ) : el.type === "code" ? (
                  <div className="w-full h-full bg-[#1E1E1E] rounded-lg overflow-auto border border-white/10">
                    <pre className="p-3 m-0 font-mono text-xs overflow-auto" style={{ whiteSpace: "pre" }}><code className={`language-${el.codeLanguage || "plaintext"}`}
                      dangerouslySetInnerHTML={{ __html: hljs.highlight(el.content, { language: el.codeLanguage || "plaintext", ignoreIllegals: true }).value }} /></pre>
                  </div>
                ) : el.svgContent ? (
                  <div className="w-full h-full flex items-center justify-center p-2"
                    dangerouslySetInnerHTML={{ __html: el.colorOverride ? el.svgContent.replace(/fill="[^"]*"/g, `fill="${el.colorOverride}"`).replace(/stroke="[^"]*"/g, `stroke="${el.colorOverride}"`) : el.svgContent }} />
                ) : el.type === "image" ? (
                  el.href ? (
                    <a href={el.href} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                      <img src={el.content} alt={el.alt || ""} className="w-full h-full object-cover rounded" draggable={false} />
                    </a>
                  ) : (
                    <img src={el.content} alt={el.alt || ""} className="w-full h-full object-cover rounded" draggable={false} />
                  )
                ) : el.type === "video" ? (
                  <video src={el.content} autoPlay={el.autoPlay} loop={el.loop} muted={el.muted} controls={el.controls !== false}
                    className="w-full h-full object-cover rounded" />
                ) : el.type === "audio" ? (
                  <div className="w-full h-full flex items-center gap-2 px-3 bg-[#1E1E1E] rounded-lg border border-white/10">
                    <button className="text-white/60 hover:text-white shrink-0" onClick={() => {
                      const aud = document.getElementById(`paudio-${el.id}`) as HTMLAudioElement;
                      if (aud) { if (aud.paused) aud.play(); else aud.pause(); }
                    }}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>
                    </button>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-sienna rounded-full" style={{ width: "0%" }} />
                    </div>
                    <span className="text-[10px] text-white/30 truncate max-w-[120px]">{el.content.split("/").pop()?.split("?")[0] || "audio"}</span>
                    <audio id={`paudio-${el.id}`} src={el.content} autoPlay={el.autoPlay} loop={el.loop} />
                  </div>
                ) : el.type === "gif" ? (
                  <img src={el.content} alt={el.alt || "GIF"} className="w-full h-full object-cover rounded" draggable={false}
                    style={el.speed ? { animationDuration: `${el.speed}s` } : undefined} />
                ) : el.type === "youtube" ? (
                  <iframe src={el.content} className="w-full h-full" allowFullScreen />
                ) : el.type === "latex" ? (
                  <div className="w-full h-full flex items-center justify-center overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: (() => { try { return renderLatexToSVG(el.content); } catch { return `<div style="font-family:monospace;color:#4ade80;background:#1a1a1a;padding:8px;border-radius:4px;white-space:pre-wrap">${el.content.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>`; } })() }} />
                ) : el.type === "mermaid" ? (
                  <MermaidPreview code={el.content} />
                ) : el.shapeText ? (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: el.color, borderRadius: el.borderRadius || 0 }}>
                    <span style={{ color: "#FFFFFF", fontSize: el.fontSize || 14, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{el.shapeText}</span>
                  </div>
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

      {/* Teleprompter */}
      {showTeleprompter && (
        <div className="fixed bottom-0 left-0 right-0 z-[120] h-1/4 bg-black/70 backdrop-blur-md border-t border-white/10">
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-wider text-white/40">Teleprompter</span>
              <button onClick={() => setTeleprompterPaused(!teleprompterPaused)}
                className="p-1 text-white/60 hover:text-white transition-colors">
                {teleprompterPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-white/30">Size</span>
                {["small", "medium", "large"].map((s) => (
                  <button key={s} onClick={() => setTeleprompterSize(s)}
                    className={`text-[10px] px-1.5 py-0.5 rounded ${teleprompterSize === s ? "bg-sienna/20 text-sienna" : "text-white/40 hover:text-white/60"}`}>{s[0].toUpperCase()}</button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-white/30">Speed</span>
                {["slow", "medium", "fast"].map((s) => (
                  <button key={s} onClick={() => setTeleprompterSpeed(s)}
                    className={`text-[10px] px-1.5 py-0.5 rounded ${teleprompterSpeed === s ? "bg-sienna/20 text-sienna" : "text-white/40 hover:text-white/60"}`}>{s[0].toUpperCase()}</button>
                ))}
              </div>
              <button onClick={() => setShowTeleprompter(false)} className="text-white/30 hover:text-white/60">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="h-[calc(100%-32px)] overflow-hidden relative">
            <div className="absolute inset-0 px-6 py-3"
              style={{
                animation: teleprompterPaused ? "none" : `tpScroll ${SPEED_MAP[teleprompterSpeed]}s linear infinite`,
                fontSize: `${SIZE_MAP[teleprompterSize]}px`,
              }}>
              <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
                {slide?.notes || "No notes for this slide. Add speaker notes in the editor."}
              </p>
              <p className="text-white/80 whitespace-pre-wrap leading-relaxed mt-4">
                {slide?.notes || "No notes for this slide. Add speaker notes in the editor."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Slide Sorter */}
      {showSlideSorter && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-xs text-white/40">Click to jump • Esc to close</span>
            <button onClick={() => setShowSlideSorter(false)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="w-full max-w-5xl max-h-[80vh] overflow-y-auto px-6">
            <div className="grid grid-cols-4 gap-4">
              {slides.map((s, i) => (
                <button key={s.id} onClick={() => { setCurrentSlide(i); setShowSlideSorter(false); }}
                  className={`group relative rounded-lg overflow-hidden border-2 transition-all hover:border-sienna ${i === currentSlide ? "border-sienna ring-2 ring-sienna/40" : "border-white/10"}`}>
                  <div className="aspect-video flex items-center justify-center" style={{ background: s.background }}>
                    <div className="w-full h-full p-2 flex flex-col justify-center">
                      {s.elements.filter((e) => e.type === "text" && e.visible !== false).slice(0, 3).map((el) => (
                        <div key={el.id} className="truncate text-[6px]" style={{ color: el.color }}>{el.content}</div>
                      ))}
                      {s.elements.length === 0 && <span className="text-[8px] text-white/20">Empty slide</span>}
                    </div>
                  </div>
                  <div className="absolute top-1 left-1 bg-black/70 text-[10px] text-white/80 w-5 h-5 rounded flex items-center justify-center font-medium">{i + 1}</div>
                  <div className="absolute bottom-1 right-1 bg-black/60 text-[8px] text-white/50 px-1.5 py-0.5 rounded">{s.elements.length} element{(s.elements.length || 0) !== 1 ? "s" : ""}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Speaker Notes Enhanced */}
      {showNotes && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[80vw] max-w-2xl z-[120]"
          style={{ height: notesHeight }}>
          <div
            onMouseDown={handleNotesResizeStart}
            className="absolute -top-1 left-0 right-0 h-2 cursor-n-resize hover:bg-sienna/30 rounded-t transition-colors z-10" />
          <div className="h-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-medium text-charcoal/40 uppercase tracking-wider">Speaker Notes</h3>
                <span className="text-[10px] text-charcoal/30">
                  {notesText ? `${notesText.split(/\s+/).length} words · ~${Math.max(1, Math.ceil(notesText.split(/\s+/).length / 150))} min read` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-charcoal/30">Size</span>
                  {["small", "medium", "large"].map((s) => (
                    <button key={s} onClick={() => setNotesFontSize(s)}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${notesFontSize === s ? "bg-sienna/20 text-sienna" : "text-charcoal/40 hover:text-charcoal/60"}`}>{s[0].toUpperCase()}</button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-charcoal/30">LH</span>
                  <input type="range" min="1" max="2.5" step="0.1" value={notesLineHeight}
                    onChange={(e) => setNotesLineHeight(parseFloat(e.target.value))}
                    className="w-12 accent-sienna h-0.5" />
                  <span className="text-[9px] text-charcoal/30 w-4">{notesLineHeight.toFixed(1)}</span>
                </div>
                <button onClick={() => setShowNotes(false)} className="text-charcoal/30 hover:text-charcoal/60">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full h-full bg-transparent resize-none outline-none text-charcoal/80 whitespace-pre-wrap"
                style={{ fontSize: `${NOTE_SIZE_MAP[notesFontSize]}px`, lineHeight: notesLineHeight }}
                placeholder="Add speaker notes for this slide..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Timer */}
      {showTimer && (
        <div className="fixed bottom-20 left-6 bg-white rounded-2xl shadow-2xl p-5 z-[120] w-56">
          <div className={`text-4xl font-mono text-charcoal text-center mb-3 ${isCountdown ? "text-red-500 animate-pulseCountdown" : ""}`}>{formatTime(timerSeconds)}</div>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setTimerRunning(!timerRunning)}
              className={`flex-1 text-xs py-2 rounded-lg font-medium transition-all ${timerRunning ? "bg-red-500 text-white" : "bg-sienna text-white hover:bg-sienna-dark"}`}>
              {timerRunning ? "Pause" : "Start"}
            </button>
            <button onClick={() => { setTimerRunning(false); setTimerSeconds(300); setTimerMax(300); }}
              className="flex-1 text-xs py-2 rounded-lg font-medium bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10 transition-all">Reset</button>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[60, 120, 300, 600, 900].map((s) => (
              <button key={s} onClick={() => { setTimerSeconds(s); setTimerMax(s); setTimerRunning(false); }}
                className="flex-1 text-[10px] py-1 bg-charcoal/5 rounded text-charcoal/40 hover:bg-charcoal/10 transition-all">
                {s >= 60 ? `${s / 60}m` : `${s}s`}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[1800, 3600].map((s) => (
              <button key={s} onClick={() => { setTimerSeconds(s); setTimerMax(s); setTimerRunning(false); }}
                className="flex-1 text-[10px] py-1 bg-charcoal/5 rounded text-charcoal/40 hover:bg-charcoal/10 transition-all">
                {s >= 60 ? `${s / 60}m` : `${s}s`}
              </button>
            ))}
          </div>
          <button onClick={() => { setTimerSeconds((s) => s + 60); setTimerMax((m) => m + 60); }}
            className="w-full text-[10px] py-1.5 bg-charcoal/5 rounded text-charcoal/40 hover:bg-charcoal/10 transition-all flex items-center justify-center gap-1">
            <Plus className="w-3 h-3" /> Add 1 minute
          </button>
        </div>
      )}

      {/* Q&A Panel */}
      {showQA && (
        <div className="fixed inset-y-0 right-0 w-80 z-[130] bg-[#1A1715]/95 backdrop-blur-md border-l border-white/10 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-medium text-white/80">Q&A</h3>
            <button onClick={() => setShowQA(false)} className="text-white/30 hover:text-white/60">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {qaQuestions.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-white/20" />
                <p className="text-xs text-white/30">No questions yet</p>
              </div>
            ) : (
              qaQuestions.sort((a, b) => b.votes - a.votes).map((q) => (
                <div key={q.id} className={`bg-[#2A2523] rounded-lg p-3 transition-all ${q.answered ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs ${q.answered ? "text-white/40 line-through" : "text-white/80"}`}>{q.text}</p>
                    <span className="text-[10px] text-white/30 shrink-0">{q.askedBy}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => upvoteQA(q.id)}
                      className="flex items-center gap-1 text-[10px] text-white/40 hover:text-sienna transition-colors">
                      <ThumbsUp className="w-3 h-3" /> {q.votes}
                    </button>
                    <button onClick={() => toggleAnswerQA(q.id)}
                      className="flex items-center gap-1 text-[10px] text-white/40 hover:text-green-400 transition-colors">
                      <CheckCircle2 className="w-3 h-3" /> {q.answered ? "Unmark" : "Mark answered"}
                    </button>
                    <button onClick={() => dismissQA(q.id)}
                      className="flex items-center gap-1 text-[10px] text-white/40 hover:text-red-400 transition-colors ml-auto">
                      <X className="w-3 h-3" /> Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-white/10">
            <div className="relative">
              <input ref={qaSubmitRef} type="text" placeholder="Type a question..."
                onKeyDown={(e) => { if (e.key === "Enter") addQAQuestion(); }}
                className="w-full bg-[#2A2523] text-white/80 text-xs rounded-lg px-3 py-2 pr-10 outline-none border border-white/10 focus:border-sienna transition-colors placeholder:text-white/20" />
              <button onClick={addQAQuestion}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-sienna transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
