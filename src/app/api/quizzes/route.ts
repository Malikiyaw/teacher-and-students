import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { room_id, title, questions } = body;
  if (!room_id || !title || !questions) {
    return NextResponse.json({ error: "room_id, title, and questions are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("quizzes")
    .insert({ room_id, title, questions })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ quiz: data });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("room_id");
  const quizId = searchParams.get("id");

  const supabase = await createClient();

  if (quizId) {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*, quiz_responses(*)")
      .eq("id", quizId)
      .single();

    if (error) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    return NextResponse.json({ quiz: data });
  }

  if (roomId) {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*, quiz_responses(*)")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ quizzes: data });
  }

  return NextResponse.json({ error: "Provide room_id or id" }, { status: 400 });
}
