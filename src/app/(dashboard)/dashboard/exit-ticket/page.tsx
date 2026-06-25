"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, MessageSquareText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ExitTicketPage() {
  const [question, setQuestion] = useState("What did you learn today?");
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

  const launchTicket = async () => {
    if (!roomId) return;
    setLaunching(true);
    const { data, error } = await supabase.from("exit_tickets").insert({ room_id: roomId, question }).select().single();
    if (!error && data) { router.push("/dashboard/tools"); }
    setLaunching(false);
  };

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm text-charcoal/40 hover:text-charcoal/60 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to tools
      </Link>
      <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Exit Ticket</h1>
      <p className="text-sm text-charcoal/45 mb-8">Quick end-of-class feedback to gauge understanding.</p>

      <div className="bg-white border border-border rounded-xl p-6 space-y-5">
        <div>
          <label className="text-xs font-medium text-charcoal/60 mb-1.5 block">Question</label>
          <input value={question} onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-cream border border-border rounded-xl px-4 py-3 text-sm text-charcoal outline-none focus:border-sienna/40" />
        </div>
        <div>
          <label className="text-xs font-medium text-charcoal/60 mb-1.5 block">Room</label>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)}
            className="w-full bg-cream border border-border rounded-xl px-4 py-3 text-sm text-charcoal outline-none">
            <option value="">Select an active room</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <button onClick={launchTicket} disabled={!roomId || launching}
          className="w-full bg-[#16A34A] text-white text-sm font-medium py-3 rounded-xl hover:bg-[#15803D] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageSquareText className="w-4 h-4" /> Launch Exit Ticket</>}
        </button>
      </div>
    </div>
  );
}
