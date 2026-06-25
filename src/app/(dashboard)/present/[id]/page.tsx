"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Maximize, Minimize, Users, Timer,
  Vote, PenTool, X, MessageSquare, Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SlideElement {
  type: string; content: string; color: string; fontSize?: number;
}
interface Slide { id: string; background: string; elements: SlideElement[]; }

export default function PresentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [room, setRoom] = useState<{ name: string; code: string; id: string } | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showPoll, setShowPoll] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [laserOn, setLaserOn] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [showChat, setShowChat] = useState(false);
  const [students, setStudents] = useState(0);
  const [activePoll, setActivePoll] = useState<{ question: string; options: string[]; votes: number[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Check if id is a room ID or presentation ID
      let roomData: any = null;
      const { data: r } = await supabase
        .from("rooms").select("*, presentations(*)").eq("id", id).single();

      if (r) {
        roomData = r;
        const pres = r.presentations as { slides: Slide[] } | null;
        if (pres?.slides) setSlides(pres.slides as Slide[]);
      } else {
        // Try as presentation directly
        const { data: pres } = await supabase
          .from("presentations").select("*").eq("id", id).single();
        if (pres?.slides) setSlides(pres.slides as Slide[]);
      }

      if (roomData) {
        setRoom({ name: roomData.name, code: roomData.code, id: roomData.id });

        // Get student count
        const { count } = await supabase
          .from("room_participants").select("*", { count: "exact", head: true })
          .eq("room_id", roomData.id);
        setStudents(count || 0);

        // Subscribe to room participants
        const channel = supabase
          .channel(`room-${roomData.id}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "room_participants", filter: `room_id=eq.${roomData.id}` },
            async () => {
              const { count: c } = await supabase
                .from("room_participants").select("*", { count: "exact", head: true })
                .eq("room_id", roomData.id);
              setStudents(c || 0);
            }
          )
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "polls", filter: `room_id=eq.${roomData.id}` },
            (payload) => {
              const poll = payload.new as { question: string; options: string[] };
              setActivePoll({ question: poll.question, options: poll.options as string[], votes: new Array((poll.options as string[]).length).fill(0) });
              setShowPoll(true);
            }
          )
          .subscribe();

        return () => { supabase.removeChannel(channel); };
      }
      setLoading(false);
    };
    init();
  }, [id, supabase, router]);

  const goTo = useCallback((dir: "next" | "prev") => {
    if (dir === "next" && currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
    else if (dir === "prev" && currentSlide > 0) setCurrentSlide(currentSlide - 1);
  }, [currentSlide, slides.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goTo("next"); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goTo("prev"); }
      else if (e.key === "f") toggleFullscreen();
      else if (e.key === "Escape") { setShowPoll(false); setShowTimer(false); setShowChat(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => { setTimerSeconds((s) => (s > 0 ? s - 1 : 0)); }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (!laserOn) return;
    const handler = (e: MouseEvent) => { setLaserPos({ x: e.clientX, y: e.clientY }); };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [laserOn]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-[#1A1715]"><Loader2 className="w-6 h-6 text-white/40 animate-spin" /></div>;
  }

  const slide = slides[currentSlide] || { id: "0", background: "#FFFFFF", elements: [] };

  return (
    <div className="h-screen w-screen relative overflow-hidden cursor-none select-none" style={{ background: slide.background }}
      onMouseMove={() => { setShowToolbar(true); setTimeout(() => setShowToolbar(false), 3000); }}>
      {laserOn && <div className="fixed z-[100] pointer-events-none" style={{ left: laserPos.x - 6, top: laserPos.y - 6 }}>
        <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse" />
      </div>}

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-w-[1920px] max-h-[1080px] relative">
          {slide.elements.map((el, i) => (
            <div key={i} className="absolute" style={{ left: `${(el as unknown as { x?: number }).x || (i * 50)}%`, top: `${(el as unknown as { y?: number }).y || 30}%`, width: "50%" }}>
              {el.type === "text" && <div style={{ color: el.color, fontSize: el.fontSize, fontFamily: "var(--font-heading)", whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{el.content}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Top toolbar */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/40 to-transparent transition-opacity duration-500 ${showToolbar ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-all"><X className="w-4 h-4" /></Link>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2"><Users className="w-3.5 h-3.5 text-white/60" /><span className="text-xs font-medium text-white/80">{students} connected</span></div>
            {room && <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2"><span className="text-xs text-white/50 font-mono">{room.code}</span></div>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowPoll(!showPoll)} className={`p-2 rounded-lg transition-all ${showPoll ? "bg-sienna text-white" : "bg-white/10 backdrop-blur-sm text-white/60 hover:text-white"}`} title="Poll"><Vote className="w-4 h-4" /></button>
            <button onClick={() => setShowTimer(!showTimer)} className={`p-2 rounded-lg transition-all ${showTimer ? "bg-sienna text-white" : "bg-white/10 backdrop-blur-sm text-white/60 hover:text-white"}`} title="Timer"><Timer className="w-4 h-4" /></button>
            <button onClick={() => setLaserOn(!laserOn)} className={`p-2 rounded-lg transition-all ${laserOn ? "bg-red-500 text-white" : "bg-white/10 backdrop-blur-sm text-white/60 hover:text-white"}`} title="Laser"><PenTool className="w-4 h-4" /></button>
            <button onClick={toggleFullscreen} className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/60 hover:text-white transition-all">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Poll overlay */}
      {showPoll && activePoll && (
        <div className="absolute bottom-24 left-6 w-80 bg-white rounded-2xl shadow-2xl p-6 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg text-charcoal">Live Poll</h3>
            <span className="text-xs text-sienna font-medium bg-sienna/10 px-2.5 py-0.5 rounded-full animate-pulse">Active</span>
          </div>
          <p className="text-sm text-charcoal/70 mb-4">{activePoll.question}</p>
          <div className="space-y-2">
            {activePoll.options.map((opt, i) => {
              const total = activePoll.votes.reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((activePoll.votes[i] / total) * 100);
              return (
                <div key={i} className="relative">
                  <div className="absolute inset-0 bg-sienna/10 rounded-lg transition-all duration-500" style={{ width: `${pct}%` }} />
                  <div className="relative flex items-center justify-between px-3 py-2.5 rounded-lg">
                    <span className="text-sm text-charcoal">{opt}</span>
                    <span className="text-xs font-medium text-sienna">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-charcoal/40 text-center">{students} students connected</div>
        </div>
      )}

      {/* Timer overlay */}
      {showTimer && (
        <div className="absolute bottom-24 right-6 bg-charcoal rounded-2xl shadow-2xl p-6 z-50 text-center">
          <div className="font-heading text-5xl text-white mb-4 font-mono">{formatTime(timerSeconds)}</div>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setTimerRunning(!timerRunning)} className="bg-sienna text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-sienna-dark transition-all">
              {timerRunning ? "Pause" : "Start"}
            </button>
            <button onClick={() => { setTimerRunning(false); setTimerSeconds(300); }} className="bg-white/10 text-white/60 text-xs font-medium px-4 py-2 rounded-lg hover:bg-white/20 transition-all">Reset</button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            {[60, 120, 300, 600].map((s) => (
              <button key={s} onClick={() => { setTimerSeconds(s); setTimerRunning(false); }} className="text-[10px] text-white/30 hover:text-white/60 px-2 py-1 rounded transition-colors">{s / 60}m</button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-500 ${showToolbar ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => goTo("prev")} disabled={currentSlide === 0} className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-6 bg-sienna" : "w-1.5 bg-white/30 hover:bg-white/50"}`} />
            ))}
          </div>
          <button onClick={() => goTo("next")} disabled={currentSlide === slides.length - 1} className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}
