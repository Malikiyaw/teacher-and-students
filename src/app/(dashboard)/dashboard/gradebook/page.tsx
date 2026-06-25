"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, BarChart3, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { downloadCSV } from "@/lib/export";

interface StudentScore {
  student_id: string;
  student_name: string;
  room_name: string;
  room_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  percentage: number;
  created_at: string;
}

export default function GradebookPage() {
  const router = useRouter();
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: roomData } = await supabase
        .from("rooms").select("id, name").eq("teacher_id", user.id);
      if (roomData) setRooms(roomData);

      const roomIds = roomData?.map((r: { id: string }) => r.id) || [];
      if (roomIds.length === 0) { setLoading(false); return; }

      const { data: quizzes } = await supabase
        .from("quizzes").select("id, room_id, title").in("room_id", roomIds);
      if (!quizzes || quizzes.length === 0) { setLoading(false); return; }

      const quizIds = quizzes.map((q: { id: string }) => q.id);
      const { data: responses } = await supabase
        .from("quiz_responses").select("quiz_id, student_id, score, created_at").in("quiz_id", quizIds);

      if (!responses || responses.length === 0) { setLoading(false); return; }

      const studentIds = [...new Set(responses.map((r: { student_id: string }) => r.student_id))];
      const { data: profiles } = await supabase
        .from("profiles").select("id, full_name").in("id", studentIds);

      const profileMap = new Map(profiles?.map((p: { id: string; full_name: string }) => [p.id, p.full_name]) || []);
      const quizMap = new Map<string, { id: string; room_id: string; title: string }>();
      quizzes.forEach((q: any) => quizMap.set(q.id, q));
      const roomMap = new Map<string, string>();
      roomData?.forEach((r: any) => roomMap.set(r.id, r.name));

      const allScores: StudentScore[] = responses.map((r: any) => {
        const quiz = quizMap.get(r.quiz_id);
        return {
          student_id: r.student_id,
          student_name: profileMap.get(r.student_id) || "Unknown",
          room_name: roomMap.get(quiz?.room_id || "") || "Unknown",
          room_id: quiz?.room_id || "",
          quiz_title: quiz?.title || "Quiz",
          score: r.score || 0,
          total_questions: 10,
          percentage: Math.round(((r.score || 0) / 10) * 100),
          created_at: r.created_at,
        };
      });

      setScores(allScores);
      setLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  const filtered = selectedRoom === "all" ? scores : scores.filter((s) => s.room_id === selectedRoom);

  const studentAverages = new Map<string, { name: string; scores: number[]; room: string }>();
  filtered.forEach((s) => {
    const existing = studentAverages.get(s.student_id);
    if (existing) { existing.scores.push(s.percentage); }
    else { studentAverages.set(s.student_id, { name: s.student_name, scores: [s.percentage], room: s.room_name }); }
  });

  const avgList = Array.from(studentAverages.entries()).map(([id, data]) => ({
    id, name: data.name, room: data.room,
    avg: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
    quizzes: data.scores.length,
  })).sort((a, b) => b.avg - a.avg);

  const handleExport = () => {
    downloadCSV(filtered.map((s) => ({
      Student: s.student_name, Room: s.room_name, Quiz: s.quiz_title,
      Score: s.score, Percentage: `${s.percentage}%`, Date: new Date(s.created_at).toLocaleDateString(),
    })), `gradebook-${selectedRoom === "all" ? "all" : selectedRoom}.csv`);
  };

  return (
    <div className="max-w-6xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-charcoal/40 hover:text-charcoal/60 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Gradebook</h1>
          <p className="text-sm text-charcoal/45">Track student performance across quizzes.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}
            className="bg-white border border-border rounded-lg px-4 py-2 text-sm text-charcoal focus:border-sienna/40 outline-none">
            <option value="all">All Rooms</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button onClick={handleExport}
            className="flex items-center gap-2 bg-charcoal text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-charcoal-light transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-sm text-charcoal/40">Loading gradebook...</div>
      ) : avgList.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-10 text-center">
          <BarChart3 className="w-10 h-10 text-charcoal/10 mx-auto mb-3" />
          <p className="text-sm text-charcoal/40">No quiz scores yet. Launch a quiz in a room to start grading.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-sienna" />
                <span className="text-xs text-charcoal/40 font-medium">Students</span>
              </div>
              <div className="font-heading text-3xl text-charcoal">{avgList.length}</div>
            </div>
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-sienna" />
                <span className="text-xs text-charcoal/40 font-medium">Class Average</span>
              </div>
              <div className="font-heading text-3xl text-charcoal">
                {Math.round(avgList.reduce((a, b) => a + b.avg, 0) / avgList.length)}%
              </div>
            </div>
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-sienna" />
                <span className="text-xs text-charcoal/40 font-medium">Highest</span>
              </div>
              <div className="font-heading text-3xl text-charcoal">{avgList[0]?.avg || 0}%</div>
            </div>
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-sienna" />
                <span className="text-xs text-charcoal/40 font-medium">Total Quizzes</span>
              </div>
              <div className="font-heading text-3xl text-charcoal">{filtered.length}</div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-cream/30">
                  <th className="text-left px-6 py-3 text-xs font-medium text-charcoal/50">Rank</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-charcoal/50">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-charcoal/50">Room</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-charcoal/50">Quizzes Taken</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-charcoal/50">Average Score</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-charcoal/50">Grade</th>
                </tr>
              </thead>
              <tbody>
                {avgList.map((student, i) => (
                  <tr key={student.id} className="border-b border-border/50 hover:bg-cream/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-charcoal/40 font-heading">{i + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-charcoal">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-charcoal/60">{student.room}</td>
                    <td className="px-6 py-4 text-sm text-charcoal/60 text-center">{student.quizzes}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-24 h-2 bg-charcoal/10 rounded-full overflow-hidden">
                          <div className="h-full bg-sienna rounded-full transition-all" style={{ width: `${student.avg}%` }} />
                        </div>
                        <span className="text-sm font-medium text-charcoal">{student.avg}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        student.avg >= 90 ? "bg-[#16A34A]/10 text-[#16A34A]" :
                        student.avg >= 70 ? "bg-[#CA8A04]/10 text-[#CA8A04]" :
                        student.avg >= 50 ? "bg-[#EA580C]/10 text-[#EA580C]" :
                        "bg-red-500/10 text-red-500"
                      }`}>
                        {student.avg >= 90 ? "A" : student.avg >= 80 ? "B" : student.avg >= 70 ? "C" : student.avg >= 60 ? "D" : "F"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
