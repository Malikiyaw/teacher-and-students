export function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const val = String(row[h] ?? "");
    return val.includes(",") || val.includes('"') || val.includes("\n")
      ? `"${val.replace(/"/g, '""')}"` : val;
  }).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function downloadHTML(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function presentationToHTML(slides: Array<{ background: string; elements: Array<{ type: string; x: number; y: number; width: number; height: number; content: string; color: string; fontSize?: number; fontWeight?: string; fontStyle?: string; borderRadius?: number }> }>, title: string): string {
  const slideHTML = slides.map((slide, i) => `
    <div class="slide" style="background:${slide.background};display:${i === 0 ? 'block' : 'none'}" data-slide="${i}">
      ${slide.elements.map(el => {
        const base = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;`;
        if (el.type === "text") return `<div style="${base}color:${el.color};font-size:${el.fontSize || 18}px;font-weight:${el.fontWeight || 'normal'};font-style:${el.fontStyle || 'normal'};font-family:'Segoe UI',sans-serif;">${el.content}</div>`;
        if (el.type === "image") return `<img src="${el.content}" style="${base}object-fit:cover;border-radius:${el.borderRadius || 0}px;" />`;
        if (el.type === "code") return `<pre style="${base}background:#1E1E1E;color:#4EC9B0;font-family:monospace;font-size:12px;padding:12px;border-radius:8px;overflow:auto;white-space:pre;">${el.content}</pre>`;
        if (el.type === "divider") return `<div style="${base}background:${el.color};border-radius:${el.borderRadius || 0}px;"></div>`;
        return `<div style="${base}background:${el.color};border-radius:${el.borderRadius || 0}px;"></div>`;
      }).join("")}
    </div>
  `).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#1C1917;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Segoe UI',sans-serif;}.slide{position:relative;width:720px;height:405px;margin:20px auto;box-shadow:0 8px 32px rgba(0,0,0,0.4);border-radius:4px;overflow:hidden;}.nav{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:10;}.nav button{background:rgba(255,255,255,0.15);color:white;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;font-size:14px;backdrop-filter:blur(8px);}.nav button:hover{background:rgba(255,255,255,0.25);}.counter{position:fixed;top:20px;right:20px;color:rgba(255,255,255,0.5);font-size:13px;}</style></head><body>${slideHTML}<div class="nav"><button onclick="go(-1)">← Prev</button><button onclick="go(1)">Next →</button></div><div class="counter" id="counter">1 / ${slides.length}</div><script>let cur=0;const slides=document.querySelectorAll('.slide');function go(d){slides[cur].style.display='none';cur=Math.max(0,Math.min(slides.length-1,cur+d));slides[cur].style.display='block';document.getElementById('counter').textContent=(cur+1)+' / '+slides.length;}</script></body></html>`;
}