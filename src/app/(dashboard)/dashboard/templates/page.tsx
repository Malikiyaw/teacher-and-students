"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Presentation, Loader2, Check, Lock, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  isPro: boolean;
  color: string;
  slides: { background: string; elements: { type: string; x: number; y: number; width: number; height: number; content: string; color: string; fontSize?: number; fontWeight?: string; fontStyle?: string; borderRadius?: number }[] }[];
}

const templates: Template[] = [
  {
    id: "minimal", name: "Minimal", description: "Clean and simple presentation", category: "General",
    isPro: false, color: "#FFFFFF",
    slides: [
      { background: "#FFFFFF", elements: [{ type: "text", x: 60, y: 160, width: 600, height: 60, content: "Your Title Here", color: "#1C1917", fontSize: 42, fontWeight: "bold" }, { type: "text", x: 60, y: 230, width: 400, height: 30, content: "Subtitle or description", color: "#6B6560", fontSize: 16 }] },
      { background: "#FFFFFF", elements: [{ type: "text", x: 60, y: 50, width: 600, height: 50, content: "Section Title", color: "#1C1917", fontSize: 28, fontWeight: "bold" }, { type: "text", x: 60, y: 120, width: 600, height: 250, content: "Add your content here. Keep it concise and focused on key points.", color: "#3D3632", fontSize: 16 }] },
    ],
  },
  {
    id: "dark", name: "Dark Mode", description: "Sleek dark theme", category: "General",
    isPro: false, color: "#1C1917",
    slides: [
      { background: "#1C1917", elements: [{ type: "text", x: 60, y: 160, width: 600, height: 60, content: "Dark Presentation", color: "#FFFFFF", fontSize: 42, fontWeight: "bold" }, { type: "text", x: 60, y: 230, width: 400, height: 30, content: "Modern and professional", color: "#A8A29E", fontSize: 16 }] },
      { background: "#1C1917", elements: [{ type: "text", x: 60, y: 50, width: 600, height: 50, content: "Key Points", color: "#C4653A", fontSize: 28, fontWeight: "bold" }, { type: "text", x: 60, y: 120, width: 600, height: 250, content: "Your content goes here. The dark background makes text pop.", color: "#E7E5E4", fontSize: 16 }] },
    ],
  },
  {
    id: "science", name: "Science Lab", description: "Perfect for science classes", category: "Science",
    isPro: false, color: "#16A34A",
    slides: [
      { background: "#FFFFFF", elements: [{ type: "shape", x: 0, y: 0, width: 720, height: 180, content: "", color: "#16A34A", borderRadius: 0 }, { type: "text", x: 60, y: 60, width: 600, height: 60, content: "Science Lesson", color: "#FFFFFF", fontSize: 36, fontWeight: "bold" }, { type: "text", x: 60, y: 120, width: 400, height: 30, content: "Subject & Grade Level", color: "#BBF7D0", fontSize: 14 }] },
      { background: "#FFFFFF", elements: [{ type: "text", x: 60, y: 40, width: 600, height: 50, content: "Today's Experiment", color: "#16A34A", fontSize: 28, fontWeight: "bold" }, { type: "shape", x: 60, y: 110, width: 290, height: 250, content: "", color: "#F0FDF4", borderRadius: 12 }, { type: "shape", x: 370, y: 110, width: 290, height: 250, content: "", color: "#F0FDF4", borderRadius: 12 }, { type: "text", x: 75, y: 170, width: 260, height: 120, content: "Observations", color: "#16A34A", fontSize: 16, fontWeight: "bold" }, { type: "text", x: 385, y: 170, width: 260, height: 120, content: "Results", color: "#16A34A", fontSize: 16, fontWeight: "bold" }] },
    ],
  },
  {
    id: "math", name: "Mathematics", description: "Clean math layout", category: "Math",
    isPro: false, color: "#2563EB",
    slides: [
      { background: "#FFFFFF", elements: [{ type: "shape", x: 0, y: 0, width: 720, height: 180, content: "", color: "#2563EB", borderRadius: 0 }, { type: "text", x: 60, y: 60, width: 600, height: 60, content: "Mathematics", color: "#FFFFFF", fontSize: 36, fontWeight: "bold" }, { type: "text", x: 60, y: 120, width: 400, height: 30, content: "Numbers, Patterns & Logic", color: "#BFDBFE", fontSize: 14 }] },
      { background: "#FFFFFF", elements: [{ type: "text", x: 60, y: 40, width: 600, height: 50, content: "Problem of the Day", color: "#2563EB", fontSize: 28, fontWeight: "bold" }, { type: "shape", x: 120, y: 120, width: 480, height: 240, content: "", color: "#EFF6FF", borderRadius: 16 }, { type: "text", x: 160, y: 180, width: 400, height: 60, content: "Solve for x: 2x + 5 = 15", color: "#1E40AF", fontSize: 24, fontWeight: "bold" }] },
    ],
  },
  {
    id: "history", name: "History", description: "Timeline-style layout", category: "History",
    isPro: false, color: "#CA8A04",
    slides: [
      { background: "#FFFBEB", elements: [{ type: "text", x: 60, y: 60, width: 600, height: 60, content: "Historical Events", color: "#78350F", fontSize: 36, fontWeight: "bold" }, { type: "shape", x: 60, y: 140, width: 200, height: 4, content: "", color: "#CA8A04" }, { type: "text", x: 60, y: 170, width: 600, height: 180, content: "Explore the events that shaped our world through engaging storytelling and primary sources.", color: "#78350F", fontSize: 16 }] },
      { background: "#FFFBEB", elements: [{ type: "text", x: 60, y: 40, width: 600, height: 50, content: "Timeline", color: "#CA8A04", fontSize: 28, fontWeight: "bold" }, { type: "shape", x: 60, y: 100, width: 4, height: 260, content: "", color: "#CA8A04" }, { type: "shape", x: 50, y: 100, width: 24, height: 24, content: "", color: "#CA8A04", borderRadius: 12 }, { type: "shape", x: 50, y: 200, width: 24, height: 24, content: "", color: "#CA8A04", borderRadius: 12 }, { type: "shape", x: 50, y: 300, width: 24, height: 24, content: "", color: "#CA8A04", borderRadius: 12 }, { type: "text", x: 90, y: 95, width: 500, height: 30, content: "Event 1 - Description", color: "#78350F", fontSize: 14 }, { type: "text", x: 90, y: 195, width: 500, height: 30, content: "Event 2 - Description", color: "#78350F", fontSize: 14 }, { type: "text", x: 90, y: 295, width: 500, height: 30, content: "Event 3 - Description", color: "#78350F", fontSize: 14 }] },
    ],
  },
  {
    id: "literature", name: "Literature", description: "Book-themed design", category: "English",
    isPro: false, color: "#7C3AED",
    slides: [
      { background: "#FAF5FF", elements: [{ type: "text", x: 100, y: 120, width: 520, height: 20, content: "\u201C", color: "#7C3AED", fontSize: 80, fontWeight: "bold" }, { type: "text", x: 100, y: 170, width: 520, height: 100, content: "A book is a dream that you hold in your hand.", color: "#1C1917", fontSize: 22, fontStyle: "italic" }, { type: "text", x: 100, y: 290, width: 300, height: 30, content: "\u2014 Neil Gaiman", color: "#6B6560", fontSize: 14 }] },
      { background: "#FAF5FF", elements: [{ type: "text", x: 60, y: 40, width: 600, height: 50, content: "Book Discussion", color: "#7C3AED", fontSize: 28, fontWeight: "bold" }, { type: "text", x: 60, y: 110, width: 600, height: 260, content: "Characters, themes, and key passages to discuss today.", color: "#3D3632", fontSize: 16 }] },
    ],
  },
  {
    id: "geography", name: "Geography", description: "World map themed", category: "Geography",
    isPro: true, color: "#06B6D4",
    slides: [
      { background: "#FFFFFF", elements: [{ type: "shape", x: 0, y: 0, width: 720, height: 180, content: "", color: "#06B6D4", borderRadius: 0 }, { type: "text", x: 60, y: 60, width: 600, height: 60, content: "World Geography", color: "#FFFFFF", fontSize: 36, fontWeight: "bold" }] },
    ],
  },
  {
    id: "business", name: "Business Plan", description: "Professional pitch deck", category: "Business",
    isPro: true, color: "#1C1917",
    slides: [
      { background: "#1C1917", elements: [{ type: "text", x: 60, y: 160, width: 600, height: 60, content: "Business Plan", color: "#FFFFFF", fontSize: 42, fontWeight: "bold" }, { type: "shape", x: 60, y: 240, width: 100, height: 4, content: "", color: "#C4653A" }] },
    ],
  },
  {
    id: "creative", name: "Creative Writing", description: "Story-focused design", category: "English",
    isPro: true, color: "#EC4899",
    slides: [
      { background: "#FDF2F8", elements: [{ type: "text", x: 60, y: 160, width: 600, height: 60, content: "Creative Writing", color: "#BE185D", fontSize: 36, fontWeight: "bold" }] },
    ],
  },
  {
    id: "tech", name: "Technology", description: "Modern tech aesthetic", category: "Technology",
    isPro: true, color: "#0EA5E9",
    slides: [
      { background: "#0F172A", elements: [{ type: "text", x: 60, y: 160, width: 600, height: 60, content: "Technology", color: "#FFFFFF", fontSize: 36, fontWeight: "bold" }, { type: "text", x: 60, y: 230, width: 400, height: 30, content: "Innovation & Future", color: "#94A3B8", fontSize: 16 }] },
    ],
  },
  {
    id: "art", name: "Art & Design", description: "Colorful creative theme", category: "Art",
    isPro: true, color: "#F59E0B",
    slides: [
      { background: "#FFFBEB", elements: [{ type: "text", x: 60, y: 160, width: 600, height: 60, content: "Art & Design", color: "#B45309", fontSize: 36, fontWeight: "bold" }] },
    ],
  },
  {
    id: "music", name: "Music", description: "Rhythmic design", category: "Music",
    isPro: true, color: "#8B5CF6",
    slides: [
      { background: "#FAF5FF", elements: [{ type: "text", x: 60, y: 160, width: 600, height: 60, content: "Music Class", color: "#6D28D9", fontSize: 36, fontWeight: "bold" }] },
    ],
  },
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [creating, setCreating] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const categories = ["All", ...new Set(templates.map((t) => t.category))];
  const filtered = selectedCategory === "All" ? templates : templates.filter((t) => t.category === selectedCategory);

  const createFromTemplate = async (template: Template) => {
    setCreating(template.id);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data } = await supabase.from("presentations").insert({
      user_id: user.id,
      title: `${template.name} Presentation`,
      slides: template.slides.map((s, i) => ({
        ...s,
        id: String(Date.now() + i),
        elements: s.elements.map((el, j) => ({ ...el, id: `${Date.now()}-${j}`, width: el.width || 300, height: el.height || 40 })),
      })),
      template: template.id,
    }).select().single();

    if (data) router.push(`/editor/${data.id}`);
    setCreating(null);
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Templates</h1>
        <p className="text-sm text-charcoal/45">Start with a pre-designed template and customize it for your class.</p>
      </div>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === cat ? "bg-charcoal text-white" : "bg-white border border-border text-charcoal/60 hover:bg-cream"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((template) => (
          <div key={template.id} className="group bg-white border border-border rounded-xl overflow-hidden hover:border-charcoal/15 transition-all duration-300">
            <div className="aspect-video relative overflow-hidden" style={{ background: template.slides[0]?.background || "#FFF" }}>
              <div className="absolute inset-0 p-4 flex flex-col justify-center">
                {(template.slides[0]?.elements || []).slice(0, 3).map((el, i) => (
                  <div key={i} className="truncate" style={{ color: el.color, fontSize: Math.min(el.fontSize || 18, 16), fontWeight: el.fontWeight }}>
                    {el.content}
                  </div>
                ))}
              </div>
              {template.isPro && (
                <div className="absolute top-3 right-3 bg-charcoal/80 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Pro
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-heading text-lg text-charcoal group-hover:text-sienna transition-colors">{template.name}</h3>
                  <p className="text-xs text-charcoal/45">{template.description}</p>
                </div>
                <span className="text-[10px] text-charcoal/30 bg-cream px-2 py-0.5 rounded-full">{template.category}</span>
              </div>
              <button onClick={() => createFromTemplate(template)} disabled={creating === template.id}
                className="w-full mt-3 bg-charcoal/5 text-charcoal text-xs font-medium py-2.5 rounded-lg hover:bg-sienna hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {creating === template.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Plus className="w-3.5 h-3.5" /> Use Template</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
