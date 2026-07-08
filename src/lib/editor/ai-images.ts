"use client";

const styleKeywords: Record<string, string> = {
  "photorealistic": "photorealistic, highly detailed, realistic lighting, 4k",
  "illustration": "digital illustration, vector art, smooth colors, professional",
  "vector": "vector graphic, flat design, clean lines, solid colors",
  "watercolor": "watercolor painting, soft edges, artistic, paper texture",
  "sketch": "pencil sketch, hand-drawn, black and white, artistic",
  "pixel-art": "pixel art, 8-bit style, retro gaming, blocky pixels",
};

async function callDalle(prompt: string, style?: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("No API key");

  const stylePrompt = style ? `${styleKeywords[style] || style}, ${prompt}` : prompt;
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: stylePrompt,
      n: 1,
      size: "1024x1024",
    }),
  });

  if (!res.ok) throw new Error(`DALL-E error: ${res.status}`);
  const data = await res.json();
  return data.data?.[0]?.url || "";
}

function getFallbackImage(prompt: string, style?: string): string {
  const seed = prompt.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const w = 640;
  const h = 640;
  const color = style === "pixel-art" || style === "sketch"
    ? `333333`
    : `C4653A`;
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

export async function generateImage(prompt: string, style?: string): Promise<string> {
  try {
    return await callDalle(prompt, style);
  } catch {
    return getFallbackImage(prompt, style);
  }
}

export async function generateImageVariation(imageUrl: string): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("No API key");

    const res = await fetch("https://api.openai.com/v1/images/variations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: (() => {
        const form = new FormData();
        form.append("image", imageUrl);
        form.append("n", "1");
        form.append("size", "1024x1024");
        return form;
      })(),
    });

    if (!res.ok) throw new Error(`Variation error: ${res.status}`);
    const data = await res.json();
    return data.data?.[0]?.url || imageUrl;
  } catch {
    const seed = Date.now();
    return `https://picsum.photos/seed/var-${seed}/640/640`;
  }
}

export function getStyleOptions() {
  return Object.keys(styleKeywords);
}
