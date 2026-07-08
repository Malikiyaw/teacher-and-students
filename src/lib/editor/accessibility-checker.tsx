"use client";

import { useState, useMemo, useCallback } from "react";
import { AlertTriangle, Eye, X, CheckCheck, FileText } from "lucide-react";

// ─── WCAG Contrast ───

function hexToRGBValues(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(foreground: string, background: string): number {
  const [fr, fg, fb] = hexToRGBValues(foreground);
  const [br, bg, bb] = hexToRGBValues(background);
  const l1 = relativeLuminance(fr, fg, fb);
  const l2 = relativeLuminance(br, bg, bb);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAGAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

export function meetsWCAGAAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

function suggestBetterColor(fg: string, bg: string): string {
  const [fr, fgR, fb] = hexToRGBValues(fg);
  const [br, bgR, bb] = hexToRGBValues(bg);
  // Try darkening/lightening
  let best = fg;
  let bestRatio = 0;
  // Try darkening steps
  for (let t = 1; t <= 10; t++) {
    const factor = 1 - t * 0.08;
    const nr = Math.round(fr * factor);
    const ng = Math.round(fgR * factor);
    const nb = Math.round(fb * factor);
    const hex = "#" + [nr, ng, nb].map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("");
    const ratio = getContrastRatio(hex, bg);
    if (ratio > bestRatio) { bestRatio = ratio; best = hex; }
  }
  // Try lightening steps
  for (let t = 1; t <= 10; t++) {
    const factor = 1 + t * 0.08;
    const nr = Math.round(fr * factor);
    const ng = Math.round(fgR * factor);
    const nb = Math.round(fb * factor);
    const hex = "#" + [nr, ng, nb].map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("");
    const ratio = getContrastRatio(hex, bg);
    if (ratio > bestRatio) { bestRatio = ratio; best = hex; }
  }
  if (bestRatio >= 4.5) return best;
  // Fallback: black or white
  const whiteRatio = getContrastRatio("#FFFFFF", bg);
  const blackRatio = getContrastRatio("#000000", bg);
  return whiteRatio > blackRatio ? "#FFFFFF" : "#000000";
}

function isHexColor(s: string): boolean {
  return /^#[0-9A-Fa-f]{3,6}$/.test(s);
}

// ─── Types ───

export interface A11yIssue {
  type: "error" | "warning" | "info";
  message: string;
  elementId?: string;
  fix?: () => void;
}

export interface SlideElement {
  id: string;
  type: string;
  content: string;
  color: string;
  fontSize?: number;
  alt?: string;
  shapeText?: string;
  visible?: boolean;
  [key: string]: any;
}

export interface Slide {
  id: string;
  elements: SlideElement[];
  background: string;
  [key: string]: any;
}

// ─── Checker ───

export function checkAccessibility(slide: Slide, updateElement: (elId: string, changes: Partial<SlideElement>) => void): A11yIssue[] {
  const issues: A11yIssue[] = [];
  const bgColor = slide.background || "#FFFFFF";

  for (const el of slide.elements) {
    if (el.visible === false) continue;

    // 1. Text contrast ratio
    if ((el.type === "text" || el.type === "latex") && el.content && el.color) {
      if (isHexColor(el.color) && isHexColor(bgColor)) {
        const isLarge = (el.fontSize || 18) >= 18;
        const ratio = getContrastRatio(el.color, bgColor);
        const passes = isLarge ? ratio >= 3 : ratio >= 4.5;
        if (!passes) {
          const fixedColor = suggestBetterColor(el.color, bgColor);
          issues.push({
            type: "error",
            message: `Low contrast: text "${el.content.slice(0, 30)}" (${el.color}) on background (${bgColor}). Ratio: ${ratio.toFixed(1)}:1`,
            elementId: el.id,
            fix: () => updateElement(el.id, { color: fixedColor }),
          });
        }
      }
    }

    // 2. Missing alt text on images
    if (el.type === "image") {
      if (!el.alt || el.alt.trim() === "") {
        const fileName = el.content?.split("/")?.pop()?.split("?")[0] || "image";
        issues.push({
          type: "error",
          message: "Image missing alt text",
          elementId: el.id,
          fix: () => updateElement(el.id, { alt: fileName.replace(/\.[^.]+$/, "") }),
        });
      } else if (el.alt && el.alt.length < 3) {
        issues.push({
          type: "warning",
          message: `Alt text seems too short: "${el.alt}"`,
          elementId: el.id,
        });
      }
    }

    // 3. Text too small (<12px)
    if ((el.type === "text" || el.type === "latex") && el.fontSize && el.fontSize < 12 && el.content) {
      issues.push({
        type: "warning",
        message: `Text too small: ${el.fontSize}px ("${el.content.slice(0, 30)}"). Minimum 12px recommended.`,
        elementId: el.id,
        fix: () => updateElement(el.id, { fontSize: 12 }),
      });
    }

    // 4. Empty elements
    if ((el.type === "text" || el.type === "shape" || el.type === "code") && (!el.content || el.content.trim() === "")) {
      if (!el.shapeText && el.type !== "shape") {
        issues.push({
          type: "info",
          message: `Empty ${el.type} element`,
          elementId: el.id,
          fix: () => updateElement(el.id, { visible: false }),
        });
      }
    }

    // 5. Color-only information - shape without text label
    if (el.type === "shape" && !el.shapeText && !el.content?.startsWith("rect") && !el.chartType && !el.iconId && !el.qrContent) {
      issues.push({
        type: "info",
        message: "Shape without text label - ensure color is not the only differentiator",
        elementId: el.id,
      });
    }

    // 6. Check readability of text content
    if ((el.type === "text" || el.type === "latex") && el.content) {
      const words = el.content.split(/\s+/).filter(Boolean);
      const avgWordLen = words.reduce((sum, w) => sum + w.length, 0) / (words.length || 1);
      if (avgWordLen > 10) {
        issues.push({
          type: "warning",
          message: `Text contains long words (avg ${avgWordLen.toFixed(1)} chars) - consider simplifying`,
          elementId: el.id,
        });
      }
      // Check for overly long text
      if (el.content.length > 500) {
        issues.push({
          type: "info",
          message: "Text element is very long - consider splitting into multiple elements",
          elementId: el.id,
        });
      }
    }

    // 7. Check shape text contrast
    if (el.type === "shape" && el.shapeText && el.color && isHexColor(el.color)) {
      if (isHexColor(bgColor)) {
        const ratio = getContrastRatio(el.color, bgColor);
        if (ratio < 3) {
          const fixedColor = suggestBetterColor(el.color, bgColor);
          issues.push({
            type: "error",
            message: `Low contrast shape text: "${el.shapeText}"`,
            elementId: el.id,
            fix: () => updateElement(el.id, { color: fixedColor }),
          });
        }
      }
    }

    // 8. Heading/structure - first text element should be descriptive
    if (el.type === "text" && el.content && !slide.elements.some(e => e.id !== el.id && e.type === "text" && e.content.length > el.content.length)) {
      // Suggest as potential slide title
      if (el.content.length > 100) {
        issues.push({
          type: "info",
          message: "Consider using a shorter slide title for better scannability",
          elementId: el.id,
        });
      }
    }
  }

  // 9. Missing slide title
  const textElements = slide.elements.filter(el => el.type === "text" && el.visible !== false && el.content.trim());
  if (textElements.length === 0) {
    issues.push({
      type: "warning",
      message: "Slide has no text - consider adding a title or description",
    });
  }

  return issues;
}

// ─── React Component ───

type SeverityFilter = "all" | "error" | "warning" | "info";

interface AccessibilityPanelProps {
  issues: A11yIssue[];
  onFix: (issue: A11yIssue) => void;
  onFixAll: () => void;
}

export function AccessibilityPanel({ issues, onFix, onFixAll }: AccessibilityPanelProps) {
  const [filter, setFilter] = useState<SeverityFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return issues;
    return issues.filter(i => i.type === filter);
  }, [issues, filter]);

  const errorCount = issues.filter(i => i.type === "error").length;
  const warningCount = issues.filter(i => i.type === "warning").length;
  const infoCount = issues.filter(i => i.type === "info").length;

  return (
    <div className="flex flex-col h-full bg-[#231F1D] text-white">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
        <span className="text-xs font-medium text-white/40 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> Accessibility
        </span>
        {issues.length > 0 && <button onClick={onFixAll} className="text-[10px] bg-sienna/20 text-sienna px-2 py-1 rounded hover:bg-sienna/30 transition-all">Fix All</button>}
      </div>

      {/* Summary badge */}
      <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 text-[10px] shrink-0">
        <span className="text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">{errorCount} error{errorCount !== 1 ? "s" : ""}</span>
        <span className="text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">{warningCount} warning{warningCount !== 1 ? "s" : ""}</span>
        <span className="text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">{infoCount} info</span>
      </div>

      {/* Filter */}
      <div className="flex border-b border-white/5 shrink-0">
        {(["all", "error", "warning", "info"] as SeverityFilter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 text-[10px] py-2 transition-all capitalize ${filter === f ? "text-sienna border-b-2 border-sienna" : "text-white/30 hover:text-white/50"}`}>
            {f === "error" ? `Errors (${errorCount})` : f === "warning" ? `Warnings (${warningCount})` : f === "info" ? `Info (${infoCount})` : "All"}
          </button>
        ))}
      </div>

      {/* Issues */}
      <div className="flex-1 overflow-y-auto">
        {issues.length === 0 ? (
          <div className="p-4 text-center text-[11px] text-green-400/60 flex items-center justify-center gap-1">
            <CheckCheck className="w-3.5 h-3.5" /> No accessibility issues found
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-[11px] text-white/20">No issues match filter</div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {filtered.map((issue, i) => (
              <div key={i} className="px-4 py-2.5 hover:bg-white/[0.02]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    {issue.type === "error" && <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />}
                    {issue.type === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />}
                    {issue.type === "info" && <AlertTriangle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                      <div className={`text-[11px] ${issue.type === "error" ? "text-red-400/90" : issue.type === "warning" ? "text-yellow-400/80" : "text-blue-400/70"}`}>
                        {issue.message}
                      </div>
                      {issue.elementId && (
                        <div className="text-[9px] text-white/20 mt-0.5 font-mono">Element: {issue.elementId.slice(0, 12)}</div>
                      )}
                    </div>
                  </div>
                  {issue.fix && (
                    <button onClick={() => onFix(issue)} className="text-[9px] text-sienna bg-sienna/10 hover:bg-sienna/20 px-1.5 py-0.5 rounded transition-all shrink-0">
                      Fix
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export */}
      <div className="border-t border-white/5 p-3 shrink-0">
        <button onClick={() => {
          const report = issues.map(i => `[${i.type.toUpperCase()}] ${i.message}`).join("\n");
          const blob = new Blob([report], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "accessibility-report.txt";
          a.click();
          URL.revokeObjectURL(url);
        }} className="text-[10px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1 justify-center w-full py-1">
          <FileText className="w-3 h-3" /> Export Report
        </button>
      </div>
    </div>
  );
}
