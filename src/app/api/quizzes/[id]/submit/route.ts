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
  const { answers } = body;

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("questions")
    .eq("id", id)
    .single();

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const questions = quiz.questions as Array<{
    question: string;
    options: string[];
    correctIndex: number;
  }>;

  let score = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) score++;
  });

  const percentage = Math.round((score / questions.length) * 100);

  const { data, error } = await supabase
    .from("quiz_responses")
    .upsert({
      quiz_id: id,
      student_id: user.id,
      answers,
      score: percentage,
    }, { onConflict: "quiz_id,student_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: allResponses } = await supabase
    .from("quiz_responses")
    .select("student_id, score, profiles(full_name)")
    .eq("quiz_id", id)
    .order("score", { ascending: false });

  return NextResponse.json({
    response: data,
    score: percentage,
    leaderboard: allResponses,
  });
}
