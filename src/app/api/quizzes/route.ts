import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { room_id, title, questions } = body;

  const { data: room } = await supabase
    .from("rooms")
    .select("id")
    .eq("id", room_id)
    .eq("teacher_id", user.id)
    .single();

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      room_id,
      title,
      questions: questions || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ quiz: data });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("room_id");

  if (!roomId) {
    return NextResponse.json({ error: "room_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ quizzes: data });
}
