"use client";

interface ImportSlideElement {
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
  svgContent?: string;
}

interface ImportSlide {
  id: string;
  elements: ImportSlideElement[];
  background: string;
  notes?: string;
  transition?: "none" | "fade" | "slide" | "zoom" | "morph";
}

function emuToPx(emu: number): number {
  return Math.round((emu / 914400) * 96);
}

function parseHexColor(colorStr: string | undefined): string {
  if (!colorStr) return "#000000";
  const srgb = colorStr.match(/srgb:\s*([0-9A-Fa-f]{6})\s*/);
  if (srgb) return "#" + srgb[1];
  const hex = colorStr.match(/#([0-9A-Fa-f]{6})\b/);
  if (hex) return "#" + hex[1];
  return "#000000";
}

function parseXmlText(xml: string): string {
  return xml.replace(/<[^>]*>/g, "").trim();
}

function parseXmlAttr(xml: string, tag: string, attr: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}\\s*=\\s*"([^"]*)"`, "i");
  const m = xml.match(re);
  return m ? m[1] : undefined;
}

function extractTextFromSlide(slideXml: string): ImportSlideElement[] {
  const elements: ImportSlideElement[] = [];
  const shapeRegex = /<p:sp[^>]*>[\s\S]*?<\/p:sp>/g;
  let shapeMatch: RegExpExecArray | null;

  while ((shapeMatch = shapeRegex.exec(slideXml)) !== null) {
    const shapeXml = shapeMatch[0];

    const nvSpPr = shapeXml.match(/<p:nvSpPr>[\s\S]*?<\/p:nvSpPr>/i)?.[0] || "";
    const isImage = shapeXml.includes("<p:blipFill>") || shapeXml.includes("a:blip");
    const isShape = shapeXml.includes("<p:spPr>") && !isImage;

    const spPr = shapeXml.match(/<p:spPr>[\s\S]*?<\/p:spPr>/i)?.[0] || shapeXml.match(/<a:spPr>[\s\S]*?<\/a:spPr>/i)?.[0] || "";

    let x = 0, y = 0, w = 0, h = 0;
    const offMatch = spPr.match(/<a:off\s+[^>]*x="([^"]*)"\s+y="([^"]*)"/i);
    const extMatch = spPr.match(/<a:ext\s+[^>]*cx="([^"]*)"\s+cy="([^"]*)"/i);
    if (offMatch) { x = emuToPx(parseInt(offMatch[1])); y = emuToPx(parseInt(offMatch[2])); }
    if (extMatch) { w = emuToPx(parseInt(extMatch[1])); h = emuToPx(parseInt(extMatch[2])); }

    if (isImage) {
      const blipR = shapeXml.match(/r:embed\s*=\s*"([^"]*)"/i);
      elements.push({
        id: "img_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
        type: "image",
        x, y, width: Math.max(w, 10), height: Math.max(h, 10),
        content: blipR ? `rId:${blipR[1]}` : "",
        color: "#000000",
        visible: true, locked: false, rotation: 0, opacity: 1,
      });
      continue;
    }

    if (isShape) {
      const prstGeom = shapeXml.match(/<a:prstGeom[^>]*\s+prst\s*=\s*"([^"]*)"/i);
      const shapeName = prstGeom ? prstGeom[1] : "";
      const solidFill = shapeXml.match(/<a:solidFill>[\s\S]*?<a:srgbClr\s+val\s*=\s*"([^"]*)"[\s\S]*?<\/a:solidFill>/i);
      const fillColor = solidFill ? "#" + solidFill[1] : "#E0E0E0";

      const txBody = shapeXml.match(/<p:txBody>[\s\S]*?<\/p:txBody>/i)?.[0] || "";
      const paragraphs = [...txBody.matchAll(/<a:p>[\s\S]*?<\/a:p>/gi)];
      const textContent = paragraphs.map(p => parseXmlText(p[0])).filter(t => t).join("\n");

      if (textContent) {
        const defRPr = txBody.match(/<a:defRPr[^>]*>/i)?.[0] || "";
        const fontSizeStr = defRPr.match(/sz\s*=\s*"([^"]*)"/i);
        const fontSize = fontSizeStr ? Math.round(parseInt(fontSizeStr[1]) / 100) : undefined;
        const bold = defRPr.includes('b="1"') || defRPr.includes('b="true"');
        const italic = defRPr.includes('i="1"') || defRPr.includes('i="true"');
        const alignMatch = txBody.match(/<a:algn>([^<]*)<\/a:algn>/i);
        const align = alignMatch ? alignMatch[1].toLowerCase() : undefined;

        elements.push({
          id: "text_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
          type: "text",
          x, y, width: Math.max(w, 20), height: Math.max(h, 14),
          content: textContent,
          color: parseHexColor(spPr),
          fontSize,
          fontWeight: bold ? "bold" : undefined,
          fontStyle: italic ? "italic" : undefined,
          textAlign: align === "ctr" ? "center" : align === "r" ? "right" : "left",
          visible: true, locked: false, rotation: 0, opacity: 1,
        });
      } else {
        elements.push({
          id: "shape_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
          type: "shape",
          x, y, width: Math.max(w, 10), height: Math.max(h, 10),
          content: shapeName || "rect",
          color: fillColor,
          visible: true, locked: false, rotation: 0, opacity: 1,
        });
      }
      continue;
    }

    const txBody = shapeXml.match(/<p:txBody>[\s\S]*?<\/p:txBody>/i)?.[0] || "";
    if (!txBody) continue;

    const paragraphs = [...txBody.matchAll(/<a:p>[\s\S]*?<\/a:p>/gi)];
    const textContent = paragraphs.map(p => parseXmlText(p[0])).filter(t => t).join("\n");
    if (!textContent) continue;

    const defRPr = txBody.match(/<a:defRPr[^>]*>/i)?.[0] || "";
    const fontSizeStr = defRPr.match(/sz\s*=\s*"([^"]*)"/i);
    const fontSize = fontSizeStr ? Math.round(parseInt(fontSizeStr[1]) / 100) : undefined;
    const bold = defRPr.includes('b="1"') || defRPr.includes('b="true"');
    const italic = defRPr.includes('i="1"') || defRPr.includes('i="true"');
    const alignMatch = txBody.match(/<a:algn>([^<]*)<\/a:algn>/i);
    const align = alignMatch ? alignMatch[1].toLowerCase() : undefined;

    elements.push({
      id: "text_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
      type: "text",
      x, y, width: Math.max(w, 20), height: Math.max(h, 14),
      content: textContent,
      color: parseHexColor(spPr),
      fontSize,
      fontWeight: bold ? "bold" : undefined,
      fontStyle: italic ? "italic" : undefined,
      textAlign: align === "ctr" ? "center" : align === "r" ? "right" : "left",
      visible: true, locked: false, rotation: 0, opacity: 1,
    });
  }

  return elements;
}

export async function parsePPTXFile(file: File): Promise<ImportSlide[]> {
  let JSZip: any;
  try {
    JSZip = (await import("jszip")).default;
  } catch {
    throw new Error(
      "JSZip library is required for PPTX import. Run: npm install jszip"
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const slideFiles = Object.keys(zip.files)
    .filter((name) => name.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] || "0");
      const nb = parseInt(b.match(/\d+/)?.[0] || "0");
      return na - nb;
    });

  const slides: ImportSlide[] = [];

  for (const slidePath of slideFiles) {
    const slideXml = await zip.files[slidePath].async("text");
    const elements = extractTextFromSlide(slideXml);

    const bgMatch = slideXml.match(/<a:srgbClr\s+val\s*=\s*"([^"]*)"/i);
    const background = bgMatch ? "#" + bgMatch[1] : "#FFFFFF";

    slides.push({
      id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
      elements,
      background,
      notes: "",
      transition: "none",
    });
  }

  return slides;
}
