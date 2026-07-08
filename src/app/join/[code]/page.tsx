"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Hand, MessageSquare, Send, ThumbsUp, Loader2, ArrowRight,
  Cloud, Brain, ClipboardList, Star, BarChart3, X, Check,
  Laugh, Heart, PartyPopper, SmilePlus,
} from "lucide-react";

const BG = "#1A1715";
const BG2 = "#2A2523";
const ACCENT = "#C4653A";

const EMOJIS = ["👍", "❤️", "😂", "🔥", "🎉", "😮", "👏", "💯"];

export default function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: roomCodeFromUrl } = use(params);
  const supabase = createClient();

  const [step, setStep] = useState<"join" | "dashboard">("join");
  const [name, setName] = useState("");
  const [room, setRoom] = useState<any>(null);
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roomCode, setRoomCode] = useState(roomCodeFromUrl || "");

  const [handRaised, setHandRaised] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [polls, setPolls] = useState<any[]>([]);
  const [wordClouds, setWordClouds] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeExitTicket, setActiveExitTicket] = useState<any>(null);
  const [exitTicketResponse, setExitTicketResponse] = useState("");
  const [exitTicketRating, setExitTicketRating] = useState(5);

  const [quizAnswers, setQuizAnswers] = useState<Record<string, any[]>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (step === "dashboard" && room) {
      loadRoomData(room.id);
      subscribe(room.id);
    }
  }, [step, room?.id]);

  async function handleJoin() {
    if (!name.trim() || !roomCode.trim()) return;
    setLoading(true);
    setError("");

    const code = roomCode.toUpperCase();
    const { data: foundRoom, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .eq("status", "active")
      .single();

    if (roomError || !foundRoom) {
      setError("Room not found or no longer active");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    let sid = user?.id;
    if (!sid) {
      sid = localStorage.getItem("anon_user_id");
      if (!sid) {
        sid = crypto.randomUUID();
        localStorage.setItem("anon_user_id", sid);
      }
      localStorage.setItem("anon_user_name", name);
    }

    await supabase.from("room_participants").upsert(
      { room_id: foundRoom.id, student_id: sid },
      { onConflict: "room_id,student_id" }
    );

    await supabase.from("attendance").upsert(
      { room_id: foundRoom.id, student_id: sid },
      { onConflict: "room_id,student_id" }
    );

    setRoom(foundRoom);
    setStudentId(sid);
    setStep("dashboard");
    setLoading(false);
  }

  async function loadRoomData(roomId: string) {
    const [p, w, q, c, e] = await Promise.all([
      supabase.from("polls").select("*, poll_votes(*)").eq("room_id", roomId).eq("is_active", true),
      supabase.from("word_clouds").select("*, word_submissions(*)").eq("room_id", roomId).eq("is_active", true),
      supabase.from("quizzes").select("*, quiz_responses(*)").eq("room_id", roomId).order("created_at", { ascending: false }).limit(5),
      supabase.from("chat_messages").select("*").eq("room_id", roomId).order("created_at", { ascending: true }),
      supabase.from("exit_tickets").select("*, exit_ticket_responses(*)").eq("room_id", roomId).eq("is_active", true),
    ]);

    if (p.data) setPolls(p.data);
    if (w.data) setWordClouds(w.data);
    if (q.data) setQuizzes(q.data);
    if (c.data) setChatMessages(c.data);
    if (e.data && e.data.length > 0) {
      setActiveExitTicket(e.data[0]);
    }
  }

  function subscribe(roomId: string) {
    const channel = supabase.channel(`join-${roomId}`);

    channel
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => setChatMessages((prev) => [...prev, payload.new as any]))
      .on("postgres_changes", { event: "*", schema: "public", table: "polls", filter: `room_id=eq.${roomId}` },
        () => { supabase.from("polls").select("*, poll_votes(*)").eq("room_id", roomId).eq("is_active", true).then((res) => { if (res.data) setPolls(res.data); }); })
      .on("postgres_changes", { event: "*", schema: "public", table: "word_clouds", filter: `room_id=eq.${roomId}` },
        () => { supabase.from("word_clouds").select("*, word_submissions(*)").eq("room_id", roomId).eq("is_active", true).then((res) => { if (res.data) setWordClouds(res.data); }); })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "exit_tickets", filter: `room_id=eq.${roomId}` },
        (payload) => { setActiveExitTicket(payload.new as any); })
      .on("postgres_changes", { event: "*", schema: "public", table: "quizzes", filter: `room_id=eq.${roomId}` },
        () => { supabase.from("quizzes").select("*, quiz_responses(*)").eq("room_id", roomId).order("created_at", { ascending: false }).limit(5).then((res) => { if (res.data) setQuizzes(res.data); }); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }

  async function toggleHandRaise() {
    const newState = !handRaised;
    setHandRaised(newState);

    const { data: existing } = await supabase
      .from("hand_raises")
      .select("id")
      .eq("room_id", room.id)
      .eq("student_id", studentId)
      .single();

    if (existing) {
      await supabase.from("hand_raises").update({ is_raised: newState }).eq("id", existing.id);
    } else {
      await supabase.from("hand_raises").insert({
        room_id: room.id,
        student_id: studentId,
        is_raised: newState,
      });
    }
  }

  async function sendReaction(emoji: string) {
    await supabase.from("reactions").insert({
      room_id: room.id,
      user_id: studentId,
      emoji,
    });
  }

  async function sendChat() {
    if (!chatInput.trim()) return;
    await supabase.from("chat_messages").insert({
      room_id: room.id,
      user_id: studentId,
      content: chatInput,
      is_announcement: false,
    });
    setChatInput("");
  }

  async function votePoll(pollId: string, optionIndex: number) {
    await supabase.from("poll_votes").upsert(
      { poll_id: pollId, student_id: studentId, option_index: optionIndex },
      { onConflict: "poll_id,student_id" }
    );
    const { data } = await supabase
      .from("polls")
      .select("*, poll_votes(*)")
      .eq("id", pollId)
      .single();
    if (data) setPolls((prev) => prev.map((p) => (p.id === pollId ? data : p)));
  }

  async function submitWord(wordCloudId: string, word: string) {
    if (!word.trim()) return;
    await supabase.from("word_submissions").insert({
      word_cloud_id: wordCloudId,
      student_id: studentId,
      word: word.toLowerCase().trim(),
    });
    const { data } = await supabase
      .from("word_clouds")
      .select("*, word_submissions(*)")
      .eq("id", wordCloudId)
      .single();
    if (data) setWordClouds((prev) => prev.map((w) => (w.id === wordCloudId ? data : w)));
  }

  async function submitQuiz(quizId: string) {
    const answers = quizAnswers[quizId] || [];
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("questions")
      .eq("id", quizId)
      .single();

    let score: number | null = null;
    if (quiz?.questions) {
      const questions = quiz.questions as any[];
      let correct = 0;
      questions.forEach((q: any, i: number) => {
        if (q.correctAnswer !== undefined && answers[i] !== undefined) {
          if (JSON.stringify(answers[i]) === JSON.stringify(q.correctAnswer)) correct++;
        }
      });
      score = Math.round((correct / questions.length) * 100);
    }

    await supabase.from("quiz_responses").upsert(
      { quiz_id: quizId, student_id: studentId, answers, score },
      { onConflict: "quiz_id,student_id" }
    );
    setQuizSubmitted((prev) => ({ ...prev, [quizId]: true }));
  }

  async function submitExitTicketForm() {
    if (!activeExitTicket || !exitTicketResponse.trim()) return;
    await supabase.from("exit_ticket_responses").upsert(
      {
        exit_ticket_id: activeExitTicket.id,
        student_id: studentId,
        response: exitTicketResponse,
        rating: exitTicketRating,
      },
      { onConflict: "exit_ticket_id,student_id" }
    );
    setActiveExitTicket(null);
    setExitTicketResponse("");
  }

  function getMyVote(poll: any): number | null {
    const myVote = (poll.poll_votes || []).find((v: any) => v.student_id === studentId);
    return myVote ? myVote.option_index : null;
  }

  function getPollResults(poll: any): number[] {
    const opts = (poll.options || []).length;
    const counts = new Array(opts).fill(0);
    (poll.poll_votes || []).forEach((v: any) => {
      if (v.option_index >= 0 && v.option_index < opts) counts[v.option_index]++;
    });
    return counts;
  }

  if (step === "join") {
    return (
      <div style={{ background: BG }} className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: ACCENT }}>
              <Star className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Join Classroom</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Enter the room code and your name</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "rgba(255,255,255,0.5)" }}>Room Code</label>
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="w-full text-center text-2xl font-bold tracking-[0.3em] px-4 py-4 rounded-xl outline-none uppercase"
                style={{ background: BG2, color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "rgba(255,255,255,0.5)" }}>Your Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: BG2, color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button
              onClick={handleJoin}
              disabled={loading || !name.trim() || !roomCode.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-30"
              style={{ background: ACCENT }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "Joining..." : "Join Room"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Student Dashboard
  const activePolls = polls.filter((p) => p.is_active);
  const activeWC = wordClouds.filter((w) => w.is_active);

  return (
    <div style={{ background: BG }} className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: BG2 }}>
        <div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Joined as</p>
          <p className="text-sm text-white font-medium">{name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-mono font-bold tracking-wider text-white">{room.code}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
        {/* Active Poll */}
        {activePolls.map((poll) => {
          const myVote = getMyVote(poll);
          const results = getPollResults(poll);
          const total = results.reduce((a, b) => a + b, 0);
          return (
            <div key={poll.id} className="p-5 rounded-xl" style={{ background: BG2 }}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4" style={{ color: ACCENT }} />
                <h3 className="text-sm font-medium text-white">{poll.question}</h3>
              </div>
              <div className="space-y-2">
                {(poll.options || []).map((opt: string, i: number) => {
                  const pct = total > 0 ? Math.round((results[i] / total) * 100) : 0;
                  const isSelected = myVote === i;
                  return (
                    <button
                      key={i}
                      onClick={() => votePoll(poll.id, i)}
                      className="w-full text-left p-3 rounded-lg transition-all relative overflow-hidden"
                      style={{
                        background: isSelected ? `${ACCENT}25` : BG,
                        border: `1px solid ${isSelected ? ACCENT : "rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      <div
                        className="absolute inset-0 transition-all duration-500 rounded-lg"
                        style={{
                          width: myVote !== null ? `${pct}%` : "0%",
                          background: `${ACCENT}15`,
                        }}
                      />
                      <div className="relative flex items-center justify-between z-10">
                        <span className="text-sm" style={{ color: isSelected ? ACCENT : "rgba(255,255,255,0.7)" }}>
                          {opt}
                          {isSelected && <Check className="w-3 h-3 inline ml-1" />}
                        </span>
                        {myVote !== null && (
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {results[i]} ({pct}%)
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {myVote !== null && (
                <p className="text-xs mt-2 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {total} vote{total !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          );
        })}

        {/* Word Cloud */}
        {activeWC.map((wc) => {
          const [word, setWord] = useState("");
          const mySubmission = (wc.word_submissions || []).find((s: any) => s.student_id === studentId);
          const frequencies: Record<string, number> = {};
          (wc.word_submissions || []).forEach((s: any) => {
            frequencies[s.word] = (frequencies[s.word] || 0) + 1;
          });
          const sorted = Object.entries(frequencies)
            .map(([w, c]) => ({ word: w, count: c }))
            .sort((a, b) => b.count - a.count);
          const maxCount = sorted.length > 0 ? sorted[0].count : 1;

          return (
            <div key={wc.id} className="p-5 rounded-xl" style={{ background: BG2 }}>
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="w-4 h-4" style={{ color: ACCENT }} />
                <h3 className="text-sm font-medium text-white">{wc.question}</h3>
              </div>
              {!mySubmission ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); submitWord(wc.id, word); setWord(""); }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Type a word..."
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: BG, color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <button type="submit" className="p-2.5 rounded-lg transition-colors" style={{ background: ACCENT }}>
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </form>
              ) : (
                <p className="text-xs" style={{ color: ACCENT }}>You submitted: {mySubmission.word}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3 p-3 rounded-lg min-h-[60px]" style={{ background: BG }}>
                {sorted.map(({ word: w, count }) => {
                  const size = 11 + (count / maxCount) * 24;
                  return (
                    <span
                      key={w}
                      style={{
                        fontSize: `${size}px`,
                        color: `rgba(255,255,255,${0.4 + (count / maxCount) * 0.6})`,
                        fontWeight: count > maxCount / 2 ? 600 : 400,
                      }}
                    >
                      {w}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Quizzes */}
        {quizzes.map((quiz) => {
          const myResponse = (quiz.quiz_responses || []).find((r: any) => r.student_id === studentId);
          const questions = quiz.questions || [];
          const ans = quizAnswers[quiz.id] || [];
          const submitted = quizSubmitted[quiz.id] || !!myResponse;

          return (
            <div key={quiz.id} className="p-5 rounded-xl" style={{ background: BG2 }}>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4" style={{ color: ACCENT }} />
                <h3 className="text-sm font-medium text-white">{quiz.title}</h3>
                {submitted && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Done</span>}
              </div>
              {!submitted ? (
                <div className="space-y-4">
                  {questions.map((q: any, qi: number) => (
                    <div key={qi}>
                      <p className="text-sm text-white mb-2">{q.question}</p>
                      <div className="space-y-1">
                        {(q.options || []).map((opt: string, oi: number) => (
                          <button
                            key={oi}
                            onClick={() => {
                              const updated = [...(quizAnswers[quiz.id] || [])];
                              updated[qi] = oi;
                              setQuizAnswers((prev) => ({ ...prev, [quiz.id]: updated }));
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                            style={{
                              background: ans[qi] === oi ? `${ACCENT}25` : BG,
                              border: `1px solid ${ans[qi] === oi ? ACCENT : "rgba(255,255,255,0.08)"}`,
                              color: ans[qi] === oi ? ACCENT : "rgba(255,255,255,0.7)",
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => submitQuiz(quiz.id)}
                    className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                    style={{ background: ACCENT }}
                  >
                    Submit Quiz
                  </button>
                </div>
              ) : (
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Score: <span style={{ color: ACCENT }}>{myResponse?.score !== null ? `${myResponse?.score}%` : "Pending"}</span>
                </p>
              )}
            </div>
          );
        })}

        {/* Exit Ticket */}
        {activeExitTicket && (
          <div className="p-5 rounded-xl" style={{ background: BG2 }}>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-4 h-4" style={{ color: ACCENT }} />
              <h3 className="text-sm font-medium text-white">{activeExitTicket.question}</h3>
            </div>
            <textarea
              value={exitTicketResponse}
              onChange={(e) => setExitTicketResponse(e.target.value)}
              placeholder="Write your response..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none mb-3"
              style={{ background: BG, color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Rating:</span>
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => setExitTicketRating(r)}
                  className="transition-all"
                >
                  <Star
                    className="w-5 h-5"
                    style={{ color: r <= exitTicketRating ? ACCENT : "rgba(255,255,255,0.2)" }}
                    fill={r <= exitTicketRating ? ACCENT : "transparent"}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={submitExitTicketForm}
              disabled={!exitTicketResponse.trim()}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-30"
              style={{ background: ACCENT }}
            >
              Submit Exit Ticket
            </button>
          </div>
        )}

        {/* Chat */}
        <div className="p-5 rounded-xl" style={{ background: BG2 }}>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4" style={{ color: ACCENT }} />
            <h3 className="text-sm font-medium text-white">Chat</h3>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1.5 mb-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-sm p-2 rounded-lg" style={{
                background: msg.is_announcement ? `${ACCENT}20` : BG,
              }}>
                {msg.is_announcement && (
                  <span className="text-[10px] font-medium mr-1" style={{ color: ACCENT }}>📢</span>
                )}
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{msg.content}</span>
              </div>
            ))}
            {chatMessages.length === 0 && (
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No messages yet</p>
            )}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); sendChat(); }}
            className="flex items-center gap-2"
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-lg text-sm outline-none"
              style={{ background: BG, color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <button type="submit" className="p-2 rounded-lg transition-colors" style={{ background: ACCENT }}>
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>

        {/* Hand Raise + Reactions */}
        <div className="flex gap-3">
          <button
            onClick={toggleHandRaise}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: handRaised ? ACCENT : BG2,
              color: "white",
              border: `1px solid ${handRaised ? ACCENT : "rgba(255,255,255,0.08)"}`,
            }}
          >
            <Hand className={`w-5 h-5 ${handRaised ? "animate-pulse" : ""}`} />
            {handRaised ? "Lower Hand" : "Raise Hand"}
          </button>
        </div>

        <div className="p-4 rounded-xl" style={{ background: BG2 }}>
          <p className="text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Reactions</p>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="text-xl p-2 rounded-lg transition-all hover:scale-110"
                style={{ background: BG }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
