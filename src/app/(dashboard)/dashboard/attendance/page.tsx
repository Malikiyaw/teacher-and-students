"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Calendar, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { downloadCSV } from "@/lib/export";

interface RoomAttendance {
  room_id: string;
  room_name: string;
  created_at: string;
  count: number;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<RoomAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: rooms } = await supabase.from("rooms").select("id, name, created_at").eq("teacher_id", user.id).order("created_at", { ascending: false });
      if (!rooms) { setLoading(false); return; }

      const results: RoomAttendance[] = [];
      for (const room of rooms) {
        const { count } = await supabase.from("attendance").select("*", { count: "exact", head: true }).eq("room_id", room.id);
        results.push({ room_id: room.id, room_name: room.name, created_at: room.created_at, count: count || 0 });
      }
      setAttendance(results);
      setLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  return (
    <div className="max-w-4xl">
      <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm text-charcoal/40 hover:text-charcoal/60 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to tools
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Attendance</h1>
          <p className="text-sm text-charcoal/45">Track student attendance across all sessions.</p>
        </div>
        {attendance.length > 0 && (
          <button onClick={() => downloadCSV(attendance.map((a) => ({
            Room: a.room_name, Date: new Date(a.created_at).toLocaleDateString(), "Student Count": a.count,
          })), "attendance.csv")}
            className="flex items-center gap-2 bg-charcoal text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-charcoal-light transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Calendar className="w-8 h-8 text-charcoal/20 animate-pulse" /></div>
      ) : attendance.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <Calendar className="w-10 h-10 text-charcoal/15 mx-auto mb-3" />
          <p className="text-sm text-charcoal/40">No sessions yet</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl divide-y divide-border">
          {attendance.map((a) => (
            <div key={a.room_id} className="flex items-center gap-4 px-6 py-4">
              <div className="w-10 h-10 bg-[#CA8A04]/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-[#CA8A04]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-charcoal">{a.room_name}</h3>
                <p className="text-xs text-charcoal/40">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-lg font-heading text-charcoal">{a.count}</span>
              <span className="text-xs text-charcoal/40">students</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
