"use client";

interface ArrangementElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  color?: string;
  fontSize?: number;
  locked?: boolean;
  [key: string]: any;
}

function getElementPriority(el: ArrangementElement): number {
  if (el.type === "text" && el.fontSize && el.fontSize >= 28) return 0;
  if (el.type === "image") return 1;
  if (el.type === "text") return 2;
  if (el.type === "shape") return 3;
  if (el.type === "code") return 4;
  if (el.type === "table") return 4;
  if (el.type === "youtube" || el.type === "video") return 4;
  return 5;
}

function isLarge(el: ArrangementElement): boolean {
  return el.width >= 300 || el.height >= 200;
}

export function autoArrangeElements(elements: ArrangementElement[], slideWidth: number, slideHeight: number): ArrangementElement[] {
  const sorted = [...elements].sort((a, b) => getElementPriority(a) - getElementPriority(b));
  if (sorted.length === 0) return sorted;

  const margin = 40;
  const gap = 20;
  let result: ArrangementElement[] = [];

  if (sorted.length === 1) {
    const el = { ...sorted[0] };
    el.x = (slideWidth - el.width) / 2;
    el.y = (slideHeight - el.height) / 2;
    result = [el];
  } else if (sorted.length === 2) {
    const available = slideWidth - margin * 2 - gap;
    const halfW = Math.floor(available / 2);
    sorted.forEach((el, i) => {
      const clone = { ...el };
      clone.width = Math.min(clone.width, halfW - 10);
      clone.height = Math.min(clone.height, slideHeight - margin * 2);
      clone.x = margin + i * (halfW + gap) + (halfW - clone.width) / 2;
      clone.y = (slideHeight - clone.height) / 2;
      result.push(clone);
    });
  } else {
    const largeEls = sorted.filter(isLarge);
    const smallEls = sorted.filter(e => !isLarge(e));

    if (largeEls.length >= 1) {
      const large = { ...largeEls[0] };
      const rightColW = Math.floor((slideWidth - margin * 2 - gap) * 0.4);
      const leftColW = slideWidth - margin * 2 - gap - rightColW;

      large.width = Math.min(large.width, leftColW - 10);
      large.height = Math.min(large.height, slideHeight - margin * 2);
      large.x = margin + (leftColW - large.width) / 2;
      large.y = (slideHeight - large.height) / 2;
      result.push(large);

      const rightEls = [...largeEls.slice(1), ...smallEls].slice(0, 4);
      const rMargin = margin + leftColW + gap;
      const rGap = 10;
      const itemH = Math.min(80, Math.floor((slideHeight - margin * 2 - rGap * (rightEls.length - 1)) / rightEls.length));
      rightEls.forEach((el, i) => {
        const clone = { ...el };
        clone.width = Math.min(clone.width, rightColW - 10);
        clone.height = Math.min(clone.height, itemH - 4);
        clone.x = rMargin + (rightColW - clone.width) / 2;
        clone.y = margin + i * (itemH + rGap) + (itemH - clone.height) / 2;
        result.push(clone);
      });

      const remaining = [...largeEls.slice(1 + rightEls.length), ...smallEls.slice(0, Math.max(0, smallEls.length - rightEls.length))];
      remaining.forEach((el) => {
        const clone = { ...el };
        clone.x = margin + Math.random() * (slideWidth - margin * 2 - clone.width);
        clone.y = margin + Math.random() * (slideHeight - margin * 2 - clone.height);
        result.push(clone);
      });
    } else {
      const cols = Math.min(sorted.length, 3);
      const cellW = Math.floor((slideWidth - margin * 2 - gap * (cols - 1)) / cols);
      sorted.forEach((el, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const clone = { ...el };
        clone.width = Math.min(clone.width, cellW - 10);
        clone.height = Math.min(clone.height, 120);
        clone.x = margin + col * (cellW + gap) + (cellW - clone.width) / 2;
        clone.y = margin + row * (130 + gap);
        result.push(clone);
      });
    }
  }

  return result;
}

export function smartDistribute(elements: ArrangementElement[]): ArrangementElement[] {
  const visible = elements.filter(e => !e.locked);
  if (visible.length < 2) return elements;

  const lockedIds = new Set(elements.filter(e => e.locked).map(e => e.id));
  const sorted = [...visible].sort((a, b) => a.x - b.x);
  const minX = Math.min(...sorted.map(e => e.x));
  const maxX = Math.max(...sorted.map(e => e.x + e.width));
  const totalW = sorted.reduce((s, e) => s + e.width, 0);
  const gap = (maxX - minX - totalW) / (sorted.length - 1);

  let cx = minX;
  return elements.map(el => {
    if (lockedIds.has(el.id)) return el;
    const s = sorted.find(s => s.id === el.id);
    if (!s) return el;
    const clone = { ...el };
    clone.x = cx;
    cx += clone.width + gap;
    return clone;
  });
}

export function autoSizeText(elements: ArrangementElement[]): ArrangementElement[] {
  return elements.map(el => {
    if (el.type !== "text") return el;
    const maxSize = 72;
    const minSize = 8;
    const charCount = (el.content || "").length;
    const area = el.width * el.height;

    if (charCount === 0) return el;

    let estimated = Math.floor(Math.sqrt(area / charCount) * 2);
    estimated = Math.max(minSize, Math.min(maxSize, estimated));

    if (charCount > 100) estimated = Math.min(estimated, 14);
    else if (charCount > 50) estimated = Math.min(estimated, 18);
    else if (charCount > 20) estimated = Math.min(estimated, 24);

    return { ...el, fontSize: estimated };
  });
}

export function suggestLayout(elements: ArrangementElement[]): string {
  const textEls = elements.filter(e => e.type === "text");
  const imgEls = elements.filter(e => e.type === "image");
  const total = elements.length;

  if (total === 0) return "blank";
  if (total === 1) return "spotlight";

  const largeTexts = textEls.filter(e => (e.fontSize || 18) >= 28).length;

  if (total <= 2) return "side-by-side";

  if (imgEls.length >= 2 && textEls.length <= 1) return "grid";
  if (largeTexts >= 1 && imgEls.length > 0) return "spotlight";

  if (textEls.length >= 3 && imgEls.length === 0) return "stack";
  if (imgEls.length >= 1) return "side-by-side";

  return "grid";
}
