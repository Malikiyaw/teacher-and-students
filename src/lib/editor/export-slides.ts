export function exportToPDF(title: string, slides: Array<{ background: string; elements: Array<{ type: string; x: number; y: number; width: number; height: number; content: string; color: string; fontSize?: number; fontWeight?: string; fontStyle?: string; borderRadius?: number }> }>) {
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
      if (el.type === "youtube") return `<div style="${style}background:#000;display:flex;align-items:center;justify-content:center;color:white;font-size:14px">🎬 ${el.content}</div>`;
      return `<div style="${style}background:${el.color};border-radius:${el.borderRadius || 0}px"></div>`;
    }).join("");
    return `<div class="slide" style="background:${slide.background}">${els}</div>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${slidesHTML}</body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);

  // Open print dialog for PDF save
  const w = window.open("");
  if (w) {
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  }
}

export function exportToPPTX(title: string, slides: Array<{ background: string; elements: Array<{ type: string; x: number; y: number; width: number; height: number; content: string; color: string; fontSize?: number; fontWeight?: string; fontStyle?: string; borderRadius?: number }> }>) {
  // Generate basic PPTX using XML approach (simplified)
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const slideXML = slides.map((slide, i) => {
    const bgColor = slide.background.replace("#", "");
    const elementsXML = slide.elements.map((el, ei) => {
      const cx = Math.round((el.x + el.width / 2) * 9.14); // approximate EMU conversion
      const cy = Math.round((el.y + el.height / 2) * 9.14);
      const cw = Math.round(el.width * 9.14);
      const ch = Math.round(el.height * 9.14);
      if (el.type === "text") {
        return `<p:sp><p:nvSpPr><p:cNvPr id="${ei}" name="Text${ei}"/><p:cNvSpPr txBox="1"/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${cx}" y="${cy}"/><a:ext cx="${cw}" cy="${ch}"/></a:xfrm><a:prstGeom prst="rect"/></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr sz="${(el.fontSize || 18) * 100}"${el.fontWeight === "bold" ? ' b="1"' : ""}${el.fontStyle === "italic" ? ' i="1"' : ""}><a:solidFill><a:srgbClr val="${el.color.replace("#", "")}"/></a:solidFill></a:rPr><a:t>${esc(el.content)}</a:t></a:r></a:p></p:txBody></p:sp>`;
      }
      if (el.type === "image") {
        return `<p:sp><p:nvSpPr><p:cNvPr id="${ei}" name="Image${ei}"/><p:cNvSpPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${cx}" y="${cy}"/><a:ext cx="${cw}" cy="${ch}"/></a:xfrm><a:prstGeom prst="rect"/></p:spPr></p:sp>`;
      }
      return `<p:sp><p:nvSpPr><p:cNvPr id="${ei}" name="Shape${ei}"/><p:cNvSpPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${cx}" y="${cy}"/><a:ext cx="${cw}" cy="${ch}"/></a:xfrm><a:prstGeom prst="rect"/><a:solidFill><a:srgbClr val="${el.color.replace("#", "")}"/></a:solidFill></a:spPr></p:sp>`;
    }).join("");

    return `<p:sld><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="914400" cy="514350"/></a:xfrm></p:grpSpPr>${elementsXML}</p:spTree></p:cSld><p:bg><p:solidFill><a:srgbClr val="${bgColor}"/></a:solidFill></p:bg></p:sld>`;
  }).join("");

  const pkg = `<?xml version="1.0" encoding="UTF-8"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:sldIdLst><p:sldId id="256" r:id="rId1"/></p:sldIdLst><p:sldSz cx="914400" cy="514350"/><p:notesSz cx="685800" cy="914400"/></p:presentation>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body><p>PPTX export: ${title} (${slides.length} slides)</p><p>For full PPTX support, use File > Download As > PPTX in a future update.</p></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.pptx.html`;
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
    const style = window.getComputedStyle(el);
    const x = parseInt(el.style.left || "0");
    const y = parseInt(el.style.top || "0");
    const w = parseInt(el.style.width || "100");
    const h = parseInt(el.style.height || "40");
    ctx.fillStyle = style.color || "#000";
    ctx.font = `${style.fontSize || "18px"} ${style.fontFamily || "sans-serif"}`;
    if (el.tagName === "IMG") {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = (el as HTMLImageElement).src;
        img.onload = () => ctx.drawImage(img, x, y, w, h);
      } catch {}
    } else {
      const text = el.textContent || "";
      ctx.fillText(text, x + 4, y + parseInt(style.fontSize || "18"));
    }
  });

  const link = document.createElement("a");
  link.download = `${title.replace(/[^a-z0-9]/gi, "_")}-slide-${slideIndex + 1}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
