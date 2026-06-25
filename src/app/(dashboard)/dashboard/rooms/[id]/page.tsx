"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, BookOpen, MessageSquare, BarChart3, CheckCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface StudentStats {
  student_id: string;
  name: string;
  quizzes_taken: number;
  avg_score: number;
  attendance_count: number;
}

interface RoomStats {
  total_students: number;
  attendance_rate: number;
  avg_quiz_score: number;
  total_polls: number;
  total_chat_messages: number;
  students: StudentStats[];
}

export default function RoomStatsPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: room } = await supabase.from("rooms").select("name").eq("id", roomId).single();
      if (room) setRoomName(room.name);

      const { data: participants } = await supabase
        .from("room_participants")
        .select("student_id, profiles!room_participants_student_id_fkey(full_name)")
        .eq("room_id", roomId);

      const studentIds = (participants ?? []).map((p: { student_id: string }) => p.student_id);
      const studentMap: Record<string, { name: string; quizzes_taken: number; correct_total: number; quiz_count: number; attendance_count: number }> = {};

      for (const p of participants ?? []) {
        const profile = p.profiles as { full_name: string } | null;
        studentMap[p.student_id] = {
          name: profile?.full_name ?? "Unknown",
          quizzes_taken: 0,
          correct_total: 0,
          quiz_count: 0,
          attendance_count: 0,
        };
      }

      const { data: attendance } = await supabase
        .from("attendance")
        .select("student_id")
        .eq("room_id", roomId);

      for (const a of attendance ?? []) {
        if (studentMap[a.student_id]) {
          studentMap[a.student_id].attendance_count++;
        }
      }

      const { data: quizzes } = await supabase
        .from("quizzes")
        .select("id, questions")
        .eq("room_id", roomId);

      const totalPolls = quizzes?.length ?? 0;

      for (const quiz of quizzes ?? []) {
        const { data: responses } = await supabase
          .from("quiz_responses")
          .select("student_id, answers")
          .eq("quiz_id", quiz.id);

        const questions = quiz.questions as Array<{ correctIndex: number }>;

        for (const r of responses ?? []) {
          if (!studentMap[r.student_id]) continue;
          studentMap[r.student_id].quizzes_taken++;
          const answers = r.answers as number[];
          let correct = 0;
          for (let i = 0; i < questions.length; i++) {
            if (answers[i] === questions[i].correctIndex) correct++;
          }
          studentMap[r.student_id].correct_total += questions.length > 0 ? (correct / questions.length) * 100 : 0;
          studentMap[r.student_id].quiz_count++;
        }
      }

      const { count: chatCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("room_id", roomId);

      const students: StudentStats[] = Object.entries(studentMap).map(([sid, s]) => ({
        student_id: sid,
        name: s.name,
        quizzes_taken: s.quizzes_taken,
        avg_score: s.quiz_count > 0 ? Math.round(s.correct_total / s.quiz_count) : 0,
        attendance_count: s.attendance_count,
      }));

      const totalStudents = students.length;
      const totalAttendance = students.reduce((sum, s) => sum + s.attendance_count, 0);
      const attendanceRate = totalStudents > 0 ? Math.round((totalAttendance / (totalStudents * Math.max(totalPolls, 1))) * 100) : 0;
      const scoredStudents = students.filter((s) => s.quizzes_taken > 0);
      const avgQuizScore = scoredStudents.length > 0
        ? Math.round(scoredStudents.reduce((sum, s) => sum + s.avg_score, 0) / scoredStudents.length)
        : 0;

      setStats({
        total_students: totalStudents,
        attendance_rate: Math.min(attendanceRate, 100),
        avg_quiz_score: avgQuizScore,
        total_polls: totalPolls,
        total_chat_messages: chatCount ?? 0,
        students,
      });
      setLoading(false);
    };
    fetchStats();
  }, [supabase, router, roomId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-charcoal/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/rooms" className="p-2 text-charcoal/40 hover:text-charcoal/60 hover:bg-charcoal/5 rounded-lg transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Room Statistics</h1>
          <p className="text-sm text-charcoal/45">{roomName}</p>
        </div>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {[
              { label: "Total Students", value: stats.total_students, icon: Users },
              { label: "Attendance Rate", value: `${stats.attendance_rate}%`, icon: CheckCircle },
              { label: "Avg Quiz Score", value: `${stats.avg_quiz_score}%`, icon: BarChart3 },
              { label: "Quizzes Created", value: stats.total_polls, icon: BookOpen },
              { label: "Chat Messages", value: stats.total_chat_messages, icon: MessageSquare },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white border border-border rounded-xl p-5">
                <Icon className="w-5 h-5 text-charcoal/20 mb-3" />
                <p className="font-heading text-2xl text-charcoal">{value}</p>
                <p className="text-xs text-charcoal/40 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-heading text-lg text-charcoal">Student Breakdown</h2>
            </div>
            {stats.students.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-charcoal/40">No students have joined this room yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-cream/30">
                    <th className="text-left px-6 py-3 font-medium text-charcoal/50">Student</th>
                    <th className="text-center px-4 py-3 font-medium text-charcoal/50">Quizzes Taken</th>
                    <th className="text-center px-4 py-3 font-medium text-charcoal/50">Avg Score</th>
                    <th className="text-center px-4 py-3 font-medium text-charcoal/50">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.students.map((s) => (
                    <tr key={s.student_id} className="border-b border-border last:border-0 hover:bg-cream/30 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-charcoal">{s.name}</td>
                      <td className="text-center px-4 py-3.5 text-charcoal/60">{s.quizzes_taken}</td>
                      <td className="text-center px-4 py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          s.avg_score >= 80 ? "bg-[#16A34A]/10 text-[#16A34A]"
                            : s.avg_score >= 50 ? "bg-amber-100 text-amber-700"
                            : "bg-red-50 text-red-600"
                        }`}>
                          {s.avg_score}%
                        </span>
                      </td>
                      <td className="text-center px-4 py-3.5 text-charcoal/60">{s.attendance_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
