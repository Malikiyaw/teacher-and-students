import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { presentation_id, slide_index, content } = body;

  const { data, error } = await supabase
    .from("student_notes")
    .upsert({ presentation_id, student_id: user.id, slide_index, content }, { onConflict: "presentation_id,student_id,slide_index" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const presentation_id = req.nextUrl.searchParams.get("presentation_id");
  const slide_index = req.nextUrl.searchParams.get("slide_index");
  if (!presentation_id || !slide_index) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const { data, error } = await supabase
    .from("student_notes")
    .select("content")
    .eq("presentation_id", presentation_id)
    .eq("student_id", user.id)
    .eq("slide_index", parseInt(slide_index))
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data || { content: "" });
}
