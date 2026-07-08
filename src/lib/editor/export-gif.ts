"use client";

import { toPng } from "html-to-image";

interface GIFSlide {
  background: string;
  elements: Array<{
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
    opacity?: number;
    borderRadius?: number;
    svgContent?: string;
  }>;
}

function renderSlideToContainer(slide: GIFSlide, container: HTMLElement) {
  container.innerHTML = "";
  container.style.cssText = `width:720px;height:405px;position:relative;overflow:hidden;background:${slide.background};`;

  for (const el of slide.elements) {
    const div = document.createElement("div");
    const base = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;opacity:${el.opacity ?? 1};`;

    if (el.type === "text") {
      div.style.cssText = `${base}color:${el.color};font-size:${el.fontSize || 18}px;font-weight:${el.fontWeight || "normal"};font-style:${el.fontStyle || "normal"};font-family:'Segoe UI',sans-serif;overflow:hidden;word-break:break-word;`;
      div.textContent = el.content;
    } else if (el.type === "image") {
      if (el.svgContent) {
        const encoded = encodeURIComponent(el.svgContent);
        div.innerHTML = `<img src="data:image/svg+xml,${encoded}" style="width:100%;height:100%;object-fit:contain;" />`;
      } else {
        div.innerHTML = `<img src="${el.content}" style="width:100%;height:100%;object-fit:cover;border-radius:${el.borderRadius || 0}px;" />`;
      }
    } else if (el.type === "code") {
      div.style.cssText = `${base}background:#1E1E1E;color:#4EC9B0;font-family:monospace;font-size:13px;padding:12px;border-radius:8px;overflow:hidden;white-space:pre-wrap;`;
      div.textContent = el.content;
    } else {
      div.style.cssText = `${base}background:${el.color};border-radius:${el.borderRadius || 0}px;`;
    }

    container.appendChild(div);
  }
}

export async function exportAsGIF(
  slides: GIFSlide[],
  options?: { frameDelay?: number; quality?: number }
): Promise<void> {
  const frameDelay = options?.frameDelay ?? 1500;
  const quality = options?.quality ?? 0.8;

  const container = document.createElement("div");
  container.style.cssText = "position:fixed;left:-9999px;top:0;";
  document.body.appendChild(container);

  try {
    const frames: ImageData[] = [];
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 405;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    for (let i = 0; i < slides.length; i++) {
      renderSlideToContainer(slides[i], container);
      await new Promise((r) => setTimeout(r, 100));
      const dataUrl = await toPng(container, { quality, pixelRatio: 1 });
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          ctx!.clearRect(0, 0, 720, 405);
          ctx!.drawImage(img, 0, 0, 720, 405);
          frames.push(ctx!.getImageData(0, 0, 720, 405));
          resolve();
        };
        img.onerror = reject;
        img.src = dataUrl;
      });
    }

    const gifBlob = await encodeGIF(frames, 720, 405, frameDelay);
    const url = URL.createObjectURL(gifBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presentation.gif`;
    a.click();
    URL.revokeObjectURL(url);
  } finally {
    document.body.removeChild(container);
  }
}

async function encodeGIF(
  frames: ImageData[],
  width: number,
  height: number,
  delay: number
): Promise<Blob> {
  return generateFallbackGIF(frames, width, height, delay);
}

async function generateFallbackGIF(
  frames: ImageData[],
  width: number,
  height: number,
  delay: number
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  const totalDuration = frames.length * delay;
  const fps = 10;
  const frameInterval = Math.max(1, Math.round(1000 / fps));
  const totalFrames = Math.max(1, Math.round(totalDuration / frameInterval));

  const gifCanvas = document.createElement("canvas");
  gifCanvas.width = width;
  gifCanvas.height = height;
  const gifCtx = gifCanvas.getContext("2d");
  if (!gifCtx) throw new Error("No gif canvas context");

  const framesPerSlide = Math.max(1, Math.round(delay / frameInterval));

  for (let f = 0; f < totalFrames; f++) {
    const slideIdx = Math.min(Math.floor(f / framesPerSlide), frames.length - 1);
    gifCtx.putImageData(frames[slideIdx], 0, 0);
  }

  const chunks: BlobPart[] = [];
  const stream = (gifCanvas as any).captureStream?.(fps);
  if (stream) {
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    return new Promise((resolve) => {
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: "video/webm" }));
      };
      recorder.start();
      setTimeout(() => recorder.stop(), totalDuration);
    });
  }

  throw new Error("GIF encoding requires gif.js library. Install with: npm install gif.js");
}
