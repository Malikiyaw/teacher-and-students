"use client";

interface MdSlideElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  visible: boolean;
  locked: boolean;
  rotation: number;
  opacity: number;
  alt?: string;
  href?: string;
  codeLanguage?: string;
}

interface MdSlide {
  id: string;
  elements: MdSlideElement[];
  background: string;
  notes?: string;
  transition?: "none" | "fade" | "slide" | "zoom" | "morph";
}

let yPos = 0;

function resetYPos() { yPos = 0; }

function addY(h: number, pad: number = 8) {
  const p = yPos;
  yPos += h + pad;
  return p;
}

function makeTextEl(content: string, opts: {
  x?: number; w?: number; h?: number; color?: string; fontSize?: number;
  fontWeight?: string; fontStyle?: string; textAlign?: string;
}): MdSlideElement {
  return {
    id: "md_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
    type: "text",
    x: opts.x ?? 40,
    y: addY(opts.h ?? 30, 6),
    width: opts.w ?? 640,
    height: opts.h ?? 30,
    content,
    color: opts.color ?? "#FFFFFF",
    fontSize: opts.fontSize ?? 18,
    fontWeight: opts.fontWeight,
    fontStyle: opts.fontStyle,
    textAlign: opts.textAlign,
    visible: true, locked: false, rotation: 0, opacity: 1,
  };
}

function makeImageEl(src: string, alt: string): MdSlideElement {
  return {
    id: "md_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
    type: "image",
    x: 60,
    y: addY(200, 12),
    width: 600,
    height: 200,
    content: src,
    color: "#000000",
    visible: true, locked: false, rotation: 0, opacity: 1,
    alt: alt || undefined,
  };
}

function parseCodeBlock(lines: string[], startIdx: number): { content: string; endIdx: number } {
  let code = "";
  let i = startIdx + 1;
  while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
    code += lines[i] + "\n";
    i++;
  }
  return { content: code.trimEnd(), endIdx: i };
}

export function parseMarkdown(markdown: string): MdSlide[] {
  const slides: MdSlide[] = [];
  const rawSlides = markdown.split(/\n---\n|\n---\r?\n|^---\n/);

  for (const raw of rawSlides) {
    resetYPos();
    const elements: MdSlideElement[] = [];
    const lines = raw.split("\n");
    let inCodeBlock = false;
    let codeContent = "";
    let codeStartLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          elements.push({
            id: "md_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
            type: "code",
            x: 40,
            y: addY(20 + codeContent.split("\n").length * 18, 10),
            width: 640,
            height: 20 + codeContent.split("\n").length * 18,
            content: codeContent.trimEnd(),
            color: "#4EC9B0",
            fontSize: 13,
            visible: true, locked: false, rotation: 0, opacity: 1,
          });
          codeContent = "";
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeContent = "";
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent += line + "\n";
        continue;
      }

      if (trimmed === "") continue;

      if (trimmed.startsWith("# ")) {
        elements.push({
          id: "md_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
          type: "text",
          x: 40,
          y: addY(56, 12),
          width: 640,
          height: 56,
          content: trimmed.slice(2),
          color: "#FFFFFF",
          fontSize: 40,
          fontWeight: "bold",
          textAlign: "center",
          visible: true, locked: false, rotation: 0, opacity: 1,
        });
      } else if (trimmed.startsWith("## ")) {
        elements.push({
          id: "md_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
          type: "text",
          x: 40,
          y: addY(40, 10),
          width: 640,
          height: 40,
          content: trimmed.slice(3),
          color: "#E8A87C",
          fontSize: 30,
          fontWeight: "bold",
          visible: true, locked: false, rotation: 0, opacity: 1,
        });
      } else if (trimmed.startsWith("### ")) {
        elements.push(makeTextEl(trimmed.slice(4), { fontSize: 24, fontWeight: "bold", color: "#C4653A" }));
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        elements.push(makeTextEl("• " + trimmed.slice(2), { fontSize: 18, color: "#D0C8C0" }));
      } else if (/^\d+\.\s/.test(trimmed)) {
        elements.push(makeTextEl(trimmed, { fontSize: 18, color: "#D0C8C0" }));
      } else if (trimmed.startsWith("> ")) {
        const quoteText = trimmed.slice(2);
        elements.push(makeTextEl(quoteText, {
          fontSize: 20, fontStyle: "italic", color: "#A89890",
          x: 60, w: 620,
        }));
      } else if (trimmed.startsWith("![")) {
        const altMatch = trimmed.match(/^!\[([^\]]*)\]/);
        const urlMatch = trimmed.match(/\(([^)]+)\)/);
        if (urlMatch) {
          elements.push(makeImageEl(urlMatch[1], altMatch?.[1] || ""));
        }
      } else if (trimmed.startsWith("[")) {
        const linkMatch = trimmed.match(/^\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          elements.push({
            id: "md_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
            type: "text",
            x: 40,
            y: addY(24, 6),
            width: 640,
            height: 24,
            content: linkMatch[1],
            color: "#4A9EF5",
            fontSize: 16,
            href: linkMatch[2],
            visible: true, locked: false, rotation: 0, opacity: 1,
          });
        }
      } else {
        elements.push(makeTextEl(trimmed, { fontSize: 18, color: "#D0C8C0" }));
      }
    }

    if (elements.length === 0) continue;

    slides.push({
      id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
      elements,
      background: "#1C1917",
      notes: "",
      transition: "none",
    });
  }

  return slides;
}
