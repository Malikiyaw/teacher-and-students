"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Presentation,
  LayoutDashboard,
  FolderOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  PenTool,
  Bell,
  BookOpen,
  UserSearch,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/presentations", label: "Presentations", icon: Presentation },
  { href: "/dashboard/rooms", label: "Rooms", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/gradebook", label: "Gradebook", icon: BookOpen },
  { href: "/dashboard/students", label: "Students", icon: UserSearch },
  { href: "/dashboard/files", label: "Files", icon: FolderOpen },
  { href: "/dashboard/tools", label: "Classroom Tools", icon: PenTool },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<{
    full_name: string;
    email: string;
    role: string;
    plan: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; title: string; content: string; link: string; read: boolean }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      supabaseRef.current = supabase;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, role, plan")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);

      const { data: notifs } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (notifs) setNotifications(notifs);
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-border fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sienna rounded-lg flex items-center justify-center">
              <Presentation className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading text-lg text-charcoal tracking-tight">
              ClassDeck
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-sienna/8 text-sienna font-medium"
                    : "text-charcoal/50 hover:text-charcoal hover:bg-charcoal/3"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <Link
            href="/editor/new"
            className="flex items-center justify-center gap-2 bg-sienna text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-sienna-dark transition-all duration-300 mb-3"
          >
            <Plus className="w-4 h-4" />
            New Presentation
          </Link>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-charcoal/8 rounded-full flex items-center justify-center text-xs font-medium text-charcoal">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-charcoal truncate">
                {profile?.full_name || "Loading..."}
              </div>
              <div className="text-xs text-charcoal/40 truncate">
                {profile?.email || ""}
              </div>
            </div>
            <button onClick={handleLogout} className="text-charcoal/30 hover:text-charcoal/50 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-charcoal/20 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sienna rounded-lg flex items-center justify-center">
              <Presentation className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading text-lg text-charcoal tracking-tight">
              ClassDeck
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-charcoal/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-sienna/8 text-sienna font-medium"
                    : "text-charcoal/50 hover:text-charcoal hover:bg-charcoal/3"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 bg-cream/80 backdrop-blur-md border-b border-border px-6 lg:px-10 h-16 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4 text-charcoal/50"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-charcoal/40 hover:text-charcoal/60 transition-colors">
                <Bell className="w-4 h-4" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sienna text-[9px] text-white rounded-full flex items-center justify-center">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-border rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-medium text-charcoal">Notifications</span>
                    {notifications.some((n) => !n.read) && (
                      <button onClick={async () => {
                        const supabase = createClient();
                        await supabase.from("notifications").update({ read: true }).eq("user_id", (await supabase.auth.getUser()).data.user?.id || "").eq("read", false);
                        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                      }} className="text-[11px] text-sienna hover:text-sienna/80 transition-colors">Mark all read</button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-charcoal/30">No notifications yet</div>
                  ) : notifications.map((n) => (
                    <div key={n.id} className={`px-4 py-3 border-b border-border/50 hover:bg-cream/50 transition-colors ${!n.read ? "bg-sienna/5" : ""}`}>
                      <div className="text-sm text-charcoal font-medium">{n.title}</div>
                      {n.content && <div className="text-xs text-charcoal/50 mt-0.5">{n.content}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              profile?.plan === "pro"
                ? "bg-sienna/10 text-sienna"
                : "bg-charcoal/5 text-charcoal/40"
            }`}>
              {profile?.plan === "pro" ? "Pro Plan" : "Starter Plan"}
            </span>
          </div>
        </header>
        <main className="p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
