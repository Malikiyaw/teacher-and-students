"use client";

import { useState } from "react";
import { Play, List, Plus, Trash2, GripVertical } from "lucide-react";

export interface MotionPath {
  type: "linear" | "curve" | "zigzag" | "spiral" | "bounce";
  points: { x: number; y: number }[];
}

export function generateMotionPath(
  type: MotionPath["type"],
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): MotionPath {
  const dx = toX - fromX;
  const dy = toY - fromY;

  switch (type) {
    case "linear":
      return {
        type,
        points: [
          { x: fromX, y: fromY },
          { x: toX, y: toY },
        ],
      };

    case "curve":
      return {
        type,
        points: [
          { x: fromX, y: fromY },
          { x: fromX + dx * 0.25, y: fromY + dy * 0.1 },
          { x: fromX + dx * 0.75, y: fromY + dy * 0.9 },
          { x: toX, y: toY },
        ],
      };

    case "zigzag": {
      const segments = 4;
      const pts = [{ x: fromX, y: fromY }];
      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const zig = i % 2 === 0 ? 1 : -1;
        pts.push({
          x: fromX + dx * t,
          y: fromY + dy * t + zig * Math.abs(dy) * 0.2,
        });
      }
      return { type, points: pts };
    }

    case "spiral": {
      const pts = [{ x: fromX, y: fromY }];
      const steps = 20;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const angle = t * Math.PI * 4;
        const radius = Math.sqrt(dx * dx + dy * dy) * t * 0.3;
        pts.push({
          x: fromX + dx * t + Math.cos(angle) * radius,
          y: fromY + dy * t + Math.sin(angle) * radius,
        });
      }
      pts.push({ x: toX, y: toY });
      return { type, points: pts };
    }

    case "bounce": {
      const pts = [{ x: fromX, y: fromY }];
      const steps = 12;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const bounceY = Math.sin(t * Math.PI) * Math.abs(dy) * 0.6;
        pts.push({
          x: fromX + dx * t,
          y: toY - bounceY - (1 - t) * Math.abs(dy) * 0.3,
        });
      }
      return { type, points: pts };
    }
  }
}

export function getMotionPathCSS(path: MotionPath, duration: number): string {
  const pts = path.points;
  if (pts.length < 2) return "";
  const steps = pts
    .map((p, i) => `${Math.round((i / (pts.length - 1)) * 100)}%{transform:translate(${p.x}px,${p.y}px)}`)
    .join("");
  return `@keyframes motion-path-anim{${steps}}.motion-path{animation:motion-path-anim ${duration}ms both ease-out}`;
}

interface MotionPathEditorProps {
  onApply: (path: MotionPath, duration: number) => void;
}

const pathTypeLabels: { value: MotionPath["type"]; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "curve", label: "Curve" },
  { value: "zigzag", label: "Zigzag" },
  { value: "spiral", label: "Spiral" },
  { value: "bounce", label: "Bounce" },
];

export function MotionPathEditor({ onApply }: MotionPathEditorProps) {
  const [pathType, setPathType] = useState<MotionPath["type"]>("linear");
  const [duration, setDuration] = useState(1000);
  const [fromX, setFromX] = useState(0);
  const [fromY, setFromY] = useState(0);
  const [toX, setToX] = useState(200);
  const [toY, setToY] = useState(100);

  const currentPath = generateMotionPath(pathType, fromX, fromY, toX, toY);
  const svgW = 280;
  const svgH = 160;

  const scaleX = (x: number) => (x + 20) / 240 * svgW;
  const scaleY = (y: number) => (y + 20) / 160 * svgH;

  const pathD = currentPath.points
    .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.x)},${scaleY(p.y)}`)
    .join(" ");

  return (
    <div className="space-y-3 px-4 py-3">
      {/* Path type selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {pathTypeLabels.map((pt) => (
          <button key={pt.value} onClick={() => setPathType(pt.value)}
            className={`text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
              pathType === pt.value ? "bg-sienna text-white" : "text-white/50 hover:bg-white/5 hover:text-white/70"
            }`}>
            {pt.label}
          </button>
        ))}
      </div>

      {/* SVG Preview */}
      <div className="bg-[#1A1715] rounded-lg p-2 flex items-center justify-center">
        <svg width={svgW} height={svgH} className="overflow-visible">
          <rect x="0" y="0" width={svgW} height={svgH} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" rx="4" />
          {/* Start marker */}
          <circle cx={scaleX(fromX)} cy={scaleY(fromY)} r="4" fill="#22c55e" />
          <text x={scaleX(fromX) + 6} y={scaleY(fromY) + 3} fill="#22c55e" fontSize="8">Start</text>
          {/* End marker */}
          <circle cx={scaleX(toX)} cy={scaleY(toY)} r="4" fill="#ef4444" />
          <text x={scaleX(toX) + 6} y={scaleY(toY) + 3} fill="#ef4444" fontSize="8">End</text>
          {/* Path */}
          <path d={pathD} fill="none" stroke="#C4653A" strokeWidth="2" strokeLinecap="round" strokeDasharray="4,3" />
          {/* Points */}
          {currentPath.points.map((p, i) => (
            <circle key={i} cx={scaleX(p.x)} cy={scaleY(p.y)} r="2.5" fill="rgba(255,255,255,0.5)" />
          ))}
        </svg>
      </div>

      {/* From/To controls */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-white/30 block mb-0.5">From X</label>
          <input type="number" value={fromX} onChange={(e) => setFromX(Number(e.target.value))}
            className="w-full bg-[#1A1715] text-white/60 text-[10px] px-2 py-1 rounded border border-white/5 outline-none" />
        </div>
        <div>
          <label className="text-[9px] text-white/30 block mb-0.5">From Y</label>
          <input type="number" value={fromY} onChange={(e) => setFromY(Number(e.target.value))}
            className="w-full bg-[#1A1715] text-white/60 text-[10px] px-2 py-1 rounded border border-white/5 outline-none" />
        </div>
        <div>
          <label className="text-[9px] text-white/30 block mb-0.5">To X</label>
          <input type="number" value={toX} onChange={(e) => setToX(Number(e.target.value))}
            className="w-full bg-[#1A1715] text-white/60 text-[10px] px-2 py-1 rounded border border-white/5 outline-none" />
        </div>
        <div>
          <label className="text-[9px] text-white/30 block mb-0.5">To Y</label>
          <input type="number" value={toY} onChange={(e) => setToY(Number(e.target.value))}
            className="w-full bg-[#1A1715] text-white/60 text-[10px] px-2 py-1 rounded border border-white/5 outline-none" />
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-white/30 w-12">Duration</span>
        <input type="range" min="200" max="5000" step="100" value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="flex-1 accent-sienna h-1" />
        <span className="text-[10px] text-white/30 w-10">{duration}ms</span>
      </div>

      {/* Apply */}
      <button onClick={() => onApply(currentPath, duration)}
        className="w-full text-[11px] font-medium text-white bg-sienna hover:bg-sienna-dark px-3 py-1.5 rounded-lg transition-all">
        Apply Motion Path
      </button>
    </div>
  );
}
