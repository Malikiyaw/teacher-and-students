"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Cloud, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function WordCloudPage() {
  const [question, setQuestion] = useState("");
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [launching, setLaunching] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("rooms").select("id, name").eq("teacher_id", user.id).eq("status", "active");
      if (data) setRooms(data);
    };
    fetchData();
  }, [supabase, router]);

  const launchCloud = async () => {
    if (!question.trim() || !roomId) return;
    setLaunching(true);
    const { data, error } = await supabase.from("word_clouds").insert({ room_id: roomId, question: question.trim() }).select().single();
    if (!error && data) { router.push("/dashboard/tools"); }
    setLaunching(false);
  };

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm text-charcoal/40 hover:text-charcoal/60 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to tools
      </Link>
      <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Word Cloud</h1>
      <p className="text-sm text-charcoal/45 mb-8">Students submit words and see them form a live word cloud.</p>

      <div className="bg-white border border-border rounded-xl p-6 space-y-5">
        <div>
          <label className="text-xs font-medium text-charcoal/60 mb-1.5 block">Question</label>
          <input value={question} onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What word describes today's lesson?"
            className="w-full bg-cream border border-border rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 outline-none focus:border-sienna/40" />
        </div>
        <div>
          <label className="text-xs font-medium text-charcoal/60 mb-1.5 block">Room</label>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)}
            className="w-full bg-cream border border-border rounded-xl px-4 py-3 text-sm text-charcoal outline-none">
            <option value="">Select an active room</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <button onClick={launchCloud} disabled={!question.trim() || !roomId || launching}
          className="w-full bg-sienna text-white text-sm font-medium py-3 rounded-xl hover:bg-sienna-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Cloud className="w-4 h-4" /> Launch Word Cloud</>}
        </button>
      </div>
    </div>
  );
}
