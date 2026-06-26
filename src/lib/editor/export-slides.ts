import PptxGenJS from "pptxgenjs";
import { toPng } from "html-to-image";

interface ExportElement {
  type: string; x: number; y: number; width: number; height: number;
  content: string; color: string; fontSize?: number; fontWeight?: string;
  fontStyle?: string; borderRadius?: number;
}

interface ExportSlide { background: string; elements: ExportElement[]; }

export function exportToPDF(title: string, slides: ExportSlide[]) {
  const css = `
    @page { size: 1280px 720px; margin: 0; }
    body { margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; }
    .slide { width: 1280px; height: 720px; page-break-after: always; position: relative; overflow: hidden; }
    .slide:last-child { page-break-after: avoid; }
  `;
  const slidesHTML = slides.map((slide) => {
    const els = slide.elements.map(el => {
      const style = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;`;
      if (el.type === "text") return `<div style="${style}color:${el.color};font-size:${el.fontSize || 18}px;font-weight:${el.fontWeight || 'normal'};font-style:${el.fontStyle || 'normal'}">${el.content}</div>`;
      if (el.type === "image") return `<img src="${el.content}" style="${style}object-fit:cover;border-radius:${el.borderRadius || 0}px" alt="" />`;
      if (el.type === "code") return `<pre style="${style}background:#1E1E1E;color:#4EC9B0;font-family:monospace;font-size:12px;padding:12px;border-radius:8px;overflow:hidden">${el.content}</pre>`;
      if (el.type === "divider") return `<div style="${style}background:${el.color};border-radius:${el.borderRadius || 0}px"></div>`;
      if (el.type === "youtube") return `<div style="${style}background:#000;display:flex;align-items:center;justify-content:center;color:white;font-size:14px">${el.content}</div>`;
      return `<div style="${style}background:${el.color};border-radius:${el.borderRadius || 0}px"></div>`;
    }).join("");
    return `<div class="slide" style="background:${slide.background}">${els}</div>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${slidesHTML}</body></html>`;
  const w = window.open("");
  if (w) {
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  }
}

export async function exportToPPTX(title: string, slides: ExportSlide[]) {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "CUSTOM", width: 12.8, height: 7.2 });
  pptx.layout = "CUSTOM";

  for (const slide of slides) {
    const s = pptx.addSlide();
    s.background = { fill: slide.background };

    for (const el of slide.elements) {
      const x = el.x / 100;
      const y = el.y / 100;
      const w = el.width / 100;
      const h = el.height / 100;

      if (el.type === "text") {
        s.addText(el.content, {
          x, y, w, h,
          fontSize: el.fontSize || 18,
          color: el.color,
          bold: el.fontWeight === "bold",
          italic: el.fontStyle === "italic",
          fontFace: "Inter",
          valign: "top",
        });
      } else if (el.type === "image") {
        try {
          s.addImage({ path: el.content, x, y, w, h });
        } catch {}
      } else if (el.type === "code") {
        s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color: "1E1E1E" } });
        s.addText(el.content, { x: x + 0.1, y, w: w - 0.2, h, fontSize: 10, color: "4EC9B0", fontFace: "Courier New" });
      } else if (el.type === "divider") {
        s.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.03, fill: { color: el.color.replace("#", "") } });
      } else {
        s.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: el.color.replace("#", "") }, rectRadius: (el.borderRadius || 0) / 100 });
      }
    }
  }

  const result = await pptx.write({ outputType: "blob" });
  const blob = result as Blob;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.pptx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportSlideAsPNG(slideElement: HTMLElement | null, title: string, slideIndex: number) {
  if (!slideElement) return;
  try {
    const dataUrl = await toPng(slideElement, { quality: 1, pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = `${title.replace(/[^a-z0-9]/gi, "_")}-slide-${slideIndex + 1}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("PNG export failed:", err);
    alert("PNG export failed. Try using Print → Save as PDF instead.");
  }
}
