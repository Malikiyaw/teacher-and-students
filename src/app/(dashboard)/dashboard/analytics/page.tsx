"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, Users, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPresentations: 0,
    totalRooms: 0,
    totalQuizzes: 0,
    totalPollVotes: 0,
  });
  const [topPresentations, setTopPresentations] = useState<Array<{
    title: string;
    updated_at: string;
  }>>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { count: presCount } = await supabase
        .from("presentations").select("*", { count: "exact", head: true }).eq("user_id", user.id);

      const { data: rooms } = await supabase
        .from("rooms").select("id").eq("teacher_id", user.id);
      const roomIds = rooms?.map((r: { id: string }) => r.id) || [];

      let quizCount = 0;
      let voteCount = 0;
      if (roomIds.length > 0) {
        const { count: qc } = await supabase
          .from("quizzes").select("*", { count: "exact", head: true }).in("room_id", roomIds);
        quizCount = qc || 0;

        const { count: vc } = await supabase
          .from("poll_votes").select("*", { count: "exact", head: true })
          .in("poll_id", await supabase.from("polls").select("id").in("room_id", roomIds).then((r: any) => r.data?.map((p: any) => p.id) || []));
        voteCount = vc || 0;
      }

      const { data: pres } = await supabase
        .from("presentations")
        .select("title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);

      setStats({
        totalPresentations: presCount || 0,
        totalRooms: roomIds.length,
        totalQuizzes: quizCount,
        totalPollVotes: voteCount,
      });

      if (pres) {
        setTopPresentations(pres as any);
      }
    };
    fetchData();
  }, [supabase, router]);

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Analytics</h1>
        <p className="text-sm text-charcoal/45">Track engagement across your classes.</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Presentations", value: stats.totalPresentations, icon: TrendingUp },
          { label: "Rooms Created", value: stats.totalRooms, icon: Users },
          { label: "Quizzes Made", value: stats.totalQuizzes, icon: BarChart3 },
          { label: "Poll Votes", value: stats.totalPollVotes, icon: Clock },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <stat.icon className="w-4 h-4 text-sienna" />
              <span className="text-xs text-charcoal/40 font-medium">{stat.label}</span>
            </div>
            <div className="font-heading text-3xl text-charcoal">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-heading text-xl text-charcoal">Your Presentations</h2>
        </div>
        {topPresentations.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-charcoal/40">No data yet</div>
        ) : (
          <div className="divide-y divide-border">
            {topPresentations.map((pres, i) => (
              <div key={pres.title} className="flex items-center gap-4 px-6 py-4">
                <span className="font-heading text-lg text-charcoal/15 w-8">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-charcoal truncate">{pres.title}</div>
                </div>
                <span className="text-xs text-charcoal/40">Updated {new Date(pres.updated_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
