export type AlignType = "left" | "center" | "right" | "top" | "middle" | "bottom";
export type DistributeType = "horizontal" | "vertical";

interface ElementBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function alignElements(elements: ElementBounds[], align: AlignType, canvasWidth: number, canvasHeight: number): ElementBounds[] {
  if (elements.length === 0) return elements;
  const result = [...elements];
  const container = getBoundingBox(result);

  for (const el of result) {
    switch (align) {
      case "left": el.x = container.x; break;
      case "center": el.x = container.x + (container.width - el.width) / 2; break;
      case "right": el.x = container.x + container.width - el.width; break;
      case "top": el.y = container.y; break;
      case "middle": el.y = container.y + (container.height - el.height) / 2; break;
      case "bottom": el.y = container.y + container.height - el.height; break;
    }
  }
  return result;
}

export function distributeElements(elements: ElementBounds[], type: DistributeType): ElementBounds[] {
  if (elements.length < 3) return elements;
  const sorted = [...elements].sort((a, b) => type === "horizontal" ? a.x - b.x : a.y - b.y);
  const container = getBoundingBox(sorted);

  if (type === "horizontal") {
    const totalWidth = sorted.reduce((sum, el) => sum + el.width, 0);
    const gap = (container.width - totalWidth) / (sorted.length - 1);
    let currentX = container.x;
    for (const el of sorted) {
      el.x = currentX;
      currentX += el.width + gap;
    }
  } else {
    const totalHeight = sorted.reduce((sum, el) => sum + el.height, 0);
    const gap = (container.height - totalHeight) / (sorted.length - 1);
    let currentY = container.y;
    for (const el of sorted) {
      el.y = currentY;
      currentY += el.height + gap;
    }
  }
  return sorted;
}

export function getBoundingBox(elements: ElementBounds[]): { x: number; y: number; width: number; height: number } {
  if (elements.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const minX = Math.min(...elements.map(e => e.x));
  const minY = Math.min(...elements.map(e => e.y));
  const maxX = Math.max(...elements.map(e => e.x + e.width));
  const maxY = Math.max(...elements.map(e => e.y + e.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function findSnapGuides(
  dragged: ElementBounds,
  others: ElementBounds[],
  threshold: number = 5
): { guides: { type: "vertical" | "horizontal"; position: number }[]; snapX?: number; snapY?: number } {
  const guides: { type: "vertical" | "horizontal"; position: number }[] = [];
  let snapX: number | undefined;
  let snapY: number | undefined;

  for (const other of others) {
    if (other.id === dragged.id) continue;
    // Vertical edges
    for (const dEdge of [dragged.x, dragged.x + dragged.width]) {
      for (const oEdge of [other.x, other.x + other.width, other.x + other.width / 2]) {
        if (Math.abs(dEdge - oEdge) < threshold) {
          guides.push({ type: "vertical", position: oEdge });
          snapX = oEdge - (dEdge - dragged.x);
        }
      }
    }
    // Horizontal edges
    for (const dEdge of [dragged.y, dragged.y + dragged.height]) {
      for (const oEdge of [other.y, other.y + other.height, other.y + other.height / 2]) {
        if (Math.abs(dEdge - oEdge) < threshold) {
          guides.push({ type: "horizontal", position: oEdge });
          snapY = oEdge - (dEdge - dragged.y);
        }
      }
    }
  }
  return { guides, snapX, snapY };
}
