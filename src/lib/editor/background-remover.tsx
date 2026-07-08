"use client";

import React, { useState, useRef, useCallback } from "react";
import { Loader2, Upload, Trash2 } from "lucide-react";

export async function removeBackground(imageUrl: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_REMOVE_BG_KEY;
  if (apiKey) {
    try {
      const formData = new FormData();
      if (imageUrl.startsWith("data:")) {
        const blob = await fetch(imageUrl).then(r => r.blob());
        formData.append("image_file", blob, "image.png");
      } else {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        formData.append("image_file", blob, "image.png");
      }

      const res = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": apiKey },
        body: formData,
      });

      if (res.ok) {
        const blob = await res.blob();
        return await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      // fall through to chroma key
    }
  }
  return chromaKeyRemove(imageUrl, "#FFFFFF", 80);
}

export async function chromaKeyRemove(
  imageUrl: string,
  keyColor: string,
  tolerance: number
): Promise<string> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const key = hexToRgb(keyColor);
  if (!key) return imageUrl;

  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - key.r;
    const dg = data[i + 1] - key.g;
    const db = data[i + 2] - key.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist <= tolerance) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace("#", "").match(/^([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
  if (!match) return null;
  return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
}

interface BackgroundRemoverModalProps {
  onApply: (dataUrl: string) => void;
  onClose: () => void;
}

export function BackgroundRemoverModal({ onApply, onClose }: BackgroundRemoverModalProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"auto" | "chroma">("auto");
  const [keyColor, setKeyColor] = useState("#FFFFFF");
  const [tolerance, setTolerance] = useState(80);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemove = useCallback(async () => {
    if (!imageUrl) return;
    setLoading(true);
    try {
      if (mode === "auto") {
        const result = await removeBackground(imageUrl);
        setResultUrl(result);
      } else {
        const result = await chromaKeyRemove(imageUrl, keyColor, tolerance);
        setResultUrl(result);
      }
    } catch {
      // fallback
    }
    setLoading(false);
  }, [imageUrl, mode, keyColor, tolerance]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#2A2523] rounded-xl p-6 w-[480px] border border-white/10" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-heading text-lg text-white mb-4">Background Remover</h3>

        <div className="flex gap-2 mb-4">
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste image URL..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 outline-none"
          />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all">
            <Upload className="w-4 h-4" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("auto")}
            className={`flex-1 text-xs py-2 rounded-lg transition-all ${mode === "auto" ? "bg-sienna text-white" : "bg-white/5 text-white/40 hover:text-white/70"}`}
          >
            Auto Remove
          </button>
          <button
            onClick={() => setMode("chroma")}
            className={`flex-1 text-xs py-2 rounded-lg transition-all ${mode === "chroma" ? "bg-sienna text-white" : "bg-white/5 text-white/40 hover:text-white/70"}`}
          >
            Chroma Key
          </button>
        </div>

        {mode === "chroma" && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Key Color</label>
              <input
                type="color"
                value={keyColor}
                onChange={(e) => setKeyColor(e.target.value)}
                className="w-full h-8 rounded cursor-pointer bg-transparent border border-white/10"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">
                Tolerance: {tolerance}
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={tolerance}
                onChange={(e) => setTolerance(parseInt(e.target.value))}
                className="w-full accent-sienna"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleRemove}
          disabled={!imageUrl || loading}
          className="w-full bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all mb-4 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Processing..." : "Remove Background"}
        </button>

        {resultUrl && (
          <div>
            <label className="text-[10px] text-white/30 mb-1 block uppercase tracking-wider">Preview</label>
            <div className="rounded-lg overflow-hidden bg-[#1A1715] mb-3 flex items-center justify-center" style={{ minHeight: 160 }}>
              <img src={resultUrl} alt="Processed" className="max-w-full max-h-48 object-contain" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onApply(resultUrl)}
                className="flex-1 bg-sienna text-white text-xs py-2 rounded-lg hover:bg-sienna-dark transition-all"
              >
                Apply to Slide
              </button>
              <button
                onClick={() => { setResultUrl(""); setImageUrl(""); }}
                className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
