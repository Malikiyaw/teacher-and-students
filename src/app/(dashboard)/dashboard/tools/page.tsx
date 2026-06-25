"use client";

import Link from "next/link";
import { Vote, Brain, Timer, PenTool, ArrowRight, Cloud, MessageSquareText, Users, BarChart3 } from "lucide-react";

const tools = [
  { icon: Vote, title: "Create Poll", desc: "Ask a question, get instant votes from your students in real-time.", href: "/dashboard/poll", color: "bg-sienna" },
  { icon: Brain, title: "Create Quiz", desc: "Build multiple-choice quizzes with auto-scoring and leaderboards.", href: "/dashboard/quiz", color: "bg-charcoal" },
  { icon: Cloud, title: "Word Cloud", desc: "Students submit words, see a live word cloud form in real-time.", href: "/dashboard/wordcloud", color: "bg-[#2563EB]" },
  { icon: MessageSquareText, title: "Exit Ticket", desc: "Quick end-of-class feedback to gauge student understanding.", href: "/dashboard/exit-ticket", color: "bg-[#16A34A]" },
  { icon: PenTool, title: "Whiteboard", desc: "Freehand drawing, shapes, colors, and export.", href: "/dashboard/whiteboard", color: "bg-[#7C3AED]" },
  { icon: Users, title: "Attendance", desc: "Track who joined each room session automatically.", href: "/dashboard/attendance", color: "bg-[#CA8A04]" },
  { icon: BarChart3, title: "Analytics", desc: "View class-wide performance, engagement, and trends.", href: "/dashboard/analytics", color: "bg-[#06B6D4]" },
];

export default function ToolsPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Classroom Tools</h1>
        <p className="text-sm text-charcoal/45">Interactive tools to engage your students during presentations.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link key={tool.title} href={tool.href}
            className="group bg-white border border-border rounded-xl p-8 hover:border-charcoal/15 transition-all duration-300">
            <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center mb-5`}>
              <tool.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-heading text-xl text-charcoal mb-2 group-hover:text-sienna transition-colors">{tool.title}</h3>
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
