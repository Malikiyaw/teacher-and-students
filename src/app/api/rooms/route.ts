import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { presentation_id } = body;
  if (!presentation_id) {
    return NextResponse.json({ error: "presentation_id is required" }, { status: 400 });
  }

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      teacher_id: user.id,
      presentation_id,
      name: `Room ${code}`,
      code,
      max_students: 100,
      status: "active",
      settings: {},
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ room: data });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const roomId = searchParams.get("id");
  const presentationId = searchParams.get("presentation_id");

  const supabase = await createClient();

  if (code) {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    return NextResponse.json({ room: data });
  }

  if (roomId) {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (error) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    return NextResponse.json({ room: data });
  }

  if (presentationId) {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("presentation_id", presentationId)
      .eq("status", "active")
      .single();

    if (error) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    return NextResponse.json({ room: data });
  }

  return NextResponse.json({ error: "Provide code, id, or presentation_id" }, { status: 400 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status, settings } = body;
  if (!id) return NextResponse.json({ error: "Room id is required" }, { status: 400 });

  const updates: any = {};
  if (status) updates.status = status;
  if (settings) updates.settings = settings;

  const { data, error } = await supabase
    .from("rooms")
    .update(updates)
    .eq("id", id)
    .eq("teacher_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ room: data });
}
