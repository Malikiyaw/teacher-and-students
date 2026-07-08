"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Users, Hand, MessageSquare, Smile, BarChart3, MessageCircle,
  ClipboardList, Cloud, Brain, LogOut, Send, Plus, X, Check,
  ThumbsUp, ThumbsDown, Laugh, Heart, PartyPopper, Loader2,
  ChevronLeft, ChevronRight, PieChart, Activity,
} from "lucide-react";

const BG = "#1A1715";
const BG2 = "#2A2523";
const ACCENT = "#C4653A";
const ACCENT_HOVER = "#A84F2B";

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "polls", label: "Polls", icon: BarChart3 },
  { id: "wordcloud", label: "Word Cloud", icon: Cloud },
  { id: "quizzes", label: "Quizzes", icon: Brain },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "reactions", label: "Reactions", icon: Smile },
  { id: "attendance", label: "Attendance", icon: ClipboardList },
];

export default function LivePresenterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: presentationId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [participants, setParticipants] = useState<any[]>([]);
  const [handRaises, setHandRaises] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [wordClouds, setWordClouds] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [exitTickets, setExitTickets] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [wcQuestion, setWcQuestion] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    init();
  }, []);

  async function init() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: pres } = await supabase
      .from("presentations")
      .select("title")
      .eq("id", presentationId)
      .single();

    if (pres) setUserName(pres.title);

    const { data: existingRoom } = await supabase
      .from("rooms")
      .select("*")
      .eq("presentation_id", presentationId)
      .eq("status", "active")
      .single();

    if (existingRoom) {
      setRoom(existingRoom);
      await loadData(existingRoom.id);
      subscribe(existingRoom.id);
    } else {
      const { data: newRoom, error: err } = await supabase
        .from("rooms")
        .insert({
          teacher_id: user.id,
          presentation_id: presentationId,
          name: `Room for ${pres?.title || "Presentation"}`,
          code: generateCode(),
          max_students: 100,
          status: "active",
          settings: {},
        })
        .select()
        .single();

      if (err) { setError(err.message); setLoading(false); return; }
      setRoom(newRoom);
      subscribe(newRoom.id);
    }
    setLoading(false);
  }

  function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let c = "";
    for (let i = 0; i < 6; i++) c += chars.charAt(Math.floor(Math.random() * chars.length));
    return c;
  }

  async function loadData(roomId: string) {
    const [p, h, c, r, pl, w, q, a, e] = await Promise.all([
      supabase.from("room_participants").select("*").eq("room_id", roomId),
      supabase.from("hand_raises").select("*").eq("room_id", roomId).eq("is_raised", true),
      supabase.from("chat_messages").select("*").eq("room_id", roomId).order("created_at", { ascending: true }),
      supabase.from("reactions").select("*").eq("room_id", roomId).order("created_at", { ascending: false }).limit(50),
      supabase.from("polls").select("*, poll_votes(*)").eq("room_id", roomId).order("created_at", { ascending: false }),
      supabase.from("word_clouds").select("*, word_submissions(*)").eq("room_id", roomId).order("created_at", { ascending: false }),
      supabase.from("quizzes").select("*, quiz_responses(*)").eq("room_id", roomId).order("created_at", { ascending: false }),
      supabase.from("attendance").select("*").eq("room_id", roomId).order("joined_at", { ascending: false }),
      supabase.from("exit_tickets").select("*, exit_ticket_responses(*)").eq("room_id", roomId).order("created_at", { ascending: false }),
    ]);

    if (p.data) setParticipants(p.data);
    if (h.data) setHandRaises(h.data);
    if (c.data) setChatMessages(c.data);
    if (r.data) setReactions(r.data);
    if (pl.data) setPolls(pl.data);
    if (w.data) setWordClouds(w.data);
    if (q.data) setQuizzes(q.data);
    if (a.data) setAttendance(a.data);
    if (e.data) setExitTickets(e.data);
  }

  function subscribe(roomId: string) {
    const channel = supabase.channel(`room-${roomId}`);

    channel
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "room_participants", filter: `room_id=eq.${roomId}` },
        (payload) => setParticipants((prev) => [...prev, payload.new as any]))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "room_participants", filter: `room_id=eq.${roomId}` },
        () => loadData(roomId))
      .on("postgres_changes", { event: "*", schema: "public", table: "hand_raises", filter: `room_id=eq.${roomId}` },
        () => { supabase.from("hand_raises").select("*").eq("room_id", roomId).eq("is_raised", true).then((res) => { if (res.data) setHandRaises(res.data); }); })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => setChatMessages((prev) => [...prev, payload.new as any]))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reactions", filter: `room_id=eq.${roomId}` },
        (payload) => setReactions((prev) => [payload.new as any, ...prev].slice(0, 50)))
      .on("postgres_changes", { event: "*", schema: "public", table: "poll_votes", filter: `poll_id=in.(${(polls.map(p => p.id).join(","))})` },
        () => { supabase.from("polls").select("*, poll_votes(*)").eq("room_id", roomId).then((res) => { if (res.data) setPolls(res.data); }); })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "word_submissions", filter: `word_cloud_id=in.(${(wordClouds.map(w => w.id).join(","))})` },
        () => { supabase.from("word_clouds").select("*, word_submissions(*)").eq("room_id", roomId).then((res) => { if (res.data) setWordClouds(res.data); }); })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "attendance", filter: `room_id=eq.${roomId}` },
        (payload) => setAttendance((prev) => [payload.new as any, ...prev]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }

  async function endRoom() {
    if (!room) return;
    await supabase.from("rooms").update({ status: "ended" }).eq("id", room.id);
    router.push("/dashboard");
  }

  async function createPoll() {
    if (!room || !pollQuestion.trim() || pollOptions.filter((o) => o.trim()).length < 2) return;
    const { data } = await supabase
      .from("polls")
      .insert({ room_id: room.id, question: pollQuestion, options: pollOptions.filter((o) => o.trim()), is_active: true })
      .select()
      .single();
    if (data) {
      setPolls((prev) => [data, ...prev]);
      setPollQuestion("");
      setPollOptions(["", ""]);
    }
  }

  async function closePoll(pollId: string) {
    await supabase.from("polls").update({ is_active: false }).eq("id", pollId);
    setPolls((prev) => prev.map((p) => (p.id === pollId ? { ...p, is_active: false } : p)));
  }

  async function createWordCloud() {
    if (!room || !wcQuestion.trim()) return;
    const { data } = await supabase
      .from("word_clouds")
      .insert({ room_id: room.id, question: wcQuestion, words: [], is_active: true })
      .select()
      .single();
    if (data) {
      setWordClouds((prev) => [data, ...prev]);
      setWcQuestion("");
    }
  }

  async function closeWordCloud(id: string) {
    await supabase.from("word_clouds").update({ is_active: false }).eq("id", id);
    setWordClouds((prev) => prev.map((w) => (w.id === id ? { ...w, is_active: false } : w)));
  }

  async function createQuiz() {
    if (!room || !quizTitle.trim() || quizQuestions.length === 0) return;
    const { data } = await supabase
      .from("quizzes")
      .insert({ room_id: room.id, title: quizTitle, questions: quizQuestions })
      .select()
      .single();
    if (data) {
      setQuizzes((prev) => [data, ...prev]);
      setQuizTitle("");
      setQuizQuestions([]);
    }
  }

  function addQuizQuestion() {
    setQuizQuestions((prev) => [
      ...prev,
      { question: "", options: ["", ""], correctAnswer: 0 },
    ]);
  }

  function updateQuizQuestion(idx: number, field: string, value: any) {
    setQuizQuestions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  async function sendAnnouncement() {
    if (!room || !chatInput.trim()) return;
    await supabase.from("chat_messages").insert({
      room_id: room.id,
      user_id: (await supabase.auth.getUser()).data.user?.id || "",
      content: chatInput,
      is_announcement: true,
    });
    setChatInput("");
  }

  async function createExitTicket() {
    if (!room) return;
    const { data } = await supabase
      .from("exit_tickets")
      .insert({ room_id: room.id, question: "What did you learn today?", is_active: true })
      .select()
      .single();
    if (data) setExitTickets((prev) => [data, ...prev]);
  }

  function getPollVotes(poll: any): number[] {
    const optionsCount = (poll.options || []).length;
    const counts = new Array(optionsCount).fill(0);
    (poll.poll_votes || []).forEach((v: any) => {
      if (v.option_index >= 0 && v.option_index < optionsCount) counts[v.option_index]++;
    });
    return counts;
  }

  function getWordFrequency(words: string[]): { word: string; count: number }[] {
    const freq: Record<string, number> = {};
    words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);
  }

  if (loading) {
    return (
      <div style={{ background: BG }} className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  if (!room) {
    return (
      <div style={{ background: BG }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-2">{error || "Failed to create room"}</p>
          <button onClick={init} className="px-4 py-2 rounded-lg text-sm text-white" style={{ background: ACCENT }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: BG }} className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: BG2 }}>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push(`/present/${presentationId}`)} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: "rgba(255,255,255,0.5)" }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white font-semibold text-sm">Live Room</h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{userName}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: BG2 }}>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white font-mono font-bold tracking-widest text-lg">{room.code}</span>
          </div>
          <button onClick={endRoom} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style={{ background: "#B91C1C" }}>
            <LogOut className="w-4 h-4" /> End
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div className="px-6 py-3 flex items-center gap-6 border-b" style={{ borderColor: BG2 }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          <Users className="w-4 h-4" style={{ color: ACCENT }} />
          <span>{participants.length} connected</span>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          <Hand className="w-4 h-4" style={{ color: ACCENT }} />
          <span>{handRaises.length} hands raised</span>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          <MessageSquare className="w-4 h-4" style={{ color: ACCENT }} />
          <span>{chatMessages.length} messages</span>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          <Smile className="w-4 h-4" style={{ color: ACCENT }} />
          <span>{reactions.length} reactions</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-2 flex items-center gap-1 overflow-x-auto border-b" style={{ borderColor: BG2 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{
                background: isActive ? ACCENT : "transparent",
                color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)",
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={Users} label="Connected Students" value={participants.length} />
            <StatCard icon={Hand} label="Hands Raised" value={handRaises.length} />
            <StatCard icon={MessageSquare} label="Chat Messages" value={chatMessages.length} />
            <StatCard icon={Smile} label="Reactions" value={reactions.length} />
            <StatCard icon={BarChart3} label="Active Polls" value={polls.filter((p) => p.is_active).length} />
            <StatCard icon={Cloud} label="Word Clouds" value={wordClouds.filter((w) => w.is_active).length} />
            <StatCard icon={Brain} label="Quizzes" value={quizzes.length} />
            <StatCard icon={ClipboardList} label="Attendance" value={attendance.length} />
            <StatCard icon={ClipboardList} label="Exit Tickets" value={exitTickets.length} />

            {room && (
              <div className="col-span-full mt-4 p-6 rounded-xl" style={{ background: BG2 }}>
                <h3 className="text-white font-semibold mb-3">Share with Students</h3>
                <div className="flex items-center gap-3">
                  <input
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/join/${room.code}`}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-mono outline-none"
                    style={{ background: BG, color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/join/${room.code}`)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                    style={{ background: ACCENT }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "polls" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ background: BG2 }}>
              <h3 className="text-white font-semibold mb-4">Create Poll</h3>
              <input
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none mb-4"
                style={{ background: BG, color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <div className="space-y-2 mb-4">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={opt}
                      onChange={(e) => {
                        const next = [...pollOptions];
                        next[i] = e.target.value;
                        setPollOptions(next);
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 px-4 py-2 rounded-lg text-sm outline-none"
                      style={{ background: BG, color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                    {pollOptions.length > 2 && (
                      <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)", background: BG }}
                >
                  <Plus className="w-3 h-3" /> Add Option
                </button>
                <button
                  onClick={createPoll}
                  disabled={!pollQuestion.trim() || pollOptions.filter((o) => o.trim()).length < 2}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-30"
                  style={{ background: ACCENT }}
                >
                  <Send className="w-4 h-4" /> Launch Poll
                </button>
              </div>
            </div>

            {polls.map((poll) => {
              const votes = getPollVotes(poll);
              const total = votes.reduce((a, b) => a + b, 0);
              return (
                <div key={poll.id} className="p-6 rounded-xl" style={{ background: BG2 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium text-sm">{poll.question}</h4>
                      {poll.is_active ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Active</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">Closed</span>
                      )}
                    </div>
                    {poll.is_active && (
                      <button onClick={() => closePoll(poll.id)} className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-400/10 transition-colors">Close</button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {(poll.options || []).map((opt: string, i: number) => {
                      const pct = total > 0 ? Math.round((votes[i] / total) * 100) : 0;
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span style={{ color: "rgba(255,255,255,0.7)" }}>{opt}</span>
                            <span style={{ color: "rgba(255,255,255,0.4)" }}>{votes[i]} ({pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: BG }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: ACCENT }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>{total} total votes</p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "wordcloud" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ background: BG2 }}>
              <h3 className="text-white font-semibold mb-4">Start Word Cloud</h3>
              <input
                value={wcQuestion}
                onChange={(e) => setWcQuestion(e.target.value)}
                placeholder="What word comes to mind?"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none mb-4"
                style={{ background: BG, color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <button
                onClick={createWordCloud}
                disabled={!wcQuestion.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-30"
                style={{ background: ACCENT }}
              >
                <Cloud className="w-4 h-4" /> Launch Word Cloud
              </button>
            </div>

            {wordClouds.map((wc) => {
              const words = (wc.word_submissions || []).map((s: any) => s.word);
              const frequencies = getWordFrequency(words);
              const maxCount = frequencies.length > 0 ? frequencies[0].count : 1;
              return (
                <div key={wc.id} className="p-6 rounded-xl" style={{ background: BG2 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium text-sm">{wc.question}</h4>
                      {wc.is_active ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Active</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">Closed</span>
                      )}
                    </div>
                    {wc.is_active && (
                      <button onClick={() => closeWordCloud(wc.id)} className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-400/10 transition-colors">Close</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 p-4 rounded-lg min-h-[100px]" style={{ background: BG }}>
                    {frequencies.length === 0 && (
                      <p style={{ color: "rgba(255,255,255,0.3)" }} className="text-sm">No submissions yet</p>
                    )}
                    {frequencies.map(({ word, count }) => {
                      const size = 12 + (count / maxCount) * 28;
                      const opacity = 0.4 + (count / maxCount) * 0.6;
                      return (
                        <span
                          key={word}
                          className="inline-block transition-all"
                          style={{
                            fontSize: `${size}px`,
                            color: `rgba(255,255,255,${opacity})`,
                            fontWeight: count > maxCount / 2 ? 600 : 400,
                          }}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>{words.length} submissions</p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "quizzes" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ background: BG2 }}>
              <h3 className="text-white font-semibold mb-4">Create Quiz</h3>
              <input
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Quiz title..."
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none mb-4"
                style={{ background: BG, color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
              />

              {quizQuestions.map((q: any, i: number) => (
                <div key={i} className="mb-4 p-4 rounded-lg" style={{ background: BG }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium" style={{ color: ACCENT }}>Question {i + 1}</span>
                    <button onClick={() => setQuizQuestions((prev) => prev.filter((_, j) => j !== i))} className="text-red-400 hover:bg-red-400/10 p-1 rounded transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    value={q.question}
                    onChange={(e) => updateQuizQuestion(i, "question", e.target.value)}
                    placeholder="Enter question..."
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-2"
                    style={{ background: BG2, color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <div className="space-y-1.5 mb-2">
                    {q.options.map((opt: string, j: number) => (
                      <div key={j} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`q-${i}-correct`}
                          checked={q.correctAnswer === j}
                          onChange={() => updateQuizQuestion(i, "correctAnswer", j)}
                        />
                        <input
                          value={opt}
                          onChange={(e) => {
                            const opts = [...q.options];
                            opts[j] = e.target.value;
                            updateQuizQuestion(i, "options", opts);
                          }}
                          placeholder={`Option ${j + 1}`}
                          className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                          style={{ background: BG2, color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => updateQuizQuestion(i, "options", [...q.options, ""])}
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    + Add Option
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <button onClick={addQuizQuestion} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors" style={{ color: "rgba(255,255,255,0.5)", background: BG }}>
                  <Plus className="w-3 h-3" /> Add Question
                </button>
                <button
                  onClick={createQuiz}
                  disabled={!quizTitle.trim() || quizQuestions.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-30"
                  style={{ background: ACCENT }}
                >
                  <Brain className="w-4 h-4" /> Launch Quiz
                </button>
              </div>
            </div>

            {quizzes.map((quiz) => (
              <div key={quiz.id} className="p-6 rounded-xl" style={{ background: BG2 }}>
                <h4 className="text-white font-medium text-sm mb-2">{quiz.title}</h4>
                <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {(quiz.questions || []).length} questions · {(quiz.quiz_responses || []).length} responses
                </p>
                {(quiz.quiz_responses || []).length > 0 && (
                  <div className="space-y-1">
                    {(quiz.quiz_responses || []).slice(0, 10).map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between text-xs py-1 px-2 rounded" style={{ background: BG }}>
                        <span style={{ color: "rgba(255,255,255,0.6)" }}>{r.student_id?.slice(0, 8)}</span>
                        <span style={{ color: ACCENT }}>{r.score !== null ? `${r.score}%` : "Unscored"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="flex flex-col h-full max-h-[calc(100vh-280px)]">
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {chatMessages.length === 0 && (
                <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>No messages yet</p>
              )}
              {chatMessages.map((msg) => (
                <div key={msg.id} className="p-3 rounded-lg" style={{ background: msg.is_announcement ? `${ACCENT}20` : BG2 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium" style={{ color: msg.is_announcement ? ACCENT : "rgba(255,255,255,0.5)" }}>
                      {msg.is_announcement ? "Announcement" : msg.user_id?.slice(0, 8)}
                    </span>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-white">{msg.content}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendAnnouncement()}
                placeholder="Send announcement..."
                className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: BG2, color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <button onClick={sendAnnouncement} className="p-2.5 rounded-lg transition-colors" style={{ background: ACCENT }}>
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {activeTab === "reactions" && (
          <div>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Live emoji reactions from students</p>
            <div className="flex flex-wrap gap-2">
              {reactions.length === 0 && (
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No reactions yet</p>
              )}
              {reactions.map((r) => (
                <div key={r.id} className="text-2xl animate-bounce" style={{ animationDuration: "1s" }}>
                  {r.emoji}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                {attendance.length} student{attendance.length !== 1 ? "s" : ""} attended
              </p>
              <button onClick={() => loadData(room.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white transition-colors" style={{ background: ACCENT }}>
                Refresh
              </button>
            </div>
            <div className="space-y-1">
              {attendance.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: BG2 }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: `${ACCENT}20`, color: ACCENT }}>
                      {a.student_id?.slice(0, 2).toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{a.student_id?.slice(0, 12)}</p>
                      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Joined: {new Date(a.joined_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Present</span>
                </div>
              ))}
              {attendance.length === 0 && (
                <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>No attendance records yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="p-5 rounded-xl transition-all hover:scale-[1.02]" style={{ background: "#2A2523" }}>
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5" style={{ color: "#C4653A" }} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
    </div>
  );
}
