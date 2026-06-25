import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("points")
    .select("student_id, points, profiles!points_student_id_fkey(full_name)")
    .order("points", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const leaderboard: Record<string, { student_id: string; name: string; total_points: number }> = {};
  for (const row of data ?? []) {
    const id = row.student_id;
    if (!leaderboard[id]) {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      leaderboard[id] = { student_id: id, name: profile?.full_name ?? "Unknown", total_points: 0 };
    }
    leaderboard[id].total_points += row.points;
  }

  const ranked = Object.values(leaderboard)
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 50);

  return NextResponse.json({ leaderboard: ranked });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { student_id, room_id, points, reason } = body;

  if (!student_id || !room_id || points == null) {
    return NextResponse.json({ error: "student_id, room_id, and points are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("points")
    .insert({
      student_id,
      room_id,
      points,
      reason: reason ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ record: data });
}
