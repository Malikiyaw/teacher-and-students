import PptxGenJS from "pptxgenjs";

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
      if (el.type === "image") return `<img src="${el.content}" style="${style}object-fit:cover;border-radius:${el.borderRadius || 0}px" />`;
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

export function exportSlideAsPNG(slideElement: HTMLElement | null, title: string, slideIndex: number) {
  if (!slideElement) return;
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const bg = window.getComputedStyle(slideElement).background;
  ctx.fillStyle = bg || "#FFFFFF";
  ctx.fillRect(0, 0, 1280, 720);

  const elements = slideElement.querySelectorAll<HTMLElement>("[data-element]");
  elements.forEach((el) => {
    const left = parseFloat(el.style.left || "0");
    const top = parseFloat(el.style.top || "0");
    const w = parseFloat(el.style.width || "100");
    const h = parseFloat(el.style.height || "40");
    const x = Math.round(left * 1280 / 720);
    const y = Math.round(top * 720 / 405);
    const cw = Math.round(w * 1280 / 720);
    const ch = Math.round(h * 720 / 405);

    const img = el.querySelector("img");
    if (img) {
      try {
        const imgEl = new Image();
        imgEl.crossOrigin = "anonymous";
        imgEl.src = img.src;
        imgEl.onload = () => ctx.drawImage(imgEl, x, y, cw, ch);
      } catch {}
      return;
    }

    ctx.fillStyle = el.style.background || "#F0EDE8";
    if (el.style.background && el.style.background !== "transparent") {
      ctx.fillRect(x, y, cw, ch);
    }

    const text = el.textContent || "";
    if (text.trim()) {
      const color = el.style.color || "#1C1917";
      const fontSize = parseInt(el.style.fontSize || "18");
      ctx.fillStyle = color;
      ctx.font = `${fontSize * 1280 / 720}px Inter, sans-serif`;
      ctx.fillText(text.trim(), x + 4, y + fontSize);
    }
  });

  const link = document.createElement("a");
  link.download = `${title.replace(/[^a-z0-9]/gi, "_")}-slide-${slideIndex + 1}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
