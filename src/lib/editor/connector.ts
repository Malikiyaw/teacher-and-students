export interface ConnectorEnd {
  elementId: string;
  anchor: "top" | "right" | "bottom" | "left";
}

export interface ConnectorDef {
  id: string;
  start: ConnectorEnd;
  end: ConnectorEnd;
  color: string;
  strokeWidth: number;
  strokeDash?: string;
}

interface ElementRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function getAnchorPoint(el: ElementRect, anchor: "top" | "right" | "bottom" | "left"): { x: number; y: number } {
  switch (anchor) {
    case "top": return { x: el.x + el.width / 2, y: el.y };
    case "right": return { x: el.x + el.width, y: el.y + el.height / 2 };
    case "bottom": return { x: el.x + el.width / 2, y: el.y + el.height };
    case "left": return { x: el.x, y: el.y + el.height / 2 };
  }
}

function autoAnchor(el: ElementRect, other: ElementRect): "top" | "right" | "bottom" | "left" {
  const ex = el.x + el.width / 2;
  const ey = el.y + el.height / 2;
  const ox = other.x + other.width / 2;
  const oy = other.y + other.height / 2;
  const dx = ox - ex;
  const dy = oy - ey;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "bottom" : "top";
}

export function renderConnectorSVG(
  startEl: ElementRect,
  endEl: ElementRect,
  color: string,
  strokeWidth: number,
  strokeDash?: string
): string {
  const startAnchor = autoAnchor(startEl, endEl);
  const endAnchor = autoAnchor(endEl, startEl);
  const startPt = getAnchorPoint(startEl, startAnchor);
  const endPt = getAnchorPoint(endEl, endAnchor);

  // Compute control points for a cubic bezier curve
  const dx = Math.abs(endPt.x - startPt.x);
  const dy = Math.abs(endPt.y - startPt.y);
  const cpOffset = Math.max(30, Math.min(dx, dy) * 0.5);

  let cp1x: number, cp1y: number, cp2x: number, cp2y: number;

  if (startAnchor === "right" || startAnchor === "left") {
    cp1x = startPt.x + (startAnchor === "right" ? cpOffset : -cpOffset);
    cp1y = startPt.y;
    cp2x = endPt.x + (endAnchor === "right" ? cpOffset : -cpOffset);
    cp2y = endPt.y;
  } else {
    cp1x = startPt.x;
    cp1y = startPt.y + (startAnchor === "bottom" ? cpOffset : -cpOffset);
    cp2x = endPt.x;
    cp2y = endPt.y + (endAnchor === "bottom" ? cpOffset : -cpOffset);
  }

  const d = `M${startPt.x},${startPt.y} C${cp1x},${cp1y} ${cp2x},${cp2y} ${endPt.x},${endPt.y}`;

  return `<svg width="100%" height="100%" style="position:absolute;inset:0;pointer-events:none;overflow:visible" xmlns="http://www.w3.org/2000/svg">
    <path d="${d}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash || "none"}" stroke-linecap="round" />
    <circle cx="${endPt.x}" cy="${endPt.y}" r="4" fill="${color}" />
  </svg>`;
}
