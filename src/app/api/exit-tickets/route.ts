import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { exit_ticket_id, response, rating } = body;

  const { data, error } = await supabase
    .from("exit_ticket_responses")
    .upsert({ exit_ticket_id, student_id: user.id, response, rating }, { onConflict: "exit_ticket_id,student_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
