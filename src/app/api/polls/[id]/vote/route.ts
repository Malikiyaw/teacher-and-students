import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { option_index } = body;

  const { error } = await supabase
    .from("poll_votes")
    .upsert({
      poll_id: id,
      student_id: user.id,
      option_index,
    }, { onConflict: "poll_id,student_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: poll } = await supabase
    .from("polls")
    .select("options")
    .eq("id", id)
    .single();

  const { data: votes } = await supabase
    .from("poll_votes")
    .select("option_index")
    .eq("poll_id", id);

  const results = (poll?.options as string[]).map((_, i) => ({
    option_index: i,
    votes: votes?.filter((v) => v.option_index === i).length || 0,
  }));

  return NextResponse.json({ success: true, results });
}
