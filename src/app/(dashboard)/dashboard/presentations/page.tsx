"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Presentation, Clock, Trash2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PresentationItem {
  id: string;
  title: string;
  subject: string | null;
  slides: unknown[];
  status: string;
  updated_at: string;
}

export default function PresentationsPage() {
  const router = useRouter();
  const [presentations, setPresentations] = useState<PresentationItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("presentations")
        .select("id, title, subject, slides, status, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (data) setPresentations(data);
      setLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this presentation?")) return;
    await supabase.from("presentations").delete().eq("id", id);
    setPresentations((prev) => prev.filter((p) => p.id !== id));
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return days <= 1 ? "Yesterday" : `${days} days ago`;
  };

  const filtered = search ? presentations.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || (p.subject || "").toLowerCase().includes(search.toLowerCase())) : presentations;

  const colors = ["bg-[#E8D5C4]", "bg-[#C4D5E0]", "bg-[#D5E0C4]", "bg-[#E0C4D5]", "bg-[#D5C4E0]", "bg-[#E0D5C4]"];

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Presentations</h1>
          <p className="text-sm text-charcoal/45">{presentations.length} presentation{presentations.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-white border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 outline-none focus:border-sienna/40 w-52 transition-all" />
          </div>
          <Link
            href="/editor/new"
            className="flex items-center gap-2 bg-sienna text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-sienna-dark transition-all duration-300"
          >
            <Plus className="w-4 h-4" /> New
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-sm text-charcoal/40">Loading...</div>
      ) : presentations.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-16 text-center">
          <Presentation className="w-12 h-12 text-charcoal/10 mx-auto mb-4" />
          <h3 className="font-heading text-xl text-charcoal mb-2">No presentations yet</h3>
          <p className="text-sm text-charcoal/40 mb-6">Create your first presentation to get started.</p>
          <Link href="/editor/new" className="inline-flex items-center gap-2 bg-sienna text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-sienna-dark transition-all">
            <Plus className="w-4 h-4" /> Create Presentation
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((pres, i) => (
            <div key={pres.id} className="group bg-white border border-border rounded-xl overflow-hidden hover:border-charcoal/15 transition-all duration-300">
              <Link href={`/editor/${pres.id}`} className="block">
                <div className={`${colors[i % colors.length]} h-36 flex items-center justify-center relative`}>
                  <Presentation className="w-10 h-10 text-charcoal/10" />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <div className="bg-white/90 backdrop-blur-sm text-[11px] font-medium text-charcoal/50 px-2.5 py-1 rounded-md">
                      {(pres.slides as unknown[]).length} slides
                    </div>
                  </div>
                  {pres.status === "draft" && (
                    <div className="absolute top-3 left-3 bg-charcoal/70 text-white text-[11px] font-medium px-2.5 py-1 rounded-md">Draft</div>
                  )}
                </div>
              </Link>
              <div className="p-4 flex items-center gap-2">
                <Link href={`/editor/${pres.id}`} className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-charcoal truncate group-hover:text-sienna transition-colors">{pres.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-charcoal/40">{pres.subject || "No subject"}</span>
                    <span className="text-xs text-charcoal/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {getTimeAgo(pres.updated_at)}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => handleDelete(pres.id)}
                  className="p-2 text-charcoal/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
