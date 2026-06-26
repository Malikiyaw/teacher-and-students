"use client";

import { useState, useRef, useEffect } from "react";
import { hexToHSL, hslToHex, isValidHex } from "@/lib/editor/color";

const presets = [
  "#1C1917", "#C4653A", "#FFFFFF", "#F0EDE8",
  "#B91C1C", "#16A34A", "#2563EB", "#CA8A04",
  "#7C3AED", "#EC4899", "#06B6D4", "#84CC16",
  "#000000", "#4B5563", "#9CA3AF", "#E5E7EB",
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [hex, setHex] = useState(value || "#1C1917");
  const [hsl, setHSL] = useState(hexToHSL(hex));
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const updateColor = (newHex: string) => {
    setHex(newHex);
    setHSL(hexToHSL(newHex));
    onChange(newHex);
  };

  const handleHSLChange = (key: "h" | "s" | "l", val: number) => {
    const newHSL = { ...hsl, [key]: key === "h" ? Math.max(0, Math.min(360, val)) : Math.max(0, Math.min(100, val)) };
    setHSL(newHSL);
    const newHex = hslToHex(newHSL.h, newHSL.s, newHSL.l);
    setHex(newHex);
    onChange(newHex);
  };

  const handleHexInput = (val: string) => {
    setHex(val);
    if (isValidHex(val)) {
      setHSL(hexToHSL(val));
      onChange(val);
    }
  };

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex items-center gap-2">
        <button onClick={() => setShowPicker(!showPicker)}
          className="w-8 h-8 rounded-lg border border-white/20 hover:scale-110 transition-transform shrink-0"
          style={{ background: hex }} />
        <input value={hex} onChange={(e) => handleHexInput(e.target.value)}
          className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/60 font-mono outline-none" />
      </div>
      {showPicker && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-[#2A2523] border border-white/10 rounded-xl shadow-xl z-50 w-56">
          <div className="mb-3">
            <div className="relative h-24 rounded-lg mb-2 overflow-hidden"
              style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsl.h}, 100%, 50%))` }}>
              <div className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md"
                style={{ left: `${hsl.s}%`, bottom: `${hsl.l}%`, transform: "translate(-50%, 50%)" }} />
            </div>
            <input type="range" min="0" max="360" value={hsl.h}
              onChange={(e) => handleHSLChange("h", parseInt(e.target.value))}
              className="w-full accent-sienna" />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-[10px] text-white/30 block">H</label>
              <input type="number" min="0" max="360" value={hsl.h}
                onChange={(e) => handleHSLChange("h", parseInt(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/60 outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-white/30 block">S</label>
              <input type="number" min="0" max="100" value={hsl.s}
                onChange={(e) => handleHSLChange("s", parseInt(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/60 outline-none" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {presets.map((c) => (
              <button key={c} onClick={() => updateColor(c)}
                className={`w-6 h-6 rounded border border-white/10 hover:scale-110 transition-transform ${c === hex ? "ring-2 ring-sienna" : ""}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
