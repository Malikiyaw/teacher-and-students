"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Clock,
  Copy,
  Check,
  Settings,
  Presentation,
} from "lucide-react";

export default function NewRoomPage() {
  const [roomName, setRoomName] = useState("");
  const [maxStudents, setMaxStudents] = useState(30);
  const [selectedPresentation, setSelectedPresentation] = useState<string | null>(null);
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [copied, setCopied] = useState(false);

  const presentations = [
    { id: "1", title: "Photosynthesis Deep Dive", slides: 18 },
    { id: "2", title: "World War II Timeline", slides: 24 },
    { id: "3", title: "Introduction to Algebra", slides: 12 },
  ];

  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setRoomCode(code);
    setRoomCreated(true);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (roomCreated) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 bg-sienna/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8 text-sienna" />
        </div>
        <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-2">
          Room is Live
        </h1>
        <p className="text-sm text-charcoal/45 mb-8">
          Share this code with your students to join.
        </p>

        <div className="bg-white border-2 border-sienna rounded-2xl p-8 mb-8">
          <span className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-3 block">
            Room Code
          </span>
          <div className="font-heading text-5xl text-charcoal tracking-[0.3em] mb-4">
            {roomCode}
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-2 text-sm text-sienna hover:text-sienna-dark transition-colors mx-auto"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy code
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2 text-sm text-charcoal/40">
            <span className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse" />
            Waiting for students...
          </div>
          <span className="text-charcoal/15">|</span>
          <span className="text-sm text-charcoal/40">0/{maxStudents} connected</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/present/${roomCode}`}
            className="bg-sienna text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-sienna-dark transition-all duration-300"
          >
            Start Presenting
          </Link>
          <button
            onClick={() => setRoomCreated(false)}
            className="text-sm text-charcoal/40 hover:text-charcoal/60 transition-colors"
          >
            Configure again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/rooms"
          className="p-2 text-charcoal/40 hover:text-charcoal/60 hover:bg-charcoal/5 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-heading text-3xl text-charcoal tracking-tight">
          Create Room
        </h1>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-border rounded-xl p-6">
          <label className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-2 block">
            Room Name
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="e.g. Biology 101 — Period 3"
            className="w-full bg-cream/50 border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/25 focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20 outline-none transition-all"
          />
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <label className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-3 block">
            Select Presentation
          </label>
          <div className="space-y-2">
            {presentations.map((pres) => (
              <button
                key={pres.id}
                onClick={() => setSelectedPresentation(pres.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all ${
                  selectedPresentation === pres.id
                    ? "border-sienna bg-sienna/5"
                    : "border-border hover:border-charcoal/20"
                }`}
              >
                <Presentation className="w-5 h-5 text-charcoal/30 shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-charcoal">
                    {pres.title}
                  </div>
                  <div className="text-xs text-charcoal/40">
                    {pres.slides} slides
                  </div>
                </div>
                {selectedPresentation === pres.id && (
                  <Check className="w-4 h-4 text-sienna" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-medium text-charcoal/40 uppercase tracking-wider">
              Max Students
            </label>
            <span className="text-sm font-medium text-charcoal">
              {maxStudents}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={maxStudents}
            onChange={(e) => setMaxStudents(Number(e.target.value))}
            className="w-full accent-sienna"
          />
          <div className="flex justify-between text-[10px] text-charcoal/30 mt-1">
            <span>5</span>
            <span>100</span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-4 h-4 text-charcoal/30" />
            <label className="text-xs font-medium text-charcoal/40 uppercase tracking-wider">
              Room Settings
            </label>
          </div>
          <div className="space-y-3">
            {[
              { label: "Enable student chat", default: true },
              { label: "Allow anonymous responses", default: false },
              { label: "Show leaderboard during quizzes", default: true },
              { label: "Auto-save responses", default: true },
            ].map((setting) => (
              <label
                key={setting.label}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="text-sm text-charcoal/60">{setting.label}</span>
                <div
                  className={`w-10 h-5.5 rounded-full transition-all duration-300 relative ${
                    setting.default ? "bg-sienna" : "bg-charcoal/15"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-all duration-300 ${
                      setting.default ? "left-5" : "left-0.5"
                    }`}
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={createRoom}
          disabled={!roomName || !selectedPresentation}
          className="w-full bg-sienna text-white text-sm font-medium py-3.5 rounded-xl hover:bg-sienna-dark transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Create Room
        </button>
      </div>
    </div>
  );
}
