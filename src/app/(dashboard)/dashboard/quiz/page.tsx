"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, GripVertical, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export default function QuizCreatorPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Untitled Quiz");
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { id: "1", question: "", options: ["", "", "", ""], correctIndex: 0 },
  ]);
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState<Array<{ id: string; name: string }>>([]);
  const [launching, setLaunching] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("rooms").select("id, name").eq("teacher_id", user.id).eq("status", "active");
      if (data) setRooms(data);
    };
    fetchData();
  }, [supabase, router]);

  const addQuestion = () => {
    setQuestions([...questions, { id: String(Date.now()), question: "", options: ["", "", "", ""], correctIndex: 0 }]);
  };

  const updateQuestion = (id: string, field: string, value: string | number) => {
    setQuestions(questions.map((q) => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (qId: string, optIndex: number, value: string) => {
    setQuestions(questions.map((q) => q.id === qId ? { ...q, options: q.options.map((o, i) => i === optIndex ? value : o) } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const launchQuiz = async () => {
    if (!roomId) { alert("Select a room first"); return; }
    setLaunching(true);

    const { error } = await supabase.from("quizzes").insert({
      room_id: roomId,
      title,
      questions: questions.map(({ question, options, correctIndex }) => ({ question, options, correctIndex })),
    });

    setLaunching(false);
    if (!error) router.push("/dashboard/rooms");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 text-charcoal/40 hover:text-charcoal/60 hover:bg-charcoal/5 rounded-lg transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-heading text-3xl text-charcoal tracking-tight bg-transparent border-none outline-none w-full"
          />
          <p className="text-sm text-charcoal/40 mt-1">{questions.length} question{questions.length !== 1 ? "s" : ""}</p>
        </div>
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="bg-white border border-border rounded-lg px-3 py-2 text-sm text-charcoal"
        >
          <option value="">Select room</option>
          {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <button
          onClick={launchQuiz}
          disabled={launching || !roomId}
          className="bg-sienna text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-sienna-dark transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
        >
          {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Launch Quiz
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={q.id} className="bg-white border border-border rounded-xl p-6 relative group">
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 pt-1">
                <GripVertical className="w-4 h-4 text-charcoal/20 cursor-grab" />
                <span className="font-heading text-lg text-sienna">{qi + 1}</span>
              </div>
              <div className="flex-1 space-y-4">
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
                  placeholder="Enter your question..."
                  className="w-full text-base font-medium text-charcoal bg-transparent border-b border-border pb-2 focus:border-sienna/40 outline-none transition-colors placeholder:text-charcoal/25"
                />
                <div className="grid grid-cols-2 gap-3">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => updateQuestion(q.id, "correctIndex", oi)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-all ${
                        q.correctIndex === oi
                          ? "border-[#16A34A] bg-[#16A34A]/5 text-[#16A34A]"
                          : "border-border bg-cream/50 text-charcoal/60 hover:border-charcoal/20"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        q.correctIndex === oi ? "border-[#16A34A] bg-[#16A34A]" : "border-charcoal/20"
                      }`}>
                        {q.correctIndex === oi && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(q.id, oi, e.target.value)}
                        placeholder={`Option ${oi + 1}`}
                        className="flex-1 bg-transparent outline-none text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => removeQuestion(q.id)} className="p-2 text-charcoal/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="w-full mt-6 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border rounded-xl text-sm text-charcoal/40 hover:text-sienna hover:border-sienna/30 transition-all duration-300"
      >
        <Plus className="w-4 h-4" /> Add Question
      </button>
    </div>
  );
}
