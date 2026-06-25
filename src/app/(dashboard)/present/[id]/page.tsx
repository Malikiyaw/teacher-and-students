"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Maximize, Minimize, Users, Timer,
  Vote, X, MessageSquare, Loader2, Hand, SmilePlus, AlertTriangle,
  StopCircle, Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SlideElement {
  id: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  content: string;
  color: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  borderRadius?: number;
  zIndex?: number;
}
interface Slide {
  id: string;
  background: string;
  elements: SlideElement[];
  notes?: string;
  transition?: string;
}

const reactionEmojis = ["👍", "❤️", "😮", "🔥", "👏", "💡"];

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
  const [showChat, setShowChat] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showHandRaises, setShowHandRaises] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [laserOn, setLaserOn] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [students, setStudents] = useState(0);
  const [activePoll, setActivePoll] = useState<{ id: string; question: string; options: string[]; votes: number[] } | null>(null);
  const [chatMessages, setChatMessages] = useState<{ id: string; user_name: string; content: string; created_at: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [handRaises, setHandRaises] = useState<{ student_id: string; student_name: string }[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const [attentionMode, setAttentionMode] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickedStudent, setPickedStudent] = useState<string | null>(null);
  const [pickerSpinning, setPickerSpinning] = useState(false);
  const [studentList, setStudentList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const toolbarTimer = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Initialize
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      let roomData: any = null;
      const { data: r } = await supabase.from("rooms").select("*, presentations(*)").eq("id", id).single();
      if (r) {
        roomData = r;
        const pres = r.presentations as { slides: Slide[] } | null;
        if (pres?.slides) setSlides(pres.slides as Slide[]);
        setCurrentSlide(r.current_slide || 0);
      } else {
        const { data: pres } = await supabase.from("presentations").select("*").eq("id", id).single();
        if (pres?.slides) setSlides(pres.slides as Slide[]);
      }

      if (roomData) {
        setRoom({ name: roomData.name, code: roomData.code, id: roomData.id });

        const { count } = await supabase.from("room_participants").select("*", { count: "exact", head: true }).eq("room_id", roomData.id);
        setStudents(count || 0);

        const { data: participants } = await supabase.from("room_participants").select("student_id").eq("room_id", roomData.id);
        if (participants && participants.length > 0) {
          const sIds = participants.map((p: { student_id: string }) => p.student_id);
          const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", sIds);
          if (profiles) setStudentList(profiles.map((p: any) => ({ id: p.id, name: p.full_name || "Student" })));
        }

        const channel = supabase.channel(`presenter-${roomData.id}`);

        // Room participants changes
        channel.on("postgres_changes", { event: "*", schema: "public", table: "room_participants", filter: `room_id=eq.${roomData.id}` },
          async () => {
            const { count: c } = await supabase.from("room_participants").select("*", { count: "exact", head: true }).eq("room_id", roomData.id);
            setStudents(c || 0);
          }
        );

        // Slide sync: student navigated
        channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomData.id}` },
          (payload) => {
            const updated = payload.new as { current_slide?: number };
            if (updated.current_slide !== undefined && updated.current_slide !== currentSlide) {
              setCurrentSlide(updated.current_slide);
            }
          }
        );

        // New polls
        channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "polls", filter: `room_id=eq.${roomData.id}` },
          (payload) => {
            const poll = payload.new as { id: string; question: string; options: string[] };
            setActivePoll({ id: poll.id, question: poll.question, options: poll.options as string[], votes: new Array((poll.options as string[]).length).fill(0) });
            setShowPoll(true);
          }
        );

        // Poll votes (real-time)
        channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "poll_votes" },
          (payload) => {
            const vote = payload.new as { poll_id: string; option_index: number };
            setActivePoll((prev) => {
              if (!prev || prev.id !== vote.poll_id) return prev;
              const newVotes = [...prev.votes];
              newVotes[vote.option_index] = (newVotes[vote.option_index] || 0) + 1;
              return { ...prev, votes: newVotes };
            });
          }
        );

        // Chat messages
        channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomData.id}` },
          async (payload) => {
            const msg = payload.new as { id: string; user_id: string; content: string; created_at: string };
            const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", msg.user_id).single();
            setChatMessages((prev) => [...prev, { ...msg, user_name: profile?.full_name || "Student" }]);
          }
        );

        // Hand raises
        channel.on("postgres_changes", { event: "*", schema: "public", table: "hand_raises", filter: `room_id=eq.${roomData.id}` },
          async () => {
            const { data: raises } = await supabase.from("hand_raises").select("student_id, is_raised").eq("room_id", roomData.id).eq("is_raised", true);
            if (raises) {
              const withNames = await Promise.all(raises.map(async (r) => {
                const { data: p } = await supabase.from("profiles").select("full_name").eq("id", r.student_id).single();
                return { student_id: r.student_id, student_name: p?.full_name || "Student" };
              }));
              setHandRaises(withNames);
            }
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

        // Load existing chat messages
        const { data: existingMessages } = await supabase.from("chat_messages").select("*").eq("room_id", roomData.id).order("created_at", { ascending: true }).limit(50);
        if (existingMessages) {
          const withNames = await Promise.all(existingMessages.map(async (m) => {
            const { data: p } = await supabase.from("profiles").select("full_name").eq("id", m.user_id).single();
            return { ...m, user_name: p?.full_name || "Student" };
          }));
          setChatMessages(withNames);
        }

        // Load existing hand raises
        const { data: existingRaises } = await supabase.from("hand_raises").select("student_id, is_raised").eq("room_id", roomData.id).eq("is_raised", true);
        if (existingRaises) {
          const withNames = await Promise.all(existingRaises.map(async (r) => {
            const { data: p } = await supabase.from("profiles").select("full_name").eq("id", r.student_id).single();
            return { student_id: r.student_id, student_name: p?.full_name || "Student" };
          }));
          setHandRaises(withNames);
        }

        channel.subscribe();
        setLoading(false);

        return () => { supabase.removeChannel(channel); };
      }
      setLoading(false);
    };
    init();
  }, [id, supabase, router, currentSlide]);

  const goTo = useCallback(async (dir: number) => {
    const next = Math.max(0, Math.min(slides.length - 1, currentSlide + dir));
    setCurrentSlide(next);
    if (room) {
      await supabase.from("rooms").update({ current_slide: next }).eq("id", room.id);
    }
  }, [currentSlide, slides.length, room, supabase]);

  // Broadcast slide to students
  const broadcastSlide = async (slideIndex: number) => {
    setCurrentSlide(slideIndex);
    if (room) {
      await supabase.from("rooms").update({ current_slide: slideIndex }).eq("id", room.id);
    }
  };

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goTo(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(-1); }
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "Escape") { setShowPoll(false); setShowTimer(false); setShowChat(false); setShowReactions(false); setShowHandRaises(false); setAttentionMode(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo]);

  // Timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => { if (s <= 1) { setTimerRunning(false); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Toolbar auto-hide
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

  const sendChat = async () => {
    if (!chatInput.trim() || !room) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("chat_messages").insert({ room_id: room.id, user_id: user.id, content: chatInput.trim() });
    setChatInput("");
  };

  const endSession = async () => {
    if (!room) return;
    await supabase.from("rooms").update({ status: "ended" }).eq("id", room.id);
    router.push("/dashboard");
  };

  const sendAttentionCheck = async () => {
    setAttentionMode(true);
    if (room) {
      await supabase.from("chat_messages").insert({
        room_id: room.id, user_id: (await supabase.auth.getUser()).data.user?.id || "",
        content: "⚡ ATTENTION: Please look at the screen!", is_announcement: true,
      });
    }
    setTimeout(() => setAttentionMode(false), 5000);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const pickRandomStudent = () => {
    if (studentList.length === 0) return;
    setPickerSpinning(true);
    setPickedStudent(null);
    let count = 0;
    const interval = setInterval(() => {
      const random = studentList[Math.floor(Math.random() * studentList.length)];
      setPickedStudent(random.name);
      count++;
      if (count > 20) {
        clearInterval(interval);
        const final = studentList[Math.floor(Math.random() * studentList.length)];
        setPickedStudent(final.name);
        setPickerSpinning(false);
      }
    }, 100);
  };

  const broadcastTimer = async (seconds: number, running: boolean) => {
    if (room) {
      await supabase.from("rooms").update({
        timer_seconds: seconds,
        timer_end: running ? new Date(Date.now() + seconds * 1000).toISOString() : null,
      }).eq("id", room.id);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-charcoal flex items-center justify-center"><Loader2 className="w-6 h-6 text-white/40 animate-spin" /></div>;
  }

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-charcoal flex flex-col relative overflow-hidden"
      onMouseMove={() => setShowToolbar(true)}>
      {/* Floating reactions */}
      {floatingReactions.map((r) => (
        <div key={r.id} className="fixed text-4xl z-[200] pointer-events-none animate-bounce"
          style={{ left: `${r.x}%`, bottom: "10%", animationDuration: "2s" }}>
          {r.emoji}
        </div>
      ))}

      {/* Attention mode overlay */}
      {attentionMode && (
        <div className="fixed inset-0 bg-red-600/90 z-[150] flex items-center justify-center animate-pulse">
          <div className="text-center">
            <AlertTriangle className="w-20 h-20 text-white mx-auto mb-4" />
            <h1 className="font-heading text-5xl text-white mb-2">ATTENTION!</h1>
            <p className="text-xl text-white/80">Please look at the screen</p>
          </div>
        </div>
      )}

      {/* Top toolbar */}
      <div className={`absolute top-0 left-0 right-0 z-[100] bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 ${showToolbar ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="h-14 flex items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-white/60 bg-white/10 px-3 py-1.5 rounded-full">
              <Users className="w-3.5 h-3.5" /> {students} students
            </span>
            {room && <span className="text-xs text-white/40 font-mono bg-white/5 px-3 py-1.5 rounded-full">{room.code}</span>}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <button onClick={() => setShowPoll(!showPoll)} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Polls">
              <Vote className="w-4 h-4" />
            </button>
            <button onClick={() => setShowTimer(!showTimer)} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Timer">
              <Timer className="w-4 h-4" />
            </button>
            <button onClick={() => setShowChat(!showChat)} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all relative" title="Chat">
              <MessageSquare className="w-4 h-4" />
              {chatMessages.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sienna text-[9px] text-white rounded-full flex items-center justify-center">{chatMessages.length}</span>}
            </button>
            <button onClick={() => setShowHandRaises(!showHandRaises)} className={`p-2.5 rounded-lg transition-all ${handRaises.length > 0 ? "text-yellow-400 bg-yellow-400/10 animate-pulse" : "text-white/50 hover:text-white hover:bg-white/10"}`} title="Hand Raises">
              <Hand className="w-4 h-4" />
              {handRaises.length > 0 && <span className="ml-1 text-xs">{handRaises.length}</span>}
            </button>
            <button onClick={() => setShowReactions(!showReactions)} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Reactions">
              <SmilePlus className="w-4 h-4" />
            </button>
            <button onClick={() => { setShowPicker(true); pickRandomStudent(); }} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Random Student Picker">
              <Users className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/20 mx-1" />
            <button onClick={sendAttentionCheck} className="p-2.5 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Attention Check">
              <AlertTriangle className="w-4 h-4" />
            </button>
            <button onClick={() => setLaserOn(!laserOn)} className={`p-2.5 rounded-lg transition-all ${laserOn ? "text-red-400 bg-red-400/10" : "text-white/50 hover:text-white hover:bg-white/10"}`} title="Laser">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
            </button>
            <div className="w-px h-6 bg-white/20 mx-1" />
            <button onClick={() => setShowEndConfirm(true)} className="p-2.5 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="End Session">
              <StopCircle className="w-4 h-4" />
            </button>
            <button onClick={toggleFullscreen} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Laser pointer */}
      {laserOn && (
        <div className="fixed z-[110] pointer-events-none" style={{ left: laserPos.x - 8, top: laserPos.y - 8 }}>
          <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse" />
        </div>
      )}
      {laserOn && (
        <div className="fixed inset-0 z-[105]" onMouseMove={(e) => setLaserPos({ x: e.clientX, y: e.clientY })} />
      )}

      {/* Main slide */}
      <div className="flex-1 flex items-center justify-center p-4">
        {slide ? (
          <div className="w-full max-w-5xl aspect-video shadow-2xl shadow-black/30 flex items-center justify-center relative overflow-hidden rounded-lg"
            style={{ background: slide.background }}>
            {(slide.elements || []).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map((el) => (
              <div key={el.id} className="absolute"
                style={{
                  left: el.x ?? 0, top: el.y ?? 0,
                  width: el.width ?? 200, height: el.height ?? 40,
                }}>
                {el.type === "text" ? (
                  <div style={{ color: el.color, fontSize: el.fontSize || 18, fontFamily: "var(--font-heading)", fontWeight: el.fontWeight, fontStyle: el.fontStyle }}>
                    {el.content}
                  </div>
                ) : el.type === "code" ? (
                  <div className="w-full h-full bg-[#1E1E1E] rounded-lg p-3 font-mono text-xs text-green-400 border border-white/10 overflow-auto" style={{ whiteSpace: "pre" }}>{el.content}</div>
                ) : el.type === "image" ? (
                  <img src={el.content} alt="" className="w-full h-full object-cover rounded" draggable={false} />
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
              <button key={i} onClick={() => broadcastSlide(i)}
                className={`h-1.5 rounded-full transition-all ${i === currentSlide ? "w-6 bg-sienna" : "w-1.5 bg-white/30 hover:bg-white/50"}`} />
            ))}
          </div>
          <button onClick={() => goTo(1)} disabled={currentSlide === slides.length - 1}
            className="p-3 text-white/50 hover:text-white disabled:opacity-20 transition-all bg-white/5 hover:bg-white/10 rounded-full disabled:bg-transparent">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Poll overlay */}
      {showPoll && activePoll && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-2xl shadow-2xl p-5 z-[120]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-charcoal">Live Poll</h3>
            <span className="text-[11px] text-sienna font-medium bg-sienna/10 px-2 py-0.5 rounded-full animate-pulse">Active</span>
          </div>
          <p className="text-sm text-charcoal/70 mb-4">{activePoll.question}</p>
          <div className="space-y-2">
            {activePoll.options.map((opt, i) => {
              const totalVotes = activePoll.votes.reduce((a, b) => a + b, 0);
              const pct = totalVotes > 0 ? Math.round((activePoll.votes[i] / totalVotes) * 100) : 0;
              return (
                <div key={i} className="relative">
                  <div className="absolute inset-0 rounded-lg overflow-hidden">
                    <div className="h-full bg-sienna/10 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="relative flex items-center justify-between px-3 py-2.5 text-sm text-charcoal">
                    <span>{opt}</span>
                    <span className="font-medium text-charcoal/60">{pct}% ({activePoll.votes[i]})</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-center text-xs text-charcoal/40">{activePoll.votes.reduce((a, b) => a + b, 0)} votes</div>
          <button onClick={() => { setShowPoll(false); setActivePoll(null); }}
            className="mt-3 w-full text-xs text-charcoal/40 hover:text-charcoal/60 transition-colors">Close Poll</button>
        </div>
      )}

      {/* Timer overlay */}
      {showTimer && (
        <div className="fixed bottom-20 left-6 bg-white rounded-2xl shadow-2xl p-5 z-[120]">
          <div className="text-4xl font-mono text-charcoal text-center mb-3">{formatTime(timerSeconds)}</div>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => { const newRunning = !timerRunning; setTimerRunning(newRunning); broadcastTimer(timerSeconds, newRunning); }}
              className={`flex-1 text-xs py-2 rounded-lg font-medium transition-all ${timerRunning ? "bg-red-500 text-white" : "bg-sienna text-white hover:bg-sienna-dark"}`}>
              {timerRunning ? "Pause" : "Start"}
            </button>
            <button onClick={() => { setTimerRunning(false); setTimerSeconds(300); broadcastTimer(300, false); }}
              className="flex-1 text-xs py-2 rounded-lg font-medium bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10 transition-all">Reset</button>
          </div>
          <div className="flex gap-1.5">
            {[60, 120, 300, 600].map((s) => (
              <button key={s} onClick={() => { setTimerSeconds(s); setTimerRunning(false); broadcastTimer(s, false); }}
                className="flex-1 text-[10px] py-1 bg-charcoal/5 rounded text-charcoal/40 hover:bg-charcoal/10 transition-all">
                {s >= 60 ? `${s / 60}m` : `${s}s`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat panel */}
      {showChat && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-[130] flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-medium text-charcoal">Room Chat</h3>
            <button onClick={() => setShowChat(false)} className="text-charcoal/40 hover:text-charcoal/60"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <p className="text-xs text-charcoal/30 text-center mt-8">No messages yet</p>
            ) : chatMessages.map((msg) => (
              <div key={msg.id} className={`text-sm ${msg.user_name === "Teacher" ? "text-sienna font-medium" : "text-charcoal/70"}`}>
                <span className="text-[10px] text-charcoal/30 block">{msg.user_name}</span>
                {msg.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Type a message..."
              className="flex-1 bg-cream border border-border rounded-lg px-3 py-2 text-sm text-charcoal outline-none focus:border-sienna/40" />
            <button onClick={sendChat} className="bg-sienna text-white p-2 rounded-lg hover:bg-sienna-dark transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hand raises panel */}
      {showHandRaises && (
        <div className="fixed right-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-[130] flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-medium text-charcoal">Hand Raises ({handRaises.length})</h3>
            <button onClick={() => setShowHandRaises(false)} className="text-charcoal/40 hover:text-charcoal/60"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {handRaises.length === 0 ? (
              <p className="text-xs text-charcoal/30 text-center mt-8">No raised hands</p>
            ) : handRaises.map((h) => (
              <div key={h.student_id} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                <Hand className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-charcoal">{h.student_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reactions picker */}
      {showReactions && (
        <div className="fixed bottom-20 right-1/2 translate-x-1/2 bg-white rounded-full shadow-xl px-4 py-2 z-[120] flex items-center gap-3">
          {reactionEmojis.map((emoji) => (
            <button key={emoji} onClick={async () => {
              if (!room) return;
              const { data: { user } } = await supabase.auth.getUser();
              supabase.from("reactions").insert({ room_id: room.id, user_id: user?.id || "", emoji });
              setShowReactions(false);
            }}
              className="text-2xl hover:scale-125 transition-transform">{emoji}</button>
          ))}
        </div>
      )}

      {/* Random Student Picker */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200]" onClick={() => { if (!pickerSpinning) setShowPicker(false); }}>
          <div className="bg-white rounded-3xl p-8 w-96 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-xl text-charcoal mb-6">Random Student Picker</h3>
            {studentList.length === 0 ? (
              <p className="text-sm text-charcoal/40 mb-6">No students in this room yet.</p>
            ) : (
              <>
                <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-heading transition-all ${
                  pickerSpinning ? "bg-sienna/20 animate-spin" : "bg-sienna/10"
                }`}>
                  <span className={`text-4xl font-heading text-sienna ${pickerSpinning ? "animate-pulse" : ""}`}>
                    {pickedStudent ? pickedStudent.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
                  </span>
                </div>
                {pickedStudent && !pickerSpinning && (
                  <div className="mb-6">
                    <div className="text-2xl font-heading text-charcoal mb-1">{pickedStudent}</div>
                    <div className="text-xs text-charcoal/40">{studentList.length} students in room</div>
                  </div>
                )}
                <button onClick={pickRandomStudent} disabled={pickerSpinning}
                  className="w-full bg-sienna text-white text-sm font-medium py-3 rounded-xl hover:bg-sienna-dark transition-all disabled:opacity-50">
                  {pickerSpinning ? "Picking..." : "Pick Again"}
                </button>
              </>
            )}
            <button onClick={() => { if (!pickerSpinning) setShowPicker(false); }}
              className="w-full mt-3 text-xs text-charcoal/40 hover:text-charcoal/60 transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* End session confirm */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150]" onClick={() => setShowEndConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 w-80 text-center" onClick={(e) => e.stopPropagation()}>
            <StopCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="font-heading text-xl text-charcoal mb-2">End Session?</h3>
            <p className="text-sm text-charcoal/50 mb-5">This will end the room for all students.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowEndConfirm(false)}
                className="flex-1 text-sm py-2.5 rounded-lg border border-border text-charcoal/60 hover:bg-cream transition-all">Cancel</button>
              <button onClick={endSession}
                className="flex-1 text-sm py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all font-medium">End Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
