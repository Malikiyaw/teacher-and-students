"use client";

interface SvgSlideElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  visible: boolean;
  locked: boolean;
  rotation: number;
  opacity: number;
  svgContent?: string;
  maintainAspectRatio?: boolean;
}

export async function parseSVGFile(file: File): Promise<SvgSlideElement> {
  const svgContent = await file.text();

  const widthMatch = svgContent.match(/width="([^"]+)"/);
  const heightMatch = svgContent.match(/height="([^"]+)"/);
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);

  let w = 400;
  let h = 300;

  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].split(/\s+/).map(Number);
    if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
      w = parts[2];
      h = parts[3];
    }
  }

  if (widthMatch) {
    const parsed = parseFloat(widthMatch[1]);
    if (!isNaN(parsed)) w = parsed;
  }
  if (heightMatch) {
    const parsed = parseFloat(heightMatch[1]);
    if (!isNaN(parsed)) h = parsed;
  }

  const scale = Math.min(600 / w, 350 / h, 1);
  const displayW = Math.round(w * scale);
  const displayH = Math.round(h * scale);
  const x = Math.round((720 - displayW) / 2);
  const y = Math.round((405 - displayH) / 2);

  return {
    id: "svg_" + String(Date.now()) + Math.random().toString(36).slice(2, 7),
    type: "image",
    x,
    y,
    width: displayW,
    height: displayH,
    content: "",
    color: "#000000",
    visible: true,
    locked: false,
    rotation: 0,
    opacity: 1,
    svgContent,
    maintainAspectRatio: true,
  };
}
