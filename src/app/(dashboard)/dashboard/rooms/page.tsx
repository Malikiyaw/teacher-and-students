"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Users, Clock, Copy, Check } from "lucide-react";

const activeRooms = [
  {
    id: "1",
    name: "Biology 101 — Period 3",
    code: "XKCD",
    students: 24,
    maxStudents: 30,
    status: "active",
    startedAt: "10 min ago",
  },
  {
    id: "2",
    name: "History 201 — Period 5",
    code: "ABCD",
    students: 28,
    maxStudents: 30,
    status: "scheduled",
    startsAt: "2:00 PM today",
  },
];

const pastRooms = [
  {
    id: "3",
    name: "Biology 101 — Period 3",
    code: "WXYZ",
    students: 22,
    date: "Yesterday",
  },
  {
    id: "4",
    name: "Math 301 — Period 2",
    code: "LMNO",
    students: 26,
    date: "2 days ago",
  },
];

export default function RoomsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">
            Rooms
          </h1>
          <p className="text-sm text-charcoal/45">
            Create a room and share the code with your students.
          </p>
        </div>
        <Link
          href="/dashboard/rooms/new"
          className="flex items-center gap-2 bg-sienna text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-sienna-dark transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          New Room
        </Link>
      </div>

      {/* Active Rooms */}
      {activeRooms.length > 0 && (
        <div className="mb-12">
          <h2 className="font-heading text-xl text-charcoal mb-5">
            Active & Upcoming
          </h2>
          <div className="space-y-4">
            {activeRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-medium text-charcoal">
                      {room.name}
                    </h3>
                    {room.status === "active" ? (
                      <span className="text-[11px] font-medium text-[#16A34A] bg-[#16A34A]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse" />
                        Live
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-charcoal/40 bg-charcoal/5 px-2.5 py-0.5 rounded-full">
                        Scheduled
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-charcoal/40">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {room.students}/{room.maxStudents} students
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {room.startedAt || room.startsAt}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyCode(room.code)}
                    className="flex items-center gap-2 bg-charcoal/5 border border-border rounded-lg px-3 py-2 text-sm font-mono font-medium text-charcoal hover:border-charcoal/20 transition-all duration-200"
                  >
                    {room.code}
                    {copied === room.code ? (
                      <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-charcoal/30" />
                    )}
                  </button>
                  {room.status === "active" && (
                    <Link
                      href={`/present/${room.id}`}
                      className="bg-sienna text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-sienna-dark transition-all duration-300"
                    >
                      Present
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Rooms */}
      <div>
        <h2 className="font-heading text-xl text-charcoal mb-5">
          Past Sessions
        </h2>
        <div className="bg-white border border-border rounded-xl divide-y divide-border">
          {pastRooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center gap-4 p-4 hover:bg-cream/50 transition-colors"
            >
              <div className="w-9 h-9 bg-charcoal/5 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-charcoal/30" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-charcoal truncate">
                  {room.name}
                </div>
                <div className="text-xs text-charcoal/40">
                  {room.students} students attended
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-charcoal/30 font-mono">
                  {room.code}
                </span>
                <span className="text-xs text-charcoal/30">{room.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
