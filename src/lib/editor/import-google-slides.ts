"use client";

interface GSlideElement {
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
  svgContent?: string;
}

interface GSlide {
  id: string;
  elements: GSlideElement[];
  background: string;
  notes?: string;
  transition?: "none" | "fade" | "slide" | "zoom" | "morph";
}

function parseGColor(style: string): string {
  const m = style.match(/color:\s*([^;]+)/);
  if (!m) return "#000000";
  const c = m[1].trim();
  if (c.startsWith("#")) return c;
  if (c.startsWith("rgb")) {
    const nums = c.match(/\d+/g);
    if (nums && nums.length >= 3) {
      return "#" + nums.slice(0, 3).map((n) => parseInt(n).toString(16).padStart(2, "0")).join("");
    }
  }
  return "#000000";
}

function parseGFontSize(style: string): number | undefined {
  const m = style.match(/font-size:\s*(\d+)px/);
  return m ? parseInt(m[1]) : undefined;
}

function parseGAlign(style: string): string | undefined {
  if (style.includes("text-align: center") || style.includes("text-align:center")) return "center";
  if (style.includes("text-align: right") || style.includes("text-align:right")) return "right";
  return "left";
}

function parseGPosition(el: Element): { x: number; y: number; w: number; h: number } {
  const style = el.getAttribute("style") || "";
  const left = style.match(/left:\s*(\d+(?:\.\d+)?)/);
  const top = style.match(/top:\s*(\d+(?:\.\d+)?)/);
  const width = style.match(/width:\s*(\d+(?:\.\d+)?)/);
  const height = style.match(/height:\s*(\d+(?:\.\d+)?)/);
  return {
    x: left ? parseFloat(left[1]) : 0,
    y: top ? parseFloat(top[1]) : 0,
    w: width ? parseFloat(width[1]) : 100,
    h: height ? parseFloat(height[1]) : 20,
  };
}

function extractGoogleSlideTitle(doc: Document): string {
  const titleEl = doc.querySelector("title");
  return titleEl?.textContent?.trim() || "Imported Presentation";
}

export function importFromGoogleSlides(htmlContent: string): GSlide[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const slides: GSlide[] = [];

  const slideContainers = doc.querySelectorAll(".slide, [class*='slide'], .punch, [class*='punch']");
  const containers = slideContainers.length > 0 ? slideContainers : doc.body.children;

  for (const container of containers) {
    const elements: GSlideElement[] = [];
    const tagName = container.tagName.toLowerCase();
    if (tagName === "script" || tagName === "style") continue;

    const slideStyle = (container as HTMLElement).getAttribute("style") || "";
    const bgMatch = slideStyle.match(/background(?:-color)?:\s*([^;]+)/);
    const background = bgMatch ? bgMatch[1].trim() : "#FFFFFF";

    const children = container.querySelectorAll("p, h1, h2, h3, h4, h5, h6, img, li, div");
    for (const child of children) {
      const style = (child as HTMLElement).getAttribute("style") || "";
      const pos = parseGPosition(child);
      const text = child.textContent?.trim();
      const tag = child.tagName.toLowerCase();

      if (tag === "img") {
        const src = child.getAttribute("src") || "";
        const alt = child.getAttribute("alt") || "";
        if (src) {
          elements.push({
            id: "gs_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
            type: "image",
            x: pos.x, y: pos.y, width: pos.w || 200, height: pos.h || 150,
            content: src,
            color: "#000000",
            alt,
            visible: true, locked: false, rotation: 0, opacity: 1,
          });
        }
        continue;
      }

      if (!text) continue;

      if (tag.match(/^h[1-6]$/)) {
        const level = parseInt(tag[1]);
        const size = level === 1 ? 36 : level === 2 ? 28 : level === 3 ? 22 : 18;
        elements.push({
          id: "gs_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
          type: "text",
          x: pos.x, y: pos.y, width: pos.w || 600, height: pos.h || size + 10,
          content: text,
          color: parseGColor(style),
          fontSize: size,
          fontWeight: "bold",
          textAlign: "left",
          visible: true, locked: false, rotation: 0, opacity: 1,
        });
        continue;
      }

      if (tag === "li") {
        const listType = child.parentElement?.tagName === "OL" ? "numbered" : "bullet";
        const prefix = listType === "numbered" ? "1. " : "• ";
        elements.push({
          id: "gs_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
          type: "text",
          x: pos.x + 20, y: pos.y, width: (pos.w || 580) - 20, height: pos.h || 22,
          content: prefix + text,
          color: parseGColor(style),
          fontSize: parseGFontSize(style) || 16,
          visible: true, locked: false, rotation: 0, opacity: 1,
        });
        continue;
      }

      const fontSize = parseGFontSize(style);
      const isBold = style.includes("font-weight: bold") || style.includes("font-weight:bold") || tag === "strong" || tag === "b";
      const isItalic = style.includes("font-style: italic") || style.includes("font-style:italic") || tag === "em" || tag === "i";
      const align = parseGAlign(style);

      elements.push({
        id: "gs_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
        type: "text",
        x: pos.x, y: pos.y, width: pos.w || 600, height: pos.h || 22,
        content: text,
        color: parseGColor(style),
        fontSize: fontSize || 16,
        fontWeight: isBold ? "bold" : undefined,
        fontStyle: isItalic ? "italic" : undefined,
        textAlign: align,
        visible: true, locked: false, rotation: 0, opacity: 1,
      });
    }

    if (elements.length === 0) continue;

    slides.push({
      id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
      elements,
      background,
      notes: "",
      transition: "none",
    });
  }

  if (slides.length === 0) {
    const bodyText = doc.body.textContent?.trim() || "";
    if (bodyText) {
      slides.push({
        id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
        elements: [{
          id: "gs_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
          type: "text",
          x: 40, y: 40, width: 640, height: 40,
          content: extractGoogleSlideTitle(doc),
          color: "#000000",
          fontSize: 28,
          fontWeight: "bold",
          visible: true, locked: false, rotation: 0, opacity: 1,
        }],
        background: "#FFFFFF",
        notes: "",
        transition: "none",
      });
    }
  }

  return slides;
}
