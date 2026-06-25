"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Presentation, Users, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SlideElement { type: string; content: string; color: string; fontSize?: number; y?: string; }
interface Slide { id: string; background: string; elements: SlideElement[]; }

export default function StudentViewPage({ params }: { params: Promise<{ id: string }> }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [students, setStudents] = useState(0);
  const [pollActive, setPollActive] = useState(false);
  const [activePoll, setActivePoll] = useState<{ id: string; question: string; options: string[] } | null>(null);
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const init = async (codeOrId: string) => {
      // Try finding room by code first
      let roomData: any = null;
      const { data: r } = await supabase
        .from("rooms").select("*, presentations(*)").eq("code", codeOrId.toUpperCase()).eq("status", "active").single();

      if (r) {
        roomData = r;
      } else {
        // Try by ID
        const { data: r2 } = await supabase
          .from("rooms").select("*, presentations(*)").eq("id", codeOrId).single();
        if (r2) roomData = r2;
      }

      if (roomData) {
        setRoomName(roomData.name);
        setRoomCode(roomData.code);
        const pres = roomData.presentations as { slides: Slide[] } | null;
        if (pres?.slides) setSlides(pres.slides as Slide[]);

        const { count } = await supabase
          .from("room_participants").select("*", { count: "exact", head: true })
          .eq("room_id", roomData.id);
        setStudents(count || 0);

        // Subscribe to polls
        const channel = supabase
          .channel(`student-${roomData.id}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "polls", filter: `room_id=eq.${roomData.id}` },
            (payload) => {
              const poll = payload.new as { id: string; question: string; options: string[] };
              setActivePoll({ id: poll.id, question: poll.question, options: poll.options as string[] });
              setPollActive(true);
              setVoted(false);
              setSelectedOption(null);
            }
          )
          .on("postgres_changes", { event: "DELETE", schema: "public", table: "polls", filter: `room_id=eq.${roomData.id}` },
            () => { setPollActive(false); setActivePoll(null); }
          )
          .subscribe();

        return () => { supabase.removeChannel(channel); };
      }
      setLoading(false);
    };

    params.then((p) => init(p.id));
  }, [params, supabase]);

  const handleVote = async (optionIndex: number) => {
    if (!activePoll || voted) return;
    setSelectedOption(optionIndex);
    setVoted(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("poll_votes").upsert({
      poll_id: activePoll.id,
      student_id: user.id,
      option_index: optionIndex,
    }, { onConflict: "poll_id,student_id" });
  };

  if (loading) {
    return <div className="min-h-screen bg-charcoal flex items-center justify-center"><Loader2 className="w-6 h-6 text-white/40 animate-spin" /></div>;
  }

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      <div className="h-12 bg-[#2A2523] border-b border-white/5 flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-sienna rounded-md flex items-center justify-center"><Presentation className="w-3.5 h-3.5 text-white" /></div>
          <span className="text-xs text-white/50 font-medium">{roomName || "ClassDeck"}</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/40"><Users className="w-3.5 h-3.5" />{students} online</div>
          <span className="text-xs text-white/30 font-mono">{roomCode}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {slide ? (
          <div className="w-full max-w-4xl aspect-video rounded-lg shadow-2xl shadow-black/30 flex items-center justify-center relative overflow-hidden" style={{ background: slide.background }}>
            {slide.elements.map((el, i) => (
              <div key={i} className="absolute left-0 right-0 text-center px-8"
                style={{ top: el.y || `${20 + i * 15}%`, color: el.color, fontSize: `${el.fontSize || 18}px`, fontFamily: "var(--font-heading)" }}>
                {el.content}
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

      <div className="h-14 bg-[#2A2523] border-t border-white/5 flex items-center justify-between px-6 shrink-0">
        <span className="text-xs text-white/30">Slide {currentSlide + 1} of {slides.length || 1}</span>
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? "w-6 bg-sienna" : "w-1.5 bg-white/20 hover:bg-white/40"}`} />
          ))}
        </div>
        <span className="text-xs text-white/30">{roomCode}</span>
      </div>

      {pollActive && activePoll && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-96 bg-white rounded-2xl shadow-2xl p-6 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-charcoal">Live Poll</h3>
            <span className="text-[11px] text-sienna font-medium bg-sienna/10 px-2 py-0.5 rounded-full animate-pulse">Active</span>
          </div>
          <p className="text-sm text-charcoal/70 mb-4">{activePoll.question}</p>
          <div className="space-y-2 mb-4">
            {activePoll.options.map((opt, i) => (
              <button key={i} onClick={() => handleVote(i)} disabled={voted}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                  voted ? selectedOption === i ? "border-sienna bg-sienna/5 text-sienna" : "border-border bg-cream/50 text-charcoal/40" : "border-border hover:border-charcoal/20 text-charcoal"
                }`}>
                {opt} {voted && selectedOption === i && <Check className="w-4 h-4 inline ml-2" />}
              </button>
            ))}
          </div>
          {voted && <p className="text-xs text-[#16A34A] text-center">Vote submitted!</p>}
        </div>
      )}
    </div>
  );
}
