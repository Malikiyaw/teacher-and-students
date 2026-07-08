import { createClient } from "@/lib/supabase/client";

export function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getAnonId(): string | null {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem("anon_user_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("anon_user_id", id);
  }
  return id;
}

export async function createRoom(
  presentationId: string
): Promise<{ room: any; error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { room: null, error: "Not authenticated" };

  const code = generateRoomCode();
  const { data: existing } = await supabase
    .from("rooms")
    .select("id, code")
    .eq("presentation_id", presentationId)
    .eq("status", "active")
    .single();

  if (existing) {
    const { data: room } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", existing.id)
      .single();
    return { room, error: null };
  }

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      teacher_id: user.id,
      presentation_id: presentationId,
      name: `Room ${code}`,
      code,
      max_students: 100,
      status: "active",
      settings: {},
    })
    .select()
    .single();

  if (error) return { room: null, error: error.message };
  return { room: data, error: null };
}

export async function joinRoom(
  roomCode: string,
  studentName: string
): Promise<{
  room: any;
  studentId: string;
  error: string | null;
}> {
  const supabase = createClient();
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", roomCode.toUpperCase())
    .eq("status", "active")
    .single();

  if (roomError || !room)
    return { room: null, studentId: "", error: "Room not found or no longer active" };

  const { data: { user } } = await supabase.auth.getUser();
  let studentId = user?.id || getAnonId() || crypto.randomUUID();
  if (!user) {
    localStorage.setItem("anon_user_id", studentId);
    localStorage.setItem("anon_user_name", studentName);
  }

  const { error: joinError } = await supabase.from("room_participants").upsert(
    {
      room_id: room.id,
      student_id: studentId,
    },
    { onConflict: "room_id,student_id" }
  );

  if (joinError) return { room: null, studentId: "", error: joinError.message };

  await supabase.from("attendance").upsert(
    {
      room_id: room.id,
      student_id: studentId,
    },
    { onConflict: "room_id,student_id" }
  );

  return { room, studentId, error: null };
}

export async function submitPollVote(
  pollId: string,
  optionIndex: number,
  studentId?: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const sid = studentId || getAnonId();
  if (!sid) return { error: "Not identified" };

  const { error } = await supabase.from("poll_votes").upsert(
    { poll_id: pollId, student_id: sid, option_index: optionIndex },
    { onConflict: "poll_id,student_id" }
  );
  return { error: error?.message || null };
}

export async function submitWord(
  wordCloudId: string,
  word: string,
  studentId?: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const sid = studentId || getAnonId();
  if (!sid) return { error: "Not identified" };

  const { error } = await supabase.from("word_submissions").insert({
    word_cloud_id: wordCloudId,
    student_id: sid,
    word: word.toLowerCase().trim(),
  });
  return { error: error?.message || null };
}

export async function submitQuizResponse(
  quizId: string,
  answers: any[],
  studentId?: string
): Promise<{ error: string | null; score: number | null }> {
  const supabase = createClient();
  const sid = studentId || getAnonId();
  if (!sid) return { error: "Not identified", score: null };

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("questions")
    .eq("id", quizId)
    .single();

  let score: number | null = null;
  if (quiz?.questions) {
    const questions = quiz.questions as any[];
    let correct = 0;
    questions.forEach((q: any, i: number) => {
      if (q.correctAnswer !== undefined && answers[i] !== undefined) {
        if (JSON.stringify(answers[i]) === JSON.stringify(q.correctAnswer)) correct++;
      }
    });
    score = Math.round((correct / questions.length) * 100);
  }

  const { error } = await supabase.from("quiz_responses").upsert(
    { quiz_id: quizId, student_id: sid, answers, score },
    { onConflict: "quiz_id,student_id" }
  );
  return { error: error?.message || null, score };
}

export async function raiseHand(
  roomId: string,
  raised: boolean,
  studentId?: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const sid = studentId || getAnonId();
  if (!sid) return { error: "Not identified" };

  const { data: existing } = await supabase
    .from("hand_raises")
    .select("id")
    .eq("room_id", roomId)
    .eq("student_id", sid)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("hand_raises")
      .update({ is_raised: raised })
      .eq("id", existing.id);
    return { error: error?.message || null };
  }

  const { error } = await supabase.from("hand_raises").insert({
    room_id: roomId,
    student_id: sid,
    is_raised: raised,
  });
  return { error: error?.message || null };
}

export async function sendReaction(
  roomId: string,
  emoji: string,
  studentId?: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const sid = studentId || getAnonId();
  if (!sid) return { error: "Not identified" };

  const { error } = await supabase.from("reactions").insert({
    room_id: roomId,
    user_id: sid,
    emoji,
  });
  return { error: error?.message || null };
}

export async function sendChatMessage(
  roomId: string,
  content: string,
  studentId?: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const sid = studentId || getAnonId();
  if (!sid) return { error: "Not identified" };

  const { error } = await supabase.from("chat_messages").insert({
    room_id: roomId,
    user_id: sid,
    content,
    is_announcement: false,
  });
  return { error: error?.message || null };
}

export async function submitExitTicket(
  exitTicketId: string,
  response: string,
  rating: number,
  studentId?: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const sid = studentId || getAnonId();
  if (!sid) return { error: "Not identified" };

  const { error } = await supabase.from("exit_ticket_responses").insert({
    exit_ticket_id: exitTicketId,
    student_id: sid,
    response,
    rating,
  });
  return { error: error?.message || null };
}

export async function recordAttendance(
  roomId: string,
  studentId?: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const sid = studentId || getAnonId();
  if (!sid) return { error: "Not identified" };

  const { error } = await supabase.from("attendance").upsert(
    { room_id: roomId, student_id: sid },
    { onConflict: "room_id,student_id" }
  );
  return { error: error?.message || null };
}
