import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { room_id, is_raised } = body;

  const { data, error } = await supabase
    .from("hand_raises")
    .upsert({ room_id, student_id: user.id, is_raised: is_raised !== false }, { onConflict: "room_id,student_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const room_id = req.nextUrl.searchParams.get("room_id");
  if (!room_id) return NextResponse.json({ error: "room_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("hand_raises")
    .select("student_id, is_raised")
    .eq("room_id", room_id)
    .eq("is_raised", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
