import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { room_id, question } = body;
  if (!room_id) {
    return NextResponse.json({ error: "room_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("exit_tickets")
    .insert({ room_id, question: question || "What did you learn today?", is_active: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ exit_ticket: data });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("room_id");
  const etId = searchParams.get("id");

  const supabase = await createClient();

  if (etId) {
    const { data, error } = await supabase
      .from("exit_tickets")
      .select("*, exit_ticket_responses(*)")
      .eq("id", etId)
      .single();

    if (error) return NextResponse.json({ error: "Exit ticket not found" }, { status: 404 });
    return NextResponse.json({ exit_ticket: data });
  }

  if (roomId) {
    const { data, error } = await supabase
      .from("exit_tickets")
      .select("*, exit_ticket_responses(*)")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ exit_tickets: data });
  }

  return NextResponse.json({ error: "Provide room_id or id" }, { status: 400 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, is_active } = body;
  if (!id) return NextResponse.json({ error: "Exit ticket id is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("exit_tickets")
    .update({ is_active: is_active ?? false })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ exit_ticket: data });
}
