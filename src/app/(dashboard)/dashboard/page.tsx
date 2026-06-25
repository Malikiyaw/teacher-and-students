import Link from "next/link";
import {
  Plus,
  Presentation,
  Users,
  Clock,
  ArrowRight,
  BarChart3,
} from "lucide-react";

const recentPresentations = [
  {
    id: "1",
    title: "Photosynthesis Deep Dive",
    subject: "Biology 101",
    slides: 18,
    lastEdited: "2 hours ago",
    thumbnail: "bg-[#E8D5C4]",
  },
  {
    id: "2",
    title: "World War II Timeline",
    subject: "History 201",
    slides: 24,
    lastEdited: "Yesterday",
    thumbnail: "bg-[#C4D5E0]",
  },
  {
    id: "3",
    title: "Introduction to Algebra",
    subject: "Math 301",
    slides: 12,
    lastEdited: "3 days ago",
    thumbnail: "bg-[#D5E0C4]",
  },
  {
    id: "4",
    title: "Shakespeare's Hamlet Act III",
    subject: "English 102",
    slides: 32,
    lastEdited: "Last week",
    thumbnail: "bg-[#E0C4D5]",
  },
];

const stats = [
  { label: "Total Presentations", value: "12", icon: Presentation, change: "+2 this week" },
  { label: "Students Reached", value: "148", icon: Users, change: "Across 4 classes" },
  { label: "Avg. Engagement", value: "73%", icon: BarChart3, change: "+5% from last month" },
];

export default function TeacherDashboard() {
  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">
          Good afternoon, Jane
        </h1>
        <p className="text-sm text-charcoal/45">
          You have 2 classes today. Your Biology presentation is ready to go.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-border rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-sienna/8 rounded-lg flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-sienna" />
              </div>
              <span className="text-xs text-charcoal/40 font-medium">
                {stat.label}
              </span>
            </div>
            <div className="font-heading text-3xl text-charcoal mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-charcoal/40">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="font-heading text-xl text-charcoal mb-5">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            href="/editor/new"
            className="flex items-center gap-4 bg-sienna text-white p-5 rounded-xl hover:bg-sienna-dark transition-all duration-300 cubic-bezier(0.25, 0.8, 0.25, 1) hover:shadow-lg hover:shadow-sienna/15 group"
          >
            <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium">New Presentation</div>
              <div className="text-xs text-white/60">Start from scratch</div>
            </div>
          </Link>
          <Link
            href="/dashboard/rooms/new"
            className="flex items-center gap-4 bg-white border border-border p-5 rounded-xl hover:border-charcoal/20 transition-all duration-300 group"
          >
            <div className="w-10 h-10 bg-charcoal/5 rounded-lg flex items-center justify-center group-hover:bg-charcoal/8 transition-colors">
              <Users className="w-5 h-5 text-charcoal/50" />
            </div>
            <div>
              <div className="text-sm font-medium text-charcoal">
                Start a Room
              </div>
              <div className="text-xs text-charcoal/40">
                Students join with code
              </div>
            </div>
          </Link>
          <Link
            href="/templates"
            className="flex items-center gap-4 bg-white border border-border p-5 rounded-xl hover:border-charcoal/20 transition-all duration-300 group"
          >
            <div className="w-10 h-10 bg-charcoal/5 rounded-lg flex items-center justify-center group-hover:bg-charcoal/8 transition-colors">
              <Presentation className="w-5 h-5 text-charcoal/50" />
            </div>
            <div>
              <div className="text-sm font-medium text-charcoal">
                Browse Templates
              </div>
              <div className="text-xs text-charcoal/40">12 free templates</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Presentations */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl text-charcoal">
            Recent Presentations
          </h2>
          <Link
            href="/dashboard/presentations"
            className="text-xs font-medium text-sienna hover:text-sienna-dark transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {recentPresentations.map((pres) => (
            <Link
              key={pres.id}
              href={`/editor/${pres.id}`}
              className="group bg-white border border-border rounded-xl overflow-hidden hover:border-charcoal/15 transition-all duration-300"
            >
              <div
                className={`${pres.thumbnail} h-32 flex items-center justify-center relative`}
              >
                <Presentation className="w-8 h-8 text-charcoal/10" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-charcoal/60 px-2.5 py-1 rounded-md">
                  {pres.slides} slides
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-charcoal mb-1 group-hover:text-sienna transition-colors">
                  {pres.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-charcoal/40">
                    {pres.subject}
                  </span>
                  <span className="text-xs text-charcoal/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {pres.lastEdited}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
