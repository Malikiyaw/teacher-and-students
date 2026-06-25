"use client";

import Link from "next/link";
import { Vote, Brain, Timer, PenTool, ArrowRight } from "lucide-react";

const tools = [
  {
    icon: Vote,
    title: "Create Poll",
    desc: "Ask a question, get instant votes from your students in real-time.",
    href: "/dashboard/poll",
    color: "bg-sienna",
  },
  {
    icon: Brain,
    title: "Create Quiz",
    desc: "Build multiple-choice quizzes with auto-scoring and leaderboards.",
    href: "/dashboard/quiz",
    color: "bg-charcoal",
  },
  {
    icon: Timer,
    title: "Countdown Timer",
    desc: "Set timed activities with audible alerts for group work and exams.",
    href: "/dashboard/rooms",
    color: "bg-[#16A34A]",
  },
  {
    icon: PenTool,
    title: "Whiteboard",
    desc: "Freehand drawing, shapes, colors, and export. Perfect for explaining concepts.",
    href: "/dashboard/whiteboard",
    color: "bg-[#2563EB]",
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Classroom Tools</h1>
        <p className="text-sm text-charcoal/45">Interactive tools to engage your students during presentations.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="group bg-white border border-border rounded-xl p-8 hover:border-charcoal/15 transition-all duration-300"
          >
            <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center mb-5`}>
              <tool.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-heading text-xl text-charcoal mb-2 group-hover:text-sienna transition-colors">
              {tool.title}
            </h3>
            <p className="text-sm text-charcoal/50 mb-4">{tool.desc}</p>
            <span className="text-xs font-medium text-sienna flex items-center gap-1">
              Open tool <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
