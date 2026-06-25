"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Presentation,
  Users,
  Clock,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PresentationItem {
  id: string;
  title: string;
  subject: string | null;
  slides: unknown[];
  updated_at: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [presentations, setPresentations] = useState<PresentationItem[]>([]);
  const [stats, setStats] = useState({
    totalPresentations: 0,
    totalRooms: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: p } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (p) setProfile(p);

      const { data: pres } = await supabase
        .from("presentations")
        .select("id, title, subject, slides, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(4);
      if (pres) {
        setPresentations(pres);
        setStats((s) => ({ ...s, totalPresentations: pres.length }));
      }

      const { count } = await supabase
        .from("rooms")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", user.id);
      setStats((s) => ({ ...s, totalRooms: count || 0 }));
    };
    fetchData();
  }, [supabase, router]);

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-sm text-charcoal/45">
          You have {stats.totalRooms} room{stats.totalRooms !== 1 ? "s" : ""} and {stats.totalPresentations} presentation{stats.totalPresentations !== 1 ? "s" : ""}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-sienna/8 rounded-lg flex items-center justify-center">
              <Presentation className="w-4 h-4 text-sienna" />
            </div>
            <span className="text-xs text-charcoal/40 font-medium">Presentations</span>
          </div>
          <div className="font-heading text-3xl text-charcoal">
            {stats.totalPresentations}
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-sienna/8 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-sienna" />
            </div>
            <span className="text-xs text-charcoal/40 font-medium">Rooms Created</span>
          </div>
          <div className="font-heading text-3xl text-charcoal">
            {stats.totalRooms}
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-sienna/8 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-sienna" />
            </div>
            <span className="text-xs text-charcoal/40 font-medium">Plan</span>
          </div>
          <div className="font-heading text-3xl text-charcoal">Starter</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="font-heading text-xl text-charcoal mb-5">Quick Actions</h2>
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
              <div className="text-sm font-medium text-charcoal">Start a Room</div>
              <div className="text-xs text-charcoal/40">Students join with code</div>
            </div>
          </Link>
          <Link
            href="/dashboard/templates"
            className="flex items-center gap-4 bg-white border border-border p-5 rounded-xl hover:border-charcoal/20 transition-all duration-300 group"
          >
            <div className="w-10 h-10 bg-charcoal/5 rounded-lg flex items-center justify-center group-hover:bg-charcoal/8 transition-colors">
              <Presentation className="w-5 h-5 text-charcoal/50" />
            </div>
            <div>
              <div className="text-sm font-medium text-charcoal">Browse Templates</div>
              <div className="text-xs text-charcoal/40">12 free templates</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Presentations */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl text-charcoal">Recent Presentations</h2>
          <Link
            href="/dashboard/presentations"
            className="text-xs font-medium text-sienna hover:text-sienna-dark transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {presentations.length === 0 ? (
          <div className="bg-white border border-border rounded-xl p-10 text-center">
            <Presentation className="w-10 h-10 text-charcoal/15 mx-auto mb-3" />
            <p className="text-sm text-charcoal/40 mb-4">No presentations yet</p>
            <Link
              href="/editor/new"
              className="text-sm font-medium text-sienna hover:text-sienna-dark transition-colors"
            >
              Create your first presentation →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {presentations.map((pres) => (
              <Link
                key={pres.id}
                href={`/editor/${pres.id}`}
                className="group bg-white border border-border rounded-xl overflow-hidden hover:border-charcoal/15 transition-all duration-300"
              >
                <div className="bg-[#E8D5C4] h-32 flex items-center justify-center relative">
                  <Presentation className="w-8 h-8 text-charcoal/10" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-charcoal/60 px-2.5 py-1 rounded-md">
                    {(pres.slides as unknown[]).length || 0} slides
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-charcoal mb-1 group-hover:text-sienna transition-colors">
                    {pres.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-charcoal/40">{pres.subject || "No subject"}</span>
                    <span className="text-xs text-charcoal/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(pres.updated_at)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
