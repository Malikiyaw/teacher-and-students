"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Check, Presentation, Copy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewRoomPage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [maxStudents, setMaxStudents] = useState(30);
  const [selectedPresentation, setSelectedPresentation] = useState<string | null>(null);
  const [presentations, setPresentations] = useState<Array<{ id: string; title: string; slides: unknown[] }>>([]);
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [roomId, setRoomId] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("presentations")
        .select("id, title, slides")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (data) setPresentations(data);
    };
    fetchData();
  }, [supabase, router]);

  const createRoom = async () => {
    if (!roomName || !selectedPresentation) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const code = Math.random().toString(36).substring(2, 6).toUpperCase();

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        teacher_id: user.id,
        name: roomName,
        code,
        presentation_id: selectedPresentation,
        max_students: maxStudents,
        status: "active",
      })
      .select()
      .single();

    if (data) {
      setRoomCode(data.code);
      setRoomId(data.id);
      setRoomCreated(true);
    }
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (roomCreated) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 bg-sienna/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8 text-sienna" />
        </div>
        <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-2">Room is Live</h1>
        <p className="text-sm text-charcoal/45 mb-8">Share this code with your students to join.</p>

        <div className="bg-white border-2 border-sienna rounded-2xl p-8 mb-8">
          <span className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-3 block">Room Code</span>
          <div className="font-heading text-5xl text-charcoal tracking-[0.3em] mb-4">{roomCode}</div>
          <button onClick={copyCode} className="flex items-center gap-2 text-sm text-sienna hover:text-sienna-dark transition-colors mx-auto">
            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy code</>}
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2 text-sm text-charcoal/40">
            <span className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse" /> Waiting for students...
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link href={`/present/${roomId}`} className="bg-sienna text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-sienna-dark transition-all duration-300">
            Start Presenting
          </Link>
          <Link href="/dashboard/rooms" className="text-sm text-charcoal/40 hover:text-charcoal/60 transition-colors">
            Back to rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/rooms" className="p-2 text-charcoal/40 hover:text-charcoal/60 hover:bg-charcoal/5 rounded-lg transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-heading text-3xl text-charcoal tracking-tight">Create Room</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-border rounded-xl p-6">
          <label className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-2 block">Room Name</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="e.g. Biology 101 — Period 3"
            className="w-full bg-cream/50 border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/25 focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20 outline-none transition-all"
          />
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <label className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-3 block">Select Presentation</label>
          {presentations.length === 0 ? (
            <p className="text-sm text-charcoal/40">No presentations found. <Link href="/editor/new" className="text-sienna hover:text-sienna-dark">Create one</Link></p>
          ) : (
            <div className="space-y-2">
              {presentations.map((pres) => (
                <button
                  key={pres.id}
                  onClick={() => setSelectedPresentation(pres.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all ${
                    selectedPresentation === pres.id ? "border-sienna bg-sienna/5" : "border-border hover:border-charcoal/20"
                  }`}
                >
                  <Presentation className="w-5 h-5 text-charcoal/30 shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-charcoal">{pres.title}</div>
                    <div className="text-xs text-charcoal/40">{(pres.slides as unknown[]).length} slides</div>
                  </div>
                  {selectedPresentation === pres.id && <Check className="w-4 h-4 text-sienna" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-medium text-charcoal/40 uppercase tracking-wider">Max Students</label>
            <span className="text-sm font-medium text-charcoal">{maxStudents}</span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={maxStudents}
            onChange={(e) => setMaxStudents(Number(e.target.value))}
            className="w-full accent-sienna"
          />
        </div>

        <button
          onClick={createRoom}
          disabled={!roomName || !selectedPresentation || loading}
          className="w-full bg-sienna text-white text-sm font-medium py-3.5 rounded-xl hover:bg-sienna-dark transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Room"}
        </button>
      </div>
    </div>
  );
}
