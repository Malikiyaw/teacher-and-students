"use client";

import Link from "next/link";
import { useState } from "react";
import { Presentation, Users, BarChart3, Clock, ArrowRight } from "lucide-react";

const enrolledClasses = [
  {
    id: "1",
    teacher: "Ms. Rodriguez",
    name: "Biology 101",
    subject: "Science",
    nextClass: "Today, 2:00 PM",
    color: "bg-[#E8D5C4]",
  },
  {
    id: "2",
    teacher: "Mr. Chen",
    name: "History 201",
    subject: "History",
    nextClass: "Tomorrow, 9:00 AM",
    color: "bg-[#C4D5E0]",
  },
  {
    id: "3",
    teacher: "Mrs. Patel",
    name: "Math 301",
    subject: "Mathematics",
    nextClass: "Wednesday, 11:00 AM",
    color: "bg-[#D5E0C4]",
  },
];

const recentActivity = [
  { type: "quiz", title: "Biology Quiz: Cell Structure", score: "8/10", date: "Yesterday" },
  { type: "poll", title: "History: Most Influential Leader?", voted: "Abraham Lincoln", date: "2 days ago" },
  { type: "quiz", title: "Math: Linear Equations", score: "9/10", date: "Last week" },
];

export default function StudentDashboard() {
  const [joinCode, setJoinCode] = useState("");

  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">
          Welcome back, Alex
        </h1>
        <p className="text-sm text-charcoal/45">
          You have 1 class today. Biology at 2:00 PM.
        </p>
      </div>

      {/* Join Room */}
      <div className="mb-12">
        <h2 className="font-heading text-xl text-charcoal mb-5">
          Join a Class
        </h2>
        <div className="flex gap-3 max-w-md">
          <input
            type="text"
            placeholder="Enter room code (e.g. ABCD)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20 transition-all duration-300 tracking-widest font-medium text-center text-lg"
            maxLength={6}
          />
          <button className="bg-sienna text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-sienna-dark transition-all duration-300 cubic-bezier(0.25, 0.8, 0.25, 1) flex items-center gap-2">
            <Users className="w-4 h-4" />
            Join
          </button>
        </div>
      </div>

      {/* Enrolled Classes */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl text-charcoal">
            My Classes
          </h2>
          <button className="text-xs font-medium text-sienna hover:text-sienna-dark transition-colors flex items-center gap-1">
            Browse Catalog <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolledClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white border border-border rounded-xl p-5 hover:border-charcoal/15 transition-all duration-300"
            >
              <div className={`${cls.color} w-full h-2 rounded-full mb-4`} />
              <h3 className="text-sm font-medium text-charcoal mb-1">
                {cls.name}
              </h3>
              <p className="text-xs text-charcoal/40 mb-4">{cls.teacher}</p>
              <div className="flex items-center gap-2 text-xs text-charcoal/40">
                <Clock className="w-3 h-3" />
                {cls.nextClass}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="font-heading text-xl text-charcoal mb-5">
          Recent Activity
        </h2>
        <div className="bg-white border border-border rounded-xl divide-y divide-border">
          {recentActivity.map((activity, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="w-9 h-9 bg-sienna/8 rounded-lg flex items-center justify-center shrink-0">
                {activity.type === "quiz" ? (
                  <BarChart3 className="w-4 h-4 text-sienna" />
                ) : (
                  <Presentation className="w-4 h-4 text-sienna" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-charcoal truncate">
                  {activity.title}
                </div>
                <div className="text-xs text-charcoal/40">
                  {activity.type === "quiz"
                    ? `Score: ${activity.score}`
                    : `Your vote: ${activity.voted}`}
                </div>
              </div>
              <div className="text-xs text-charcoal/30 shrink-0">
                {activity.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
