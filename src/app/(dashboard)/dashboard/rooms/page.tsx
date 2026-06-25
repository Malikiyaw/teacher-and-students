"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Clock, Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Room {
  id: string;
  name: string;
  code: string;
  status: string;
  max_students: number;
  created_at: string;
  presentations?: { title: string } | null;
  _count?: number;
}

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("rooms")
        .select("*, presentations(title)")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        const roomsWithCounts = await Promise.all(
          data.map(async (room) => {
            const { count } = await supabase
              .from("room_participants")
              .select("*", { count: "exact", head: true })
              .eq("room_id", room.id);
            return { ...room, _count: count || 0 };
          })
        );
        setRooms(roomsWithCounts);
      }
      setLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeRooms = rooms.filter((r) => r.status === "active");
  const pastRooms = rooms.filter((r) => r.status === "ended");

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return days === 1 ? "Yesterday" : `${days} days ago`;
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Rooms</h1>
          <p className="text-sm text-charcoal/45">Create a room and share the code with your students.</p>
        </div>
        <Link
          href="/dashboard/rooms/new"
          className="flex items-center gap-2 bg-sienna text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-sienna-dark transition-all duration-300"
        >
          <Plus className="w-4 h-4" /> New Room
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-sm text-charcoal/40">Loading...</div>
      ) : activeRooms.length === 0 && pastRooms.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-16 text-center">
          <Users className="w-12 h-12 text-charcoal/10 mx-auto mb-4" />
          <h3 className="font-heading text-xl text-charcoal mb-2">No rooms yet</h3>
          <p className="text-sm text-charcoal/40 mb-6">Create a room and share the code with your students.</p>
          <Link href="/dashboard/rooms/new" className="inline-flex items-center gap-2 bg-sienna text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-sienna-dark transition-all">
            <Plus className="w-4 h-4" /> Create Room
          </Link>
        </div>
      ) : (
        <>
          {activeRooms.length > 0 && (
            <div className="mb-12">
              <h2 className="font-heading text-xl text-charcoal mb-5">Active Rooms</h2>
              <div className="space-y-4">
                {activeRooms.map((room) => (
                  <div key={room.id} className="bg-white border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-medium text-charcoal">{room.name}</h3>
                        <span className="text-[11px] font-medium text-[#16A34A] bg-[#16A34A]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse" /> Live
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-charcoal/40">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {room._count}/{room.max_students} students
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {getTimeAgo(room.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => copyCode(room.code)}
                        className="flex items-center gap-2 bg-charcoal/5 border border-border rounded-lg px-3 py-2 text-sm font-mono font-medium text-charcoal hover:border-charcoal/20 transition-all duration-200"
                      >
                        {room.code}
                        {copied === room.code ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5 text-charcoal/30" />}
                      </button>
                      <Link
                        href={`/present/${room.id}`}
                        className="bg-sienna text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-sienna-dark transition-all duration-300"
                      >
                        Present
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastRooms.length > 0 && (
            <div>
              <h2 className="font-heading text-xl text-charcoal mb-5">Past Sessions</h2>
              <div className="bg-white border border-border rounded-xl divide-y divide-border">
                {pastRooms.map((room) => (
                  <div key={room.id} className="flex items-center gap-4 px-5 py-4 hover:bg-cream/50 transition-colors">
                    <div className="w-9 h-9 bg-charcoal/5 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-charcoal/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-charcoal truncate">{room.name}</div>
                      <div className="text-xs text-charcoal/40">{room._count} students attended</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-charcoal/30 font-mono">{room.code}</span>
                      <span className="text-xs text-charcoal/30">{getTimeAgo(room.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
