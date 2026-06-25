"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/presentations", label: "Presentations", icon: Presentation },
  { href: "/dashboard/rooms", label: "Rooms", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/files", label: "Files", icon: FolderOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            const isActive = pathname === item.href;
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
            href="/dashboard/new"
            className="flex items-center justify-center gap-2 bg-sienna text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-sienna-dark transition-all duration-300 mb-3"
          >
            <Plus className="w-4 h-4" />
            New Presentation
          </Link>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-charcoal/8 rounded-full flex items-center justify-center text-xs font-medium text-charcoal">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-charcoal truncate">
                Jane Doe
              </div>
              <div className="text-xs text-charcoal/40 truncate">
                jane@school.edu
              </div>
            </div>
            <button className="text-charcoal/30 hover:text-charcoal/50 transition-colors">
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
            const isActive = pathname === item.href;
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
            <span className="text-xs text-charcoal/30 bg-sienna/8 text-sienna px-3 py-1 rounded-full font-medium">
              Starter Plan
            </span>
          </div>
        </header>
        <main className="p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
