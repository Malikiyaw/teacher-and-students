import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { code } = body;

  if (!code || code.length !== 4) {
    return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
  }

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("*, presentations(*)")
    .eq("code", code.toUpperCase())
    .eq("status", "active")
    .single();

  if (roomError || !room) {
    return NextResponse.json({ error: "Room not found or ended" }, { status: 404 });
  }

  const { count } = await supabase
    .from("room_participants")
    .select("*", { count: "exact", head: true })
    .eq("room_id", room.id);

  if (count && count >= room.max_students) {
    return NextResponse.json({ error: "Room is full" }, { status: 400 });
  }

  const { error: joinError } = await supabase
    .from("room_participants")
    .upsert({
      room_id: room.id,
      student_id: user.id,
    }, { onConflict: "room_id,student_id" });

  if (joinError) {
    return NextResponse.json({ error: joinError.message }, { status: 500 });
  }

  return NextResponse.json({ room });
}
