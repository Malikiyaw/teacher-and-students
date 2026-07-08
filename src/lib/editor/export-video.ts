"use client";

interface VideoExportSlide {
  background: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  elements: Array<{
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
    fontFamily?: string;
    borderRadius?: number;
    alt?: string;
    opacity?: number;
    rotation?: number;
    href?: string;
    shapeText?: string;
    svgContent?: string;
    maintainAspectRatio?: boolean;
    codeLanguage?: string;
  }>;
}

function renderSlideToHTML(slide: VideoExportSlide, index: number): string {
  const bg = slide.backgroundImage
    ? `background-image:url(${slide.backgroundImage});background-size:cover;background-position:center;`
    : slide.backgroundGradient
      ? `background:${slide.backgroundGradient};`
      : `background:${slide.background};`;

  const els = slide.elements.map((el) => {
    const style = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;opacity:${el.opacity ?? 1};transform:rotate(${el.rotation ?? 0}deg);`;

    if (el.type === "text") {
      return `<div style="${style}color:${el.color};font-size:${el.fontSize || 18}px;font-weight:${el.fontWeight || "normal"};font-style:${el.fontStyle || "normal"};text-align:${el.textAlign || "left"};font-family:'Segoe UI',sans-serif;overflow:hidden;word-break:break-word;">${el.content}</div>`;
    }

    if (el.type === "image") {
      if (el.svgContent) {
        const encoded = encodeURIComponent(el.svgContent);
        return `<img src="data:image/svg+xml,${encoded}" style="${style}object-fit:contain;" alt="${el.alt || ""}" />`;
      }
      return `<img src="${el.content}" style="${style}object-fit:cover;border-radius:${el.borderRadius || 0}px;" alt="${el.alt || ""}" />`;
    }

    if (el.type === "code") {
      return `<pre style="${style}background:#1E1E1E;color:#4EC9B0;font-family:monospace;font-size:13px;padding:12px;border-radius:8px;overflow:hidden;white-space:pre-wrap;">${el.content}</pre>`;
    }

    if (el.type === "shape") {
      return `<div style="${style}background:${el.color};border-radius:${el.borderRadius || 0}px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;">${el.shapeText || ""}</div>`;
    }

    if (el.type === "divider") {
      return `<div style="${style}background:${el.color};border-radius:${el.borderRadius || 0}px;"></div>`;
    }

    return `<div style="${style}background:${el.color};border-radius:${el.borderRadius || 0}px;"></div>`;
  }).join("");

  return `<div class="slide" data-index="${index}" style="${bg}">${els}</div>`;
}

export function generateVideoHTML(
  slides: VideoExportSlide[],
  title: string,
  options?: { transition?: string; duration?: number }
): string {
  const duration = options?.duration ?? 3;
  const transition = options?.transition ?? "fade";

  const slidesHTML = slides.map((s, i) => renderSlideToHTML(s, i)).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Segoe UI',sans-serif;overflow:hidden;}
#player{position:relative;width:720px;height:405px;overflow:hidden;border-radius:4px;}
.slide{position:absolute;top:0;left:0;width:720px;height:405px;opacity:0;transition:opacity 0.5s ease;pointer-events:none;}
.slide.active{opacity:1;}
#controls{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:8px;align-items:center;z-index:100;}
#controls button{background:rgba(255,255,255,0.15);color:white;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;backdrop-filter:blur(8px);}
#controls button:hover{background:rgba(255,255,255,0.25);}
#controls button:disabled{opacity:0.3;cursor:default;}
#controls span{color:rgba(255,255,255,0.5);font-size:13px;min-width:60px;text-align:center;}
#status{position:fixed;top:16px;right:16px;color:rgba(255,255,255,0.3);font-size:12px;z-index:100;}
#recordBtn{background:#C4653A !important;color:#fff !important;}
#recordBtn.recording{animation:pulse 1s infinite;background:#dc2626 !important;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
</style>
</head>
<body>
<div id="player">${slidesHTML}</div>
<div id="controls">
<button id="playBtn" onclick="togglePlay()">Play</button>
<button id="recordBtn" onclick="toggleRecord()">Record Video</button>
<button id="prevBtn" onclick="prevSlide()" disabled>Prev</button>
<span id="counter">1 / ${slides.length}</span>
<button id="nextBtn" onclick="nextSlide()">Next</button>
</div>
<div id="status">${title}</div>
<script>
let currentSlide = 0;
const totalSlides = ${slides.length};
const slideDuration = ${duration} * 1000;
let playing = false;
let recording = false;
let playTimer = null;
let mediaRecorder = null;
let recordedChunks = [];
const slides = document.querySelectorAll('.slide');

function showSlide(index) {
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  document.getElementById('counter').textContent = (index + 1) + ' / ' + totalSlides;
  document.getElementById('prevBtn').disabled = index === 0;
  document.getElementById('nextBtn').disabled = index === totalSlides - 1;
  currentSlide = index;
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) showSlide(currentSlide + 1);
}

function prevSlide() {
  if (currentSlide > 0) showSlide(currentSlide - 1);
}

function togglePlay() {
  playing = !playing;
  document.getElementById('playBtn').textContent = playing ? 'Pause' : 'Play';
  if (playing) {
    slides.forEach(s => s.style.transition = 'opacity 0.5s ease');
    if (currentSlide >= totalSlides - 1) showSlide(0);
    playTimer = setInterval(() => {
      if (currentSlide >= totalSlides - 1) {
        clearInterval(playTimer);
        playing = false;
        document.getElementById('playBtn').textContent = 'Play';
        return;
      }
      nextSlide();
    }, slideDuration);
  } else {
    clearInterval(playTimer);
  }
}

async function toggleRecord() {
  if (recording) {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    recording = false;
    document.getElementById('recordBtn').textContent = 'Record Video';
    document.getElementById('recordBtn').classList.remove('recording');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: 'browser' },
      audio: false,
      preferCurrentTab: true,
    });
    const player = document.getElementById('player');
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 405;
    const ctx = canvas.getContext('2d');
    if (!ctx) { alert('Canvas not supported'); return; }

    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    recordedChunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '${title.replace(/[^a-z0-9]/gi, "_")}.webm';
      a.click();
      URL.revokeObjectURL(url);
      stream.getTracks().forEach(t => t.stop());
      document.getElementById('recordBtn').textContent = 'Record Video';
      document.getElementById('recordBtn').classList.remove('recording');
      recording = false;
    };

    mediaRecorder.start(100);
    recording = true;
    document.getElementById('recordBtn').textContent = 'Stop Recording';
    document.getElementById('recordBtn').classList.add('recording');

    showSlide(0);
    for (let i = 0; i < totalSlides; i++) {
      showSlide(i);
      await new Promise(r => setTimeout(r, ${duration * 1000}));
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  } catch (err) {
    console.error('Recording failed:', err);
    recording = false;
    document.getElementById('recordBtn').textContent = 'Record Video';
    document.getElementById('recordBtn').classList.remove('recording');
  }
}

showSlide(0);
</script>
</body>
</html>`;
}

export function exportAsVideoHTML(
  slides: VideoExportSlide[],
  title: string,
  options?: { transition?: string; duration?: number }
) {
  const html = generateVideoHTML(slides, title, options);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, "_")}-video.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function openVideoPlayer(
  slides: VideoExportSlide[],
  title: string,
  options?: { transition?: string; duration?: number }
) {
  const html = generateVideoHTML(slides, title, options);
  const w = window.open("", "_blank", "width=800,height=600");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
