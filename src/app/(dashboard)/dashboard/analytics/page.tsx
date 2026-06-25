"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Users, Clock } from "lucide-react";

const timeRanges = ["7 days", "30 days", "90 days", "All time"];

const engagementData = [
  { day: "Mon", polls: 78, quizzes: 65 },
  { day: "Tue", polls: 82, quizzes: 71 },
  { day: "Wed", polls: 65, quizzes: 58 },
  { day: "Thu", polls: 90, quizzes: 82 },
  { day: "Fri", polls: 73, quizzes: 69 },
];

const topPresentations = [
  { title: "Photosynthesis Deep Dive", views: 148, avgScore: "82%", engagement: "High" },
  { title: "World War II Timeline", views: 132, avgScore: "76%", engagement: "Medium" },
  { title: "Introduction to Algebra", views: 124, avgScore: "88%", engagement: "High" },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState("30 days");

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">
            Analytics
          </h1>
          <p className="text-sm text-charcoal/45">
            Track engagement across your classes.
          </p>
        </div>
        <div className="flex items-center bg-white border border-border rounded-lg p-1">
          {timeRanges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-200 ${
                range === r
                  ? "bg-charcoal/5 text-charcoal"
                  : "text-charcoal/40 hover:text-charcoal/60"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Total Views", value: "2,847", icon: TrendingUp, change: "+12%" },
          { label: "Avg. Quiz Score", value: "81%", icon: BarChart3, change: "+3%" },
          { label: "Total Students", value: "148", icon: Users, change: "+8" },
          { label: "Avg. Time Spent", value: "14m", icon: Clock, change: "+1m" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <stat.icon className="w-4 h-4 text-sienna" />
              <span className="text-xs text-charcoal/40 font-medium">{stat.label}</span>
            </div>
            <div className="font-heading text-3xl text-charcoal mb-1">{stat.value}</div>
            <div className="text-xs text-[#16A34A] font-medium">{stat.change} from last period</div>
          </div>
        ))}
      </div>

      {/* Engagement Chart */}
      <div className="bg-white border border-border rounded-xl p-6 mb-8">
        <h2 className="font-heading text-xl text-charcoal mb-6">
          Engagement Over Time
        </h2>
        <div className="space-y-3">
          {engagementData.map((d) => (
            <div key={d.day} className="flex items-center gap-4">
              <span className="text-xs text-charcoal/40 w-8 font-medium">{d.day}</span>
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1 h-6 bg-charcoal/3 rounded-md overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-sienna/70 rounded-md transition-all duration-500"
                    style={{ width: `${d.polls}%` }}
                  />
                </div>
                <div className="relative flex-1 h-6 bg-charcoal/3 rounded-md overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-charcoal/20 rounded-md transition-all duration-500"
                    style={{ width: `${d.quizzes}%` }}
                  />
                </div>
              </div>
              <span className="text-[11px] text-charcoal/30 w-16 text-right">
                {d.polls}% / {d.quizzes}%
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 mt-4 text-xs text-charcoal/40">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-sienna/70 rounded-sm" />
            Poll engagement
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-charcoal/20 rounded-sm" />
            Quiz completion
          </span>
        </div>
      </div>

      {/* Top Presentations */}
      <div className="bg-white border border-border rounded-xl">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-heading text-xl text-charcoal">
            Top Presentations
          </h2>
        </div>
        <div className="divide-y divide-border">
          {topPresentations.map((pres, i) => (
            <div key={pres.title} className="flex items-center gap-4 px-6 py-4">
              <span className="font-heading text-lg text-charcoal/15 w-8">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-charcoal truncate">
                  {pres.title}
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs text-charcoal/40">
                <span>{pres.views} views</span>
                <span>Avg: {pres.avgScore}</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-medium ${
                    pres.engagement === "High"
                      ? "bg-[#16A34A]/10 text-[#16A34A]"
                      : "bg-[#CA8A04]/10 text-[#CA8A04]"
                  }`}
                >
                  {pres.engagement}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
