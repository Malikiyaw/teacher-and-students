"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Users,
  Timer,
  Vote,
  Brain,
  PenTool,
  X,
  MessageSquare,
} from "lucide-react";

const slides = [
  {
    id: "1",
    background: "#FFFFFF",
    elements: [
      { id: "e1", type: "text" as const, x: 80, y: 120, width: 400, height: 60, content: "Photosynthesis", color: "#1C1917", fontSize: 42 },
      { id: "e2", type: "text" as const, x: 80, y: 200, width: 300, height: 30, content: "Chapter 4 — Biology 101", color: "#6B6560", fontSize: 16 },
    ],
  },
  {
    id: "2",
    background: "#FAF8F5",
    elements: [
      { id: "e3", type: "text" as const, x: 60, y: 60, width: 500, height: 50, content: "What is Photosynthesis?", color: "#1C1917", fontSize: 28 },
      { id: "e4", type: "text" as const, x: 60, y: 130, width: 500, height: 200, content: "The process by which plants convert light energy into chemical energy, producing glucose and oxygen from carbon dioxide and water.", color: "#6B6560", fontSize: 18 },
    ],
  },
  {
    id: "3",
    background: "#1C1917",
    elements: [
      { id: "e5", type: "text" as const, x: 60, y: 60, width: 500, height: 50, content: "The Equation", color: "#FFFFFF", fontSize: 28 },
      { id: "e6", type: "text" as const, x: 60, y: 140, width: 600, height: 60, content: "6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂", color: "#C4653A", fontSize: 24 },
    ],
  },
  {
    id: "4",
    background: "#FFFFFF",
    elements: [
      { id: "e7", type: "text" as const, x: 60, y: 60, width: 500, height: 50, content: "Key Takeaways", color: "#1C1917", fontSize: 28 },
      { id: "e8", type: "text" as const, x: 60, y: 130, width: 500, height: 200, content: "• Light energy is absorbed by chlorophyll\n• Carbon dioxide is taken in from the air\n• Water is absorbed through roots\n• Glucose and oxygen are produced", color: "#6B6560", fontSize: 18 },
    ],
  },
];

const pollOptions = [
  { text: "Chlorophyll", votes: 12 },
  { text: "Mitochondria", votes: 3 },
  { text: "Nucleus", votes: 2 },
  { text: "Ribosome", votes: 1 },
];

export default function PresentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
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
  const [students] = useState(24);

  const goTo = useCallback((dir: "next" | "prev") => {
    if (dir === "next" && currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (dir === "prev" && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goTo("next");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo("prev");
      } else if (e.key === "f") {
        toggleFullscreen();
      } else if (e.key === "Escape") {
        setShowPoll(false);
        setShowTimer(false);
        setShowChat(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (!laserOn) return;
    const handler = (e: MouseEvent) => {
      setLaserPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [laserOn]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const slide = slides[currentSlide];

  return (
    <div
      className="h-screen w-screen relative overflow-hidden cursor-none select-none"
      style={{ background: slide.background }}
      onMouseMove={() => {
        setShowToolbar(true);
        setTimeout(() => setShowToolbar(false), 3000);
      }}
    >
      {/* Laser pointer */}
      {laserOn && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{ left: laserPos.x - 6, top: laserPos.y - 6 }}
        >
          <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse" />
        </div>
      )}

      {/* Slide content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-w-[1920px] max-h-[1080px] relative">
          {slide.elements.map((el) => (
            <div
              key={el.id}
              className="absolute"
              style={{
                left: `${(el.x / 720) * 100}%`,
                top: `${(el.y / 405) * 100}%`,
                width: `${(el.width / 720) * 100}%`,
              }}
            >
              {el.type === "text" && (
                <div
                  style={{
                    color: el.color,
                    fontSize: `${el.fontSize}px`,
                    fontFamily: "var(--font-heading)",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.4,
                  }}
                >
                  {el.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top toolbar */}
      <div
        className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/40 to-transparent transition-opacity duration-500 ${
          showToolbar ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-all"
            >
              <X className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <Users className="w-3.5 h-3.5 text-white/60" />
              <span className="text-xs font-medium text-white/80">
                {students} connected
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <span className="text-xs text-white/50 font-mono">XKCD</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPoll(!showPoll)}
              className={`p-2 rounded-lg transition-all ${
                showPoll
                  ? "bg-sienna text-white"
                  : "bg-white/10 backdrop-blur-sm text-white/60 hover:text-white"
              }`}
              title="Launch Poll"
            >
              <Vote className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowTimer(!showTimer)}
              className={`p-2 rounded-lg transition-all ${
                showTimer
                  ? "bg-sienna text-white"
                  : "bg-white/10 backdrop-blur-sm text-white/60 hover:text-white"
              }`}
              title="Timer"
            >
              <Timer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLaserOn(!laserOn)}
              className={`p-2 rounded-lg transition-all ${
                laserOn
                  ? "bg-red-500 text-white"
                  : "bg-white/10 backdrop-blur-sm text-white/60 hover:text-white"
              }`}
              title="Laser Pointer"
            >
              <PenTool className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg transition-all ${
                showChat
                  ? "bg-sienna text-white"
                  : "bg-white/10 backdrop-blur-sm text-white/60 hover:text-white"
              }`}
              title="Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/60 hover:text-white transition-all"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Poll overlay */}
      {showPoll && (
        <div className="absolute bottom-24 left-6 w-80 bg-white rounded-2xl shadow-2xl p-6 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg text-charcoal">Live Poll</h3>
            <span className="text-xs text-sienna font-medium bg-sienna/10 px-2.5 py-0.5 rounded-full animate-pulse">
              Active
            </span>
          </div>
          <p className="text-sm text-charcoal/70 mb-4">
            Where does photosynthesis primarily take place?
          </p>
          <div className="space-y-2">
            {pollOptions.map((opt) => {
              const total = pollOptions.reduce((a, b) => a + b.votes, 0);
              const pct = Math.round((opt.votes / total) * 100);
              return (
                <div key={opt.text} className="relative">
                  <div
                    className="absolute inset-0 bg-sienna/10 rounded-lg transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between px-3 py-2.5 rounded-lg">
                    <span className="text-sm text-charcoal">{opt.text}</span>
                    <span className="text-xs font-medium text-sienna">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-charcoal/40 text-center">
            18 of {students} students voted
          </div>
        </div>
      )}

      {/* Timer overlay */}
      {showTimer && (
        <div className="absolute bottom-24 right-6 bg-charcoal rounded-2xl shadow-2xl p-6 z-50 text-center">
          <div className="font-heading text-5xl text-white mb-4 font-mono">
            {formatTime(timerSeconds)}
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="bg-sienna text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-sienna-dark transition-all"
            >
              {timerRunning ? "Pause" : "Start"}
            </button>
            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(300);
              }}
              className="bg-white/10 text-white/60 text-xs font-medium px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
            >
              Reset
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            {[60, 120, 300, 600].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setTimerSeconds(s);
                  setTimerRunning(false);
                }}
                className="text-[10px] text-white/30 hover:text-white/60 px-2 py-1 rounded transition-colors"
              >
                {s / 60}m
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat panel */}
      {showChat && (
        <div className="absolute bottom-24 right-6 w-72 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-medium text-charcoal">Student Chat</h3>
            <button onClick={() => setShowChat(false)} className="text-charcoal/30 hover:text-charcoal/50">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="h-48 overflow-y-auto p-4 space-y-3">
            {[
              { name: "Alex M.", msg: "Is this on the test?" },
              { name: "Sarah K.", msg: "Can you go back?" },
              { name: "Mike R.", msg: "This makes sense now!" },
            ].map((m, i) => (
              <div key={i}>
                <span className="text-[11px] font-medium text-sienna">
                  {m.name}
                </span>
                <p className="text-xs text-charcoal/60">{m.msg}</p>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border">
            <input
              type="text"
              placeholder="Send announcement..."
              className="w-full bg-charcoal/5 rounded-lg px-3 py-2 text-xs text-charcoal placeholder:text-charcoal/30 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-500 ${
          showToolbar ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => goTo("prev")}
            disabled={currentSlide === 0}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentSlide
                    ? "w-6 bg-sienna"
                    : "w-1.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => goTo("next")}
            disabled={currentSlide === slides.length - 1}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
