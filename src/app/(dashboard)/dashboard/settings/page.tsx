"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Bell, Lock, Trash2, Camera, Check, Loader2, CreditCard, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ full_name: "", email: "", school: "", role: "teacher", plan: "starter" });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, school, role, plan")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
    };
    fetchProfile();
  }, [supabase, router]);

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        school: profile.school,
        role: profile.role as "teacher" | "student",
      })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
    setUpgrading(false);
  };

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">Settings</h1>
      <p className="text-sm text-charcoal/45 mb-10">Manage your account and preferences.</p>

      <div className="space-y-8">
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-4 h-4 text-sienna" />
            <h2 className="font-heading text-lg text-charcoal">Profile</h2>
          </div>
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-charcoal/8 rounded-full flex items-center justify-center text-xl font-heading text-charcoal">{initials}</div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-sienna text-white rounded-full flex items-center justify-center hover:bg-sienna-dark transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <div className="text-sm font-medium text-charcoal">{profile.full_name || "Your Name"}</div>
              <div className="text-xs text-charcoal/40">{profile.email}</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-charcoal/50 mb-1.5 block">Full name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full bg-cream/50 border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:border-sienna/40 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal/50 mb-1.5 block">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full bg-cream/50 border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal/50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal/50 mb-1.5 block">School</label>
              <input
                type="text"
                value={profile.school || ""}
                onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                placeholder="Lincoln High School"
                className="w-full bg-cream/50 border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/25 focus:border-sienna/40 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal/50 mb-1.5 block">Role</label>
              <select
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="w-full bg-cream/50 border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:border-sienna/40 outline-none transition-colors"
              >
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-4 h-4 text-sienna" />
            <h2 className="font-heading text-lg text-charcoal">Billing</h2>
          </div>
          <div className="flex items-center justify-between p-4 bg-cream/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${profile.plan === "pro" ? "bg-sienna/10" : "bg-charcoal/5"}`}>
                <Zap className={`w-5 h-5 ${profile.plan === "pro" ? "text-sienna" : "text-charcoal/40"}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-charcoal">{profile.plan === "pro" ? "Pro Plan" : "Starter Plan"}</div>
                <div className="text-xs text-charcoal/40">{profile.plan === "pro" ? "$8/month \u2022 Unlimited everything" : "5 presentations \u2022 10 students/room"}</div>
              </div>
            </div>
            {profile.plan !== "pro" ? (
              <button onClick={handleUpgrade} disabled={upgrading}
                className="bg-sienna text-white text-xs font-medium px-5 py-2.5 rounded-lg hover:bg-sienna-dark transition-all disabled:opacity-50 flex items-center gap-2">
                {upgrading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Upgrade to Pro
              </button>
            ) : (
              <span className="text-xs text-[#16A34A] font-medium bg-[#16A34A]/10 px-3 py-1.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Active</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-[#16A34A]">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="bg-charcoal text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-charcoal-light transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
