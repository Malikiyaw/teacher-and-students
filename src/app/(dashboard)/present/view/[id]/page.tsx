"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import {
  Presentation, Users, Check, Loader2, Hand, MessageSquare,
  SmilePlus, StickyNote, Clock, Trophy,
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
  textDecoration?: string;
  textAlign?: string;
  borderRadius?: number;
  codeLanguage?: string;
  shapeId?: string;
  chartType?: string;
  iconId?: string;
  qrContent?: string;
  qrData?: string;
  strokeColor?: string;
  strokeWidth?: number;
  strokeDash?: string;
  shadow?: string;
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
}
interface Slide { id: string; background: string; backgroundImage?: string; backgroundGradient?: string; showSlideNumber?: boolean; section?: string; elements: SlideElement[]; notes?: string; transition?: string; }

const reactionEmojis = ["👍", "❤️", "😮", "🔥", "👏", "💡"];

export default function StudentViewPage({ params }: { params: Promise<{ id: string }> }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomId, setRoomId] = useState("");
  const [students, setStudents] = useState(0);
  const [pollActive, setPollActive] = useState(false);
  const [activePoll, setActivePoll] = useState<{ id: string; question: string; options: string[] } | null>(null);
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [pollResults, setPollResults] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [studentNotes, setStudentNotes] = useState("");
  const [chatMessages, setChatMessages] = useState<{ id: string; user_name: string; content: string; is_announcement: boolean }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [activeQuiz, setActiveQuiz] = useState<{ id: string; title: string; questions: { question: string; options: string[]; correctIndex: number }[] } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizTimeLeft, setQuizTimeLeft] = useState(0);
  const [leaderboard, setLeaderboard] = useState<{ student_name: string; score: number; totalPoints: number }[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const [attentionPopup, setAttentionPopup] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const init = async (codeOrId: string) => {
      let roomData: any = null;
      const { data: r } = await supabase.from("rooms").select("*, presentations(*)").eq("code", codeOrId.toUpperCase()).eq("status", "active").single();
      if (r) { roomData = r; }
      else {
        const { data: r2 } = await supabase.from("rooms").select("*, presentations(*)").eq("id", codeOrId).single();
        if (r2) roomData = r2;
      }

      if (roomData) {
        setRoomName(roomData.name);
        setRoomCode(roomData.code);
        setRoomId(roomData.id);
        setCurrentSlide(roomData.current_slide || 0);
        const pres = roomData.presentations as { slides: Slide[] } | null;
        if (pres?.slides) setSlides(pres.slides as Slide[]);

        const { count } = await supabase.from("room_participants").select("*", { count: "exact", head: true }).eq("room_id", roomData.id);
        setStudents(count || 0);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
          setStudentNotes("");
          // Load existing notes
          const { data: noteData } = await supabase.from("student_notes").select("content").eq("presentation_id", roomData.presentations?.id).eq("student_id", user.id).eq("slide_index", 0).single();
          if (noteData) setStudentNotes(noteData.content);

          // Track attendance
          await supabase.from("attendance").upsert({ room_id: roomData.id, student_id: user.id }, { onConflict: "room_id,student_id" });
        }

        // Subscribe to realtime
        const channel = supabase.channel(`student-${roomData.id}`);

        // Slide sync
        channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomData.id}` },
          (payload) => {
            const updated = payload.new as { current_slide?: number; status?: string; timer_end?: string; timer_seconds?: number };
            if (updated.current_slide !== undefined) setCurrentSlide(updated.current_slide);
            if (updated.status === "ended") { window.location.href = "/dashboard/student"; }
            if (updated.timer_end) {
              const end = new Date(updated.timer_end).getTime();
              const now = Date.now();
              if (end > now) {
                setTimerSeconds(Math.ceil((end - now) / 1000));
                setTimerRunning(true);
              }
            } else if (updated.timer_end === null) {
              setTimerRunning(false);
              if (updated.timer_seconds !== undefined) setTimerSeconds(updated.timer_seconds);
            }
          }
        );

        // New polls
        channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "polls", filter: `room_id=eq.${roomData.id}` },
          (payload) => {
            const poll = payload.new as { id: string; question: string; options: string[] };
            setActivePoll({ id: poll.id, question: poll.question, options: poll.options as string[] });
            setPollActive(true);
            setVoted(false);
            setSelectedOption(null);
            setPollResults(null);
          }
        );

        // Poll closed
        channel.on("postgres_changes", { event: "DELETE", schema: "public", table: "polls", filter: `room_id=eq.${roomData.id}` },
          () => { setPollActive(false); setActivePoll(null); }
        );

        // Chat messages
        channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomData.id}` },
          async (payload) => {
            const msg = payload.new as { id: string; user_id: string; content: string; is_announcement: boolean; created_at: string };
            const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", msg.user_id).single();
            setChatMessages((prev) => [...prev, { ...msg, user_name: profile?.full_name || "You", is_announcement: msg.is_announcement }]);
            if (msg.is_announcement) { setAttentionPopup(true); setTimeout(() => setAttentionPopup(false), 5000); }
          }
        );

        // Reactions
        channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "reactions", filter: `room_id=eq.${roomData.id}` },
          (payload) => {
            const reaction = payload.new as { emoji: string };
            const id = Date.now();
            const x = 20 + Math.random() * 60;
            setFloatingReactions((prev) => [...prev, { id, emoji: reaction.emoji, x }]);
            setTimeout(() => setFloatingReactions((prev) => prev.filter((r) => r.id !== id)), 3000);
          }
        );

        // New quizzes
        channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "quizzes", filter: `room_id=eq.${roomData.id}` },
          (payload) => {
            const quiz = payload.new as { id: string; title: string; questions: any };
            setActiveQuiz({ id: quiz.id, title: quiz.title, questions: quiz.questions as any });
            setQuizAnswers(new Array((quiz.questions as any[]).length).fill(-1));
            setQuizTimeLeft(60 * (quiz.questions as any[]).length);
            setQuizSubmitted(false);
            setQuizScore(null);
          }
        );

        channel.subscribe();
        setLoading(false);

        return () => { supabase.removeChannel(channel); };
      }
      setLoading(false);
    };
    params.then((p) => init(p.id));
  }, [params, supabase]);

  // Inject transition keyframes
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = transitionStyles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // Room timer countdown
  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => { if (s <= 1) { setTimerRunning(false); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Quiz timer
  useEffect(() => {
    if (quizTimeLeft <= 0 || quizSubmitted || !activeQuiz) return;
    const interval = setInterval(() => {
      setQuizTimeLeft((t) => {
        if (t <= 1) { submitQuiz(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quizTimeLeft, quizSubmitted, activeQuiz]);

  // Load notes when slide changes
  useEffect(() => {
    const loadNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !roomId) return;
      const { data } = await supabase.from("student_notes").select("content").eq("student_id", user.id).eq("slide_index", currentSlide).maybeSingle();
      if (data) setStudentNotes(data.content);
      else setStudentNotes("");
    };
    loadNotes();
  }, [currentSlide, roomId, supabase]);

  const handleVote = async (optionIndex: number) => {
    if (!activePoll || voted) return;
    setSelectedOption(optionIndex);
    setVoted(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("poll_votes").upsert({ poll_id: activePoll.id, student_id: user.id, option_index: optionIndex }, { onConflict: "poll_id,student_id" });
    fetch("/api/points", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: user.id, room_id: roomId, points: 10, reason: "Poll participation" }) });
    // Fetch results
    const { data: votes } = await supabase.from("poll_votes").select("option_index").eq("poll_id", activePoll.id);
    if (votes) {
      const counts = new Array(activePoll.options.length).fill(0);
      votes.forEach((v) => { counts[v.option_index] = (counts[v.option_index] || 0) + 1; });
      setPollResults(counts);
    }
  };

  const toggleHandRaise = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !roomId) return;
    await supabase.from("hand_raises").upsert({ room_id: roomId, student_id: user.id, is_raised: !handRaised }, { onConflict: "room_id,student_id" });
    setHandRaised(!handRaised);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !roomId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("chat_messages").insert({ room_id: roomId, user_id: user.id, content: chatInput.trim() });
    setChatInput("");
  };

  const sendReaction = async (emoji: string) => {
    if (!roomId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("reactions").insert({ room_id: roomId, user_id: user.id, emoji });
    setShowReactions(false);
  };

  const saveNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !roomId) return;
    const presId = (await supabase.from("rooms").select("presentation_id").eq("id", roomId).single()).data?.presentation_id;
    if (!presId) return;
    await supabase.from("student_notes").upsert({ presentation_id: presId, student_id: user.id, slide_index: currentSlide, content: studentNotes }, { onConflict: "presentation_id,student_id,slide_index" });
  };

  const submitQuiz = async () => {
    if (!activeQuiz || quizSubmitted) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("quiz_responses").insert({
      quiz_id: activeQuiz.id, student_id: user.id, answers: quizAnswers,
    }).select("score").single();
    if (data) {
      setQuizScore(data.score);
      setQuizSubmitted(true);
      // Award points based on score
      const pct = (data.score / 100);
      const pts = pct >= 0.9 ? 100 : pct >= 0.7 ? 75 : pct >= 0.5 ? 50 : 25;
      fetch("/api/points", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: user.id, room_id: roomId, points: pts, reason: `Quiz: ${activeQuiz.title}` }) });
      // Fetch leaderboard
      const { data: responses } = await supabase.from("quiz_responses").select("score, student_id").eq("quiz_id", activeQuiz.id).order("score", { ascending: false }).limit(10);
      if (responses) {
        const { data: pointsData } = await fetch("/api/points").then((r) => r.json()).catch(() => ({ leaderboard: [] }));
        const pointsMap = new Map<string, number>();
        for (const entry of (pointsData?.leaderboard ?? []) as { student_id: string; total_points: number }[]) {
          pointsMap.set(entry.student_id, entry.total_points);
        }
        const lb = await Promise.all(responses.map(async (r) => {
          const { data: p } = await supabase.from("profiles").select("full_name").eq("id", r.student_id).single();
          return { student_name: p?.full_name || "Student", score: r.score || 0, totalPoints: pointsMap.get(r.student_id) || 0 };
        }));
        setLeaderboard(lb);
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-charcoal flex items-center justify-center"><Loader2 className="w-6 h-6 text-white/40 animate-spin" /></div>;
  }

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-charcoal flex flex-col relative overflow-hidden">
      {/* Floating reactions */}
      {floatingReactions.map((r) => (
        <div key={r.id} className="fixed text-3xl z-[200] pointer-events-none animate-bounce"
          style={{ left: `${r.x}%`, bottom: "15%", animationDuration: "2s" }}>
          {r.emoji}
        </div>
      ))}

      {/* Attention popup */}
      {attentionPopup && (
        <div className="fixed inset-0 bg-red-600/90 z-[150] flex items-center justify-center animate-pulse">
          <div className="text-center">
            <h1 className="font-heading text-4xl text-white mb-2">ATTENTION!</h1>
            <p className="text-lg text-white/80">Please look at the screen</p>
          </div>
        </div>
      )}

      {/* Floating timer */}
      {timerRunning && timerSeconds > 0 && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[140] px-6 py-3 rounded-2xl shadow-2xl ${
          timerSeconds <= 10 ? "bg-red-500 animate-pulse" : "bg-white"
        }`}>
          <span className={`font-mono text-3xl font-bold ${timerSeconds <= 10 ? "text-white" : "text-charcoal"}`}>
            {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Top bar */}
      <div className="h-10 bg-[#2A2523] border-b border-white/5 flex items-center px-4 shrink-0 z-[50]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-sienna rounded-md flex items-center justify-center"><Presentation className="w-3 h-3 text-white" /></div>
          <span className="text-[11px] text-white/50 font-medium">{roomName}</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button onClick={toggleHandRaise} className={`p-1.5 rounded-lg transition-all ${handRaised ? "text-yellow-400 bg-yellow-400/10" : "text-white/30 hover:text-white/50"}`}>
            <Hand className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowReactions(!showReactions)} className="p-1.5 text-white/30 hover:text-white/50 rounded-lg transition-all">
            <SmilePlus className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowChat(!showChat)} className="p-1.5 text-white/30 hover:text-white/50 rounded-lg transition-all">
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowNotes(!showNotes)} className="p-1.5 text-white/30 hover:text-white/50 rounded-lg transition-all">
            <StickyNote className="w-3.5 h-3.5" />
          </button>
          <span className="flex items-center gap-1 text-[10px] text-white/30"><Users className="w-3 h-3" />{students}</span>
          <span className="text-[10px] text-white/20 font-mono">{roomCode}</span>
        </div>
      </div>

      {/* Reactions picker */}
      {showReactions && (
        <div className="fixed top-12 right-4 bg-white rounded-full shadow-xl px-3 py-1.5 z-[60] flex items-center gap-2">
          {reactionEmojis.map((emoji) => (
            <button key={emoji} onClick={() => sendReaction(emoji)} className="text-xl hover:scale-125 transition-transform">{emoji}</button>
          ))}
        </div>
      )}

      {/* Main slide area with transitions */}
      <div className="flex-1 flex items-center justify-center p-4">
        {slide ? (
          <div key={currentSlide} className={`w-full max-w-4xl aspect-video shadow-2xl shadow-black/30 flex items-center justify-center relative overflow-hidden rounded-lg ${
            slide.transition === "fade" ? "animate-fadeIn" :
            slide.transition === "slide" ? "animate-slideIn" :
            slide.transition === "zoom" ? "animate-zoomIn" : ""
          }`}
            style={{ background: slide.backgroundGradient || (slide.backgroundImage ? `url(${slide.backgroundImage}) center/cover` : slide.background) }}>
            {slide.showSlideNumber && <div className="absolute bottom-2 right-3 text-[10px] text-white/30 pointer-events-none z-50">{currentSlide + 1}</div>}
            {(slide.elements || []).map((el) => (
              <div key={el.id} className="absolute"
                style={{ left: el.x ?? 0, top: el.y ?? 0, width: el.width ?? 200, height: el.height ?? 40, boxShadow: el.shadow, transform: `${el.flipH ? " scaleX(-1)" : ""}${el.flipV ? " scaleY(-1)" : ""}`, borderRadius: el.borderRadius || 0 }}>
                {el.type === "text" ? (
                  <div style={{ color: el.color, fontSize: el.fontSize || 18, fontFamily: el.fontFamily || "var(--font-heading)", fontWeight: el.fontWeight, fontStyle: el.fontStyle, textDecoration: el.textDecoration, textAlign: el.textAlign as any, backgroundColor: el.highlight || undefined, padding: "2px 4px", borderRadius: el.borderRadius || 0 }}>
                    {el.content}
                  </div>
                ) : el.type === "code" ? (
                  <div className="w-full h-full bg-[#1E1E1E] rounded-lg overflow-auto border border-white/10">
                    <pre className="p-3 m-0 font-mono text-xs overflow-auto" style={{ whiteSpace: "pre" }}><code className={`language-${el.codeLanguage || "plaintext"}`}
                      dangerouslySetInnerHTML={{ __html: hljs.highlight(el.content, { language: el.codeLanguage || "plaintext", ignoreIllegals: true }).value }} /></pre>
                  </div>
                ) : el.type === "image" ? (
                  el.crop ? (
                    <div className="w-full h-full overflow-hidden rounded" style={{ borderRadius: el.borderRadius || 0 }}>
                      <img src={el.content} alt={el.alt || ""} className="absolute" draggable={false} style={{ left: -el.crop.x, top: -el.crop.y, width: el.crop.width, height: el.crop.height, objectFit: "none" }} />
                    </div>
                  ) : (
                    <img src={el.content} alt={el.alt || ""} className="w-full h-full object-cover rounded" draggable={false} style={{ borderRadius: el.borderRadius || 0 }} />
                  )
                ) : el.type === "youtube" ? (
                  <iframe src={el.content} className="w-full h-full rounded" allowFullScreen style={{ borderRadius: el.borderRadius || 0 }} />
                ) : el.type === "line" ? (
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="0" x2={(el.lineEndX || el.width || 200) - (el.x || 0)} y2={(el.lineEndY || el.height || 3) - (el.y || 0)}
                      stroke={el.strokeColor || el.color} strokeWidth={el.strokeWidth || 3}
                      strokeDasharray={el.strokeDash || undefined} />
                  </svg>
                ) : el.type === "table" ? (
                  <table className="w-full h-full border-collapse text-xs" style={{ color: el.color }}>
                    <tbody>{(el.tableData || Array.from({ length: el.tableRows || 3 }, () => Array(el.tableCols || 3).fill("") as string[])).map((row: string[], ri: number) => (
                      <tr key={ri}>{row.map((cell: string, ci: number) => (
                        <td key={ci} className="border border-white/20 px-2 py-1">{cell}</td>
                      ))}</tr>
                    ))}</tbody>
                  </table>
                ) : el.type === "shape" && (el.iconId || el.chartType || el.qrData || el.shapeId) ? (
                  <div className="w-full h-full flex items-center justify-center rounded" style={{ background: el.gradient || "transparent", borderRadius: el.borderRadius || 0, border: el.strokeWidth ? `${el.strokeWidth}px ${el.strokeDash || "solid"} ${el.strokeColor || el.color}` : undefined }}>
                    {el.qrData ? <div dangerouslySetInnerHTML={{ __html: el.qrData }} /> :
                     el.iconId ? <svg width={el.width} height={el.height} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d={el.content} fill={el.color} /></svg> :
                     el.chartType ? <div className="text-[10px] text-white/40">[{el.chartType} chart]</div> :
                     <svg width={el.width} height={el.height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="100" height="100" fill={el.color} rx={el.borderRadius || 0} /></svg>}
                  </div>
                ) : (
                  <div className="w-full h-full rounded" style={{ background: el.color || el.gradient, borderRadius: el.borderRadius || 0, border: el.strokeWidth ? `${el.strokeWidth}px ${el.strokeDash || "solid"} ${el.strokeColor || el.color}` : undefined }} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/30">
            <Presentation className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Waiting for presentation to load...</p>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="h-10 bg-[#2A2523] border-t border-white/5 flex items-center justify-between px-4 shrink-0 z-[50]">
        <span className="text-[10px] text-white/30">Slide {currentSlide + 1} of {slides.length || 1}</span>
        <div className="flex items-center gap-1">
          {slides.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i === currentSlide ? "w-4 bg-sienna" : "w-1 bg-white/20"}`} />
          ))}
        </div>
        <span className="text-[10px] text-white/20 font-mono">{roomCode}</span>
      </div>

      {/* Poll overlay */}
      {pollActive && activePoll && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-96 bg-white rounded-2xl shadow-2xl p-5 z-[60]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-charcoal">Live Poll</h3>
            <span className="text-[10px] text-sienna font-medium bg-sienna/10 px-2 py-0.5 rounded-full animate-pulse">Active</span>
          </div>
          <p className="text-sm text-charcoal/70 mb-4">{activePoll.question}</p>
          <div className="space-y-2 mb-4">
            {activePoll.options.map((opt, i) => (
              <button key={i} onClick={() => handleVote(i)} disabled={voted}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all relative overflow-hidden ${
                  voted ? selectedOption === i ? "border-sienna bg-sienna/5 text-sienna" : "border-border bg-cream/50 text-charcoal/40" : "border-border hover:border-charcoal/20 text-charcoal"
                }`}>
                {voted && pollResults && (
                  <div className="absolute inset-0 bg-sienna/5 transition-all duration-500" style={{ width: `${pollResults.reduce((a, b) => a + b, 0) > 0 ? (pollResults[i] / pollResults.reduce((a, b) => a + b, 0)) * 100 : 0}%` }} />
                )}
                <span className="relative">{opt} {voted && selectedOption === i && <Check className="w-4 h-4 inline ml-2" />}</span>
                {voted && pollResults && <span className="relative float-right text-charcoal/40">{pollResults[i]}</span>}
              </button>
            ))}
          </div>
          {voted && <p className="text-xs text-[#16A34A] text-center">Vote submitted!</p>}
        </div>
      )}

      {/* Quiz overlay */}
      {activeQuiz && !quizSubmitted && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg text-charcoal">{activeQuiz.title}</h3>
                <p className="text-xs text-charcoal/40">{activeQuiz.questions.length} questions</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sienna" />
                <span className={`font-mono text-sm ${quizTimeLeft < 30 ? "text-red-500" : "text-charcoal"}`}>
                  {Math.floor(quizTimeLeft / 60)}:{(quizTimeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[50vh] space-y-6">
              {activeQuiz.questions.map((q, qi) => (
                <div key={qi}>
                  <p className="text-sm font-medium text-charcoal mb-3">{qi + 1}. {q.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <button key={oi} onClick={() => { const newAnswers = [...quizAnswers]; newAnswers[qi] = oi; setQuizAnswers(newAnswers); }}
                        className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                          quizAnswers[qi] === oi ? "border-sienna bg-sienna/5 text-sienna" : "border-border hover:border-charcoal/20 text-charcoal/70"
                        }`}>
                        <span className="font-medium mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-border">
              <button onClick={submitQuiz}
                className="w-full bg-sienna text-white text-sm font-medium py-2.5 rounded-lg hover:bg-sienna-dark transition-all">
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz results + leaderboard */}
      {quizSubmitted && activeQuiz && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-border text-center">
              <Trophy className="w-10 h-10 text-sienna mx-auto mb-2" />
              <h3 className="font-heading text-xl text-charcoal">Quiz Complete!</h3>
              <p className="text-3xl font-heading text-sienna mt-2">{quizScore} points</p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <h4 className="text-sm font-medium text-charcoal mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-sienna" /> Leaderboard</h4>
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${i === 0 ? "bg-sienna/5" : "bg-cream/50"}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-sienna text-white" : i === 1 ? "bg-charcoal/20 text-charcoal" : "bg-charcoal/10 text-charcoal/50"}`}>
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-charcoal">{entry.student_name}</span>
                    <span className="text-xs text-charcoal/40 font-medium">Total XP: {entry.totalPoints}</span>
                    <span className="text-sm font-medium text-charcoal/60">{entry.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border">
              <button onClick={() => setActiveQuiz(null)}
                className="w-full bg-charcoal text-white text-sm font-medium py-2.5 rounded-lg hover:bg-charcoal-light transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat panel */}
      {showChat && (
        <div className="fixed right-0 top-10 bottom-0 w-72 bg-[#2A2523] shadow-2xl z-[55] flex flex-col">
          <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">Chat</span>
            <button onClick={() => setShowChat(false)} className="text-white/30 hover:text-white/50"><span className="text-xs">X</span></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMessages.length === 0 ? (
              <p className="text-[10px] text-white/20 text-center mt-8">No messages</p>
            ) : chatMessages.map((msg) => (
              <div key={msg.id} className={`text-xs ${msg.is_announcement ? "text-red-400 font-bold" : "text-white/50"}`}>
                {msg.is_announcement ? msg.content : <><span className="text-white/30">{msg.user_name}: </span>{msg.content}</>}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-white/5 flex gap-1.5">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 outline-none" />
            <button onClick={sendChat} className="bg-sienna text-white p-1.5 rounded-lg"><MessageSquare className="w-3 h-3" /></button>
          </div>
        </div>
      )}

      {/* Notes panel */}
      {showNotes && (
        <div className="fixed left-0 top-10 bottom-0 w-72 bg-[#2A2523] shadow-2xl z-[55] flex flex-col">
          <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">My Notes</span>
            <button onClick={() => { setShowNotes(false); saveNotes(); }} className="text-sienna text-[10px]">Save & Close</button>
          </div>
          <textarea value={studentNotes} onChange={(e) => setStudentNotes(e.target.value)}
            placeholder="Take notes on this slide..."
            className="flex-1 bg-transparent text-xs text-white/50 p-3 resize-none outline-none placeholder:text-white/20" />
        </div>
      )}
    </div>
  );
}
