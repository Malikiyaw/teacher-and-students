"use client";

import Link from "next/link";
import { Layout, PenTool, Image, Code2, Shapes, Palette, ArrowRight } from "lucide-react";

const tools = [
  { icon: Layout, title: "Templates", desc: "Start from a professionally designed presentation template.", href: "/dashboard/templates", color: "bg-[#4F46E5]" },
  { icon: PenTool, title: "Whiteboard", desc: "Freehand drawing, shapes, colors, and export. Save & share.", href: "/dashboard/whiteboard", color: "bg-[#7C3AED]" },
  { icon: Image, title: "Upload Assets", desc: "Upload images and media to use across your presentations.", href: "/dashboard/files", color: "bg-[#16A34A]" },
  { icon: Shapes, title: "Shapes & Icons", desc: "Built into the editor — hundreds of shapes and icons ready to drag in.", href: "/editor/new", color: "bg-[#2563EB]" },
  { icon: Code2, title: "Code Blocks", desc: "Syntax-highlighted code in 190+ languages. Perfect for CS lessons.", href: "/editor/new", color: "bg-charcoal" },
  { icon: Palette, title: "Color & Themes", desc: "Set custom themes and palettes that apply across your entire deck.", href: "/dashboard/templates", color: "bg-[#EA580C]" },
];

export default function ToolsPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Presentation Tools</h1>
        <p className="text-sm text-charcoal/45">Everything you need to build stunning presentations.</p>
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
