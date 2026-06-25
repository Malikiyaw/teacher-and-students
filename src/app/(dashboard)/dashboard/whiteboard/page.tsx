"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Pen,
  Eraser,
  Square,
  Circle,
  Type,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Users,
  Save,
  FolderOpen,
} from "lucide-react";

type Tool = "pen" | "eraser" | "rect" | "circle" | "text";

interface Point {
  x: number;
  y: number;
}

interface DrawAction {
  tool: Tool;
  points: Point[];
  color: string;
  width: number;
  text?: string;
  textPos?: Point;
  shapeStart?: Point;
  shapeEnd?: Point;
}

const colors = ["#1C1917", "#C4653A", "#B91C1C", "#16A34A", "#2563EB", "#CA8A04", "#FFFFFF"];
const widths = [2, 4, 8, 12];

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#1C1917");
  const [lineWidth, setLineWidth] = useState(4);
  const [drawing, setDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [redoStack, setRedoStack] = useState<DrawAction[]>([]);
  const [shapeStart, setShapeStart] = useState<Point | null>(null);
  const [whiteboardId, setWhiteboardId] = useState<string | null>(null);
  const [whiteboardName, setWhiteboardName] = useState("Untitled Whiteboard");
  const [savedWhiteboards, setSavedWhiteboards] = useState<
    { id: string; name: string; created_at: string }[]
  >([]);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const loadMenuRef = useRef<HTMLDivElement>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#F0EDE8";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    actions.forEach((action) => {
      ctx.strokeStyle = action.color;
      ctx.lineWidth = action.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (action.tool === "pen" || action.tool === "eraser") {
        if (action.tool === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
        }
        ctx.beginPath();
        action.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      } else if (action.tool === "rect" && action.shapeStart && action.shapeEnd) {
        ctx.strokeRect(
          action.shapeStart.x,
          action.shapeStart.y,
          action.shapeEnd.x - action.shapeStart.x,
          action.shapeEnd.y - action.shapeStart.y
        );
      } else if (action.tool === "circle" && action.shapeStart && action.shapeEnd) {
        const rx = Math.abs(action.shapeEnd.x - action.shapeStart.x) / 2;
        const ry = Math.abs(action.shapeEnd.y - action.shapeStart.y) / 2;
        const cx = action.shapeStart.x + (action.shapeEnd.x - action.shapeStart.x) / 2;
        const cy = action.shapeStart.y + (action.shapeEnd.y - action.shapeStart.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (action.tool === "text" && action.textPos && action.text) {
        ctx.fillStyle = action.color;
        ctx.font = `${action.width * 4}px var(--font-heading)`;
        ctx.fillText(action.text, action.textPos.x, action.textPos.y);
      }
    });
  }, [actions]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    setDrawing(true);
    if (tool === "pen" || tool === "eraser") {
      setCurrentPoints([pos]);
    } else {
      setShapeStart(pos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const pos = getPos(e);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    if (tool === "pen" || tool === "eraser") {
      setCurrentPoints((prev) => [...prev, pos]);

      ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
      ctx.lineWidth = tool === "eraser" ? lineWidth * 3 : lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const pts = [...currentPoints, pos];
      if (pts.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    } else if (shapeStart) {
      redraw();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      if (tool === "rect") {
        ctx.strokeRect(
          shapeStart.x,
          shapeStart.y,
          pos.x - shapeStart.x,
          pos.y - shapeStart.y
        );
      } else if (tool === "circle") {
        const rx = Math.abs(pos.x - shapeStart.x) / 2;
        const ry = Math.abs(pos.y - shapeStart.y) / 2;
        const cx = shapeStart.x + (pos.x - shapeStart.x) / 2;
        const cy = shapeStart.y + (pos.y - shapeStart.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    setDrawing(false);
    const pos = getPos(e);

    if (tool === "pen" || tool === "eraser") {
      const newAction: DrawAction = {
        tool,
        points: [...currentPoints, pos],
        color,
        width: tool === "eraser" ? lineWidth * 3 : lineWidth,
      };
      setActions((prev) => [...prev, newAction]);
      setRedoStack([]);
      setCurrentPoints([]);
    } else if (shapeStart) {
      const newAction: DrawAction = {
        tool,
        points: [],
        color,
        width: lineWidth,
        shapeStart,
        shapeEnd: pos,
      };
      setActions((prev) => [...prev, newAction]);
      setRedoStack([]);
      setShapeStart(null);
    }
  };

  const undo = () => {
    if (actions.length === 0) return;
    const last = actions[actions.length - 1];
    setActions((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setActions((prev) => [...prev, last]);
  };

  const clearAll = () => {
    setActions([]);
    setRedoStack([]);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (loadMenuRef.current && !loadMenuRef.current.contains(e.target as Node)) {
        setShowLoadMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchWhiteboards = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("whiteboards")
      .select("id, name, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSavedWhiteboards(data ?? []);
  };

  const saveWhiteboard = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setIsSaving(true);
    try {
      if (whiteboardId) {
        await supabase
          .from("whiteboards")
          .update({ name: whiteboardName, actions })
          .eq("id", whiteboardId);
      } else {
        const { data } = await supabase
          .from("whiteboards")
          .insert({ user_id: user.id, name: whiteboardName, actions })
          .select("id")
          .single();
        if (data) setWhiteboardId(data.id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const loadWhiteboard = async (id: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("whiteboards")
      .select("id, name, actions")
      .eq("id", id)
      .single();
    if (data) {
      setWhiteboardId(data.id);
      setWhiteboardName(data.name);
      setActions(data.actions ?? []);
      setRedoStack([]);
      setShowLoadMenu(false);
    }
  };

  const newWhiteboard = () => {
    setWhiteboardId(null);
    setWhiteboardName("Untitled Whiteboard");
    setActions([]);
    setRedoStack([]);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="h-screen flex flex-col bg-charcoal overflow-hidden">
      {/* Top bar */}
      <div className="h-12 bg-[#2A2523] border-b border-white/5 flex items-center px-4 shrink-0">
        <Link
          href="/dashboard"
          className="p-2 text-white/50 hover:text-white/80 transition-colors mr-3"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-sm text-white/80 font-medium">Whiteboard</span>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            className="p-2 text-white/40 hover:text-white/70 transition-colors"
            disabled={actions.length === 0}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            className="p-2 text-white/40 hover:text-white/70 transition-colors"
            disabled={redoStack.length === 0}
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button
            onClick={clearAll}
            className="p-2 text-white/40 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={download}
            className="p-2 text-white/40 hover:text-white/70 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button
            onClick={newWhiteboard}
            className="px-2.5 py-1 text-xs text-white/60 hover:text-white/80 hover:bg-white/5 rounded transition-colors"
          >
            New
          </button>
          <div className="relative" ref={loadMenuRef}>
            <button
              onClick={() => { fetchWhiteboards(); setShowLoadMenu((v) => !v); }}
              className="p-2 text-white/40 hover:text-white/70 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
            {showLoadMenu && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-[#2A2523] border border-white/10 rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto">
                {savedWhiteboards.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-white/40">No saved whiteboards</div>
                ) : (
                  savedWhiteboards.map((wb) => (
                    <button
                      key={wb.id}
                      onClick={() => loadWhiteboard(wb.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                        wb.id === whiteboardId ? "text-sienna" : "text-white/70"
                      }`}
                    >
                      <div className="font-medium truncate">{wb.name}</div>
                      <div className="text-xs text-white/30 mt-0.5">
                        {new Date(wb.created_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <input
            type="text"
            value={whiteboardName}
            onChange={(e) => setWhiteboardName(e.target.value)}
            className="w-44 px-2 py-1 text-xs bg-transparent border border-white/10 rounded text-white/70 focus:border-white/20 focus:outline-none"
          />
          <button
            onClick={saveWhiteboard}
            disabled={isSaving}
            className="p-2 text-white/40 hover:text-sienna transition-colors disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Tools sidebar */}
        <div className="w-14 bg-[#231F1D] border-r border-white/5 flex flex-col items-center py-3 gap-1 shrink-0">
          {[
            { id: "pen" as Tool, icon: Pen, label: "Pen" },
            { id: "eraser" as Tool, icon: Eraser, label: "Eraser" },
            { id: "rect" as Tool, icon: Square, label: "Rectangle" },
            { id: "circle" as Tool, icon: Circle, label: "Circle" },
            { id: "text" as Tool, icon: Type, label: "Text" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`p-2.5 rounded-lg transition-all ${
                tool === t.id
                  ? "bg-sienna text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
              title={t.label}
            >
              <t.icon className="w-4 h-4" />
            </button>
          ))}
          <div className="w-8 h-px bg-white/10 my-2" />
          <div className="space-y-1.5">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  color === c ? "border-sienna scale-110" : "border-white/10"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="w-8 h-px bg-white/10 my-2" />
          <div className="space-y-1">
            {widths.map((w) => (
              <button
                key={w}
                onClick={() => setLineWidth(w)}
                className={`flex items-center justify-center w-8 h-6 rounded transition-all ${
                  lineWidth === w ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <div
                  className="rounded-full bg-white/60"
                  style={{ width: w + 2, height: w + 2 }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-[#1A1715] p-4">
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="max-w-full max-h-full shadow-2xl shadow-black/30 rounded cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setDrawing(false)}
          />
        </div>
      </div>
    </div>
  );
}
