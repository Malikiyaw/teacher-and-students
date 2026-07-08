"use client";

let templateCache: Record<string, ReturnType<typeof generateTemplateSlides>> = {};

const slideTemplates: { title: string; bullets: string[]; background: string }[] = [
  { title: "Introduction", bullets: ["Overview of the topic", "Key objectives", "What we'll cover"], background: "#1A1715" },
  { title: "Key Concepts", bullets: ["Core principles", "Fundamental ideas", "Building blocks"], background: "linear-gradient(135deg, #1A1715, #2A2523)" },
  { title: "Benefits", bullets: ["Main advantages", "Why it matters", "Impact and results"], background: "#1A1715" },
  { title: "Challenges", bullets: ["Potential obstacles", "Risk factors", "How to overcome"], background: "linear-gradient(135deg, #1A1715, #3D2A1A)" },
  { title: "Data & Insights", bullets: ["Key statistics", "Research findings", "Data-driven decisions"], background: "#1A1715" },
  { title: "Strategy", bullets: ["Action plan", "Next steps", "Timeline"], background: "linear-gradient(135deg, #1A1715, #1A2A1A)" },
  { title: "Case Studies", bullets: ["Real-world examples", "Success stories", "Lessons learned"], background: "#1A1715" },
  { title: "Comparison", bullets: ["Option A vs Option B", "Pros and cons", "Recommendations"], background: "linear-gradient(135deg, #1A1715, #2A1A2A)" },
  { title: "Summary", bullets: ["Key takeaways", "Action items", "Next steps"], background: "#1A1715" },
  { title: "Q&A", bullets: ["Open floor for questions", "Discussion points", "Contact information"], background: "linear-gradient(135deg, #1A1715, #2A2523)" },
];

export interface GeneratedSlide {
  title: string;
  bullets: string[];
  background: string;
}

async function callOpenAI(prompt: string, count: number): Promise<GeneratedSlide[]> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("No API key");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `You are a presentation slide generator. Generate ${count} slides as JSON array with objects: { title, bullets: string[], background: string }. Use dark backgrounds (#1A1715 or gradients).` },
        { role: "user", content: `Generate a presentation about: ${prompt}` },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "[]";
  const cleaned = content.replace(/```(?:json)?\s*/gi, "").trim();
  return JSON.parse(cleaned) as GeneratedSlide[];
}

export function generateTemplateSlides(topic: string): GeneratedSlide[] {
  const words = topic.toLowerCase().split(/\s+/);
  const score = (t: string) => words.some(w => t.toLowerCase().includes(w)) ? 1 : 0;
  const scored = slideTemplates.map(s => ({ ...s, relevance: score(s.title) + s.bullets.filter(b => words.some(w => b.toLowerCase().includes(w))).length }));
  const relevant = scored.filter(s => s.relevance > 0).sort((a, b) => b.relevance - a.relevance);
  const base = relevant.length >= 3 ? relevant : slideTemplates;
  return base.map(s => ({
    ...s,
    title: s.title.replace(/\b\w+\b/g, (m) => words.includes(m.toLowerCase()) ? `[${topic}] ${m}` : m).replace(/\[(.+?)\]\s*/g, "").trim() || `${topic}: ${s.title}`,
    bullets: s.bullets.map(b => b.replace(/\b\w+\b/g, (m) => words.includes(m.toLowerCase()) ? `${topic} ${m}` : m)),
  }));
}

export async function generateSlidesFromPrompt(prompt: string, count: number = 5): Promise<GeneratedSlide[]> {
  try {
    return await callOpenAI(prompt, Math.max(3, Math.min(15, count)));
  } catch {
    return generateTemplateSlides(prompt).slice(0, Math.max(3, Math.min(15, count)));
  }
}

export async function generateSlideContent(topic: string, slideCount: number = 5) {
  const generated = await generateSlidesFromPrompt(topic, slideCount);
  const slideWidth = 720;
  const slideHeight = 405;

  return generated.map((g, i) => {
    const elements: any[] = [
      {
        id: `gen-title-${i}-${Date.now()}`,
        type: "text",
        x: 60,
        y: 40,
        width: 600,
        height: 50,
        content: g.title,
        color: "#FFFFFF",
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        visible: true,
        locked: false,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
      },
    ];

    const bulletStartY = 110;
    const lineHeight = 30;
    g.bullets.forEach((b, bi) => {
      elements.push({
        id: `gen-bullet-${i}-${bi}-${Date.now()}`,
        type: "text",
        x: 80,
        y: bulletStartY + bi * lineHeight,
        width: 560,
        height: 28,
        content: `• ${b}`,
        color: "#E8D5C4",
        fontSize: 16,
        visible: true,
        locked: false,
        rotation: 0,
        opacity: 1,
        zIndex: 2,
      });
    });

    return {
      id: `gen-slide-${i}-${Date.now()}`,
      background: g.background,
      elements,
      notes: `AI-generated slide: ${g.title}`,
      transition: "fade" as const,
    };
  });
}
