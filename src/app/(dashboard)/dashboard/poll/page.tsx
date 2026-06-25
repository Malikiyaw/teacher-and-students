"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, GripVertical, BarChart3 } from "lucide-react";

interface PollOption {
  id: string;
  text: string;
}

export default function PollCreatorPage() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<PollOption[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ]);
  const [showPreview, setShowPreview] = useState(false);

  const addOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, { id: String(Date.now()), text: "" }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter((o) => o.id !== id));
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="p-2 text-charcoal/40 hover:text-charcoal/60 hover:bg-charcoal/5 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="font-heading text-3xl text-charcoal tracking-tight">
            Create Poll
          </h1>
        </div>
        <button className="bg-sienna text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-sienna-dark transition-all duration-300">
          Launch Poll
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <label className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-2 block">
          Question
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your students something..."
          className="w-full font-heading text-xl text-charcoal bg-transparent border-b border-border pb-3 focus:border-sienna/40 outline-none transition-colors placeholder:text-charcoal/20"
        />
      </div>

      <div className="space-y-3 mb-6">
        {options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-sienna/8 rounded-lg flex items-center justify-center text-xs font-medium text-sienna shrink-0">
              {String.fromCharCode(65 + i)}
            </div>
            <input
              type="text"
              value={opt.text}
              onChange={(e) => updateOption(opt.id, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className="flex-1 bg-white border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/25 focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20 outline-none transition-all"
            />
            <button
              onClick={() => removeOption(opt.id)}
              className="p-2 text-charcoal/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {options.length < 6 && (
        <button
          onClick={addOption}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-sm text-charcoal/40 hover:text-sienna hover:border-sienna/30 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Add Option
        </button>
      )}
    </div>
  );
}
