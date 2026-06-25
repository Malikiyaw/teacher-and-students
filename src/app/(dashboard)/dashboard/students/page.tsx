"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Search, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { downloadCSV } from "@/lib/export";

interface Student {
  id: string;
  full_name: string;
  email: string;
  rooms: string[];
  quiz_count: number;
  avg_score: number;
  last_active: string;
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: rooms } = await supabase
        .from("rooms").select("id, name").eq("teacher_id", user.id);
      if (!rooms || rooms.length === 0) { setLoading(false); return; }

      const roomIds = rooms.map((r: { id: string }) => r.id);

      const { data: participants } = await supabase
        .from("room_participants").select("student_id, room_id").in("room_id", roomIds);
      if (!participants || participants.length === 0) { setLoading(false); return; }

      const studentIds = [...new Set(participants.map((p: { student_id: string }) => p.student_id))];
      const { data: profiles } = await supabase
        .from("profiles").select("id, full_name, email").in("id", studentIds);

      const profileMap = new Map<string, any>();
      profiles?.forEach((p: any) => profileMap.set(p.id, p));
      const roomMap = new Map<string, string>();
      rooms.forEach((r: { id: string; name: string }) => roomMap.set(r.id, r.name));

      const { data: quizzes } = await supabase
        .from("quizzes").select("id, room_id").in("room_id", roomIds);
      const quizIds = quizzes?.map((q: { id: string }) => q.id) || [];

      const { data: responses } = quizIds.length > 0
        ? await supabase.from("quiz_responses").select("student_id, score, created_at").in("quiz_id", quizIds)
        : { data: null };

      const studentMap = new Map<string, Student>();
      participants.forEach((p: { student_id: string; room_id: string }) => {
        const profile = profileMap.get(p.student_id);
        if (!profile) return;
        const existing = studentMap.get(p.student_id);
        if (existing) {
          if (!existing.rooms.includes(roomMap.get(p.room_id) || "")) {
            existing.rooms.push(roomMap.get(p.room_id) || "");
          }
        } else {
          studentMap.set(p.student_id, {
            id: p.student_id,
            full_name: profile.full_name || "Unknown",
            email: profile.email || "",
            rooms: [roomMap.get(p.room_id) || ""],
            quiz_count: 0, avg_score: 0, last_active: "",
          });
        }
      });

      responses?.forEach((r: any) => {
        const student = studentMap.get(r.student_id);
        if (student) {
          student.quiz_count++;
          student.avg_score += r.score || 0;
          if (!student.last_active || r.created_at > student.last_active) {
            student.last_active = r.created_at;
          }
        }
      });

      studentMap.forEach((s) => {
        s.avg_score = s.quiz_count > 0 ? Math.round(s.avg_score / s.quiz_count) : 0;
      });

      setStudents(Array.from(studentMap.values()).sort((a, b) => a.full_name.localeCompare(b.full_name)));
      setLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  const filtered = search
    ? students.filter((s) => s.full_name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
    : students;

  const handleExport = () => {
    downloadCSV(filtered.map((s) => ({
      Name: s.full_name, Email: s.email, Rooms: s.rooms.join("; "),
      "Quizzes Taken": s.quiz_count, "Avg Score": s.avg_score,
      "Last Active": s.last_active ? new Date(s.last_active).toLocaleDateString() : "Never",
    })), "student-directory.csv");
  };

  return (
    <div className="max-w-6xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-charcoal/40 hover:text-charcoal/60 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Students</h1>
          <p className="text-sm text-charcoal/45">All students enrolled across your rooms.</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 bg-charcoal text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-charcoal-light transition-all">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-charcoal/30 absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full bg-white border border-border rounded-xl pl-11 pr-4 py-2.5 text-sm text-charcoal outline-none focus:border-sienna/40 transition-colors" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-sm text-charcoal/40">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-10 text-center">
          <Users className="w-10 h-10 text-charcoal/10 mx-auto mb-3" />
          <p className="text-sm text-charcoal/40">No students have joined your rooms yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-cream/30">
                <th className="text-left px-6 py-3 text-xs font-medium text-charcoal/50">Student</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-charcoal/50">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-charcoal/50">Rooms</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-charcoal/50">Quizzes</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-charcoal/50">Avg Score</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-charcoal/50">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} className="border-b border-border/50 hover:bg-cream/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-sienna/10 rounded-full flex items-center justify-center text-xs font-medium text-sienna">
                        {student.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-charcoal">{student.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal/50">{student.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {student.rooms.map((r) => (
                        <span key={r} className="text-[10px] bg-charcoal/5 text-charcoal/50 px-2 py-0.5 rounded-full">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal/60 text-center">{student.quiz_count}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-medium ${student.avg_score >= 80 ? "text-[#16A34A]" : student.avg_score >= 60 ? "text-[#CA8A04]" : "text-red-500"}`}>
                      {student.quiz_count > 0 ? `${student.avg_score}%` : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-charcoal/40 text-center">
                    {student.last_active ? new Date(student.last_active).toLocaleDateString() : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
