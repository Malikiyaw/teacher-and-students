"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Presentation, Users, BarChart3, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function StudentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinedRoom, setJoinedRoom] = useState<{ name: string; code: string } | null>(null);
  const [myRooms, setMyRooms] = useState<Array<{ id: string; name: string; code: string; created_at: string }>>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      if (p) setProfile(p);

      const { data: participations } = await supabase
        .from("room_participants")
        .select("room_id, rooms(id, name, code, created_at)")
        .eq("student_id", user.id);

      if (participations) {
        const rooms = participations.map((p) => (p as unknown as { rooms: { id: string; name: string; code: string; created_at: string } }).rooms).filter(Boolean);
        setMyRooms(rooms);
      }
    };
    fetchData();
  }, [supabase, router]);

  const joinRoom = async () => {
    if (joinCode.length !== 4) return;
    setJoinError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: room, error } = await supabase
      .from("rooms")
      .select("id, name, code")
      .eq("code", joinCode.toUpperCase())
      .eq("status", "active")
      .single();

    if (error || !room) {
      setJoinError("Room not found or ended");
      return;
    }

    await supabase.from("room_participants").upsert({
      room_id: room.id,
      student_id: user.id,
    }, { onConflict: "room_id,student_id" });

    setJoinedRoom(room);
    setJoinCode("");
  };

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-charcoal/45">
          You&apos;re enrolled in {myRooms.length} class{myRooms.length !== 1 ? "es" : ""}.
        </p>
      </div>

      {/* Join Room */}
      <div className="mb-12">
        <h2 className="font-heading text-xl text-charcoal mb-5">Join a Class</h2>
        <div className="flex gap-3 max-w-md">
          <input
            type="text"
            placeholder="Enter room code (e.g. ABCD)"
            value={joinCode}
            onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }}
            className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20 transition-all duration-300 tracking-widest font-medium text-center text-lg"
            maxLength={4}
          />
          <button
            onClick={joinRoom}
            className="bg-sienna text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-sienna-dark transition-all duration-300 flex items-center gap-2"
          >
            <Users className="w-4 h-4" /> Join
          </button>
        </div>
        {joinError && <p className="text-xs text-red-500 mt-2">{joinError}</p>}
        {joinedRoom && (
          <div className="mt-4 bg-[#16A34A]/5 border border-[#16A34A]/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#16A34A]">Joined {joinedRoom.name}</p>
              <p className="text-xs text-charcoal/40">Code: {joinedRoom.code}</p>
            </div>
            <a href={`/present/view/${joinedRoom.code}`} className="text-xs font-medium text-sienna hover:text-sienna-dark">View Presentation →</a>
          </div>
        )}
      </div>

      {/* Enrolled Classes */}
      <div>
        <h2 className="font-heading text-xl text-charcoal mb-5">My Classes</h2>
        {myRooms.length === 0 ? (
          <div className="bg-white border border-border rounded-xl p-10 text-center">
            <Users className="w-10 h-10 text-charcoal/10 mx-auto mb-3" />
            <p className="text-sm text-charcoal/40">No classes yet. Join one with a room code above.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myRooms.map((room) => (
              <div key={room.id} className="bg-white border border-border rounded-xl p-5 hover:border-charcoal/15 transition-all duration-300">
                <h3 className="text-sm font-medium text-charcoal mb-1">{room.name}</h3>
                <div className="flex items-center gap-2 text-xs text-charcoal/40">
                  <Clock className="w-3 h-3" />
                  Code: {room.code}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
