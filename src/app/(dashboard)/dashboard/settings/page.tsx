"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Lock,
  CreditCard,
  Trash2,
  Camera,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">
        Settings
      </h1>
      <p className="text-sm text-charcoal/45 mb-10">
        Manage your account and preferences.
      </p>

      <div className="space-y-8">
        {/* Profile */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-4 h-4 text-sienna" />
            <h2 className="font-heading text-lg text-charcoal">Profile</h2>
          </div>
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-charcoal/8 rounded-full flex items-center justify-center text-xl font-heading text-charcoal">
                JD
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-sienna text-white rounded-full flex items-center justify-center hover:bg-sienna-dark transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <div className="text-sm font-medium text-charcoal">Jane Doe</div>
              <div className="text-xs text-charcoal/40">jane@school.edu</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-charcoal/50 mb-1.5 block">
                First name
              </label>
              <input
                type="text"
                defaultValue="Jane"
                className="w-full bg-cream/50 border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:border-sienna/40 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal/50 mb-1.5 block">
                Last name
              </label>
              <input
                type="text"
                defaultValue="Doe"
                className="w-full bg-cream/50 border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:border-sienna/40 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal/50 mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                defaultValue="jane@school.edu"
                className="w-full bg-cream/50 border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:border-sienna/40 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal/50 mb-1.5 block">
                School
              </label>
              <input
                type="text"
                defaultValue="Lincoln High School"
                className="w-full bg-cream/50 border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:border-sienna/40 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-4 h-4 text-sienna" />
            <h2 className="font-heading text-lg text-charcoal">
              Notifications
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Email notifications for new students", checked: true },
              { label: "Quiz completion alerts", checked: true },
              { label: "Weekly engagement summary", checked: false },
              { label: "Product updates", checked: false },
            ].map((item) => (
              <label
                key={item.label}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="text-sm text-charcoal/60">{item.label}</span>
                <div
                  className={`w-10 h-[22px] rounded-full transition-all duration-300 relative cursor-pointer ${
                    item.checked ? "bg-sienna" : "bg-charcoal/15"
                  }`}
                >
                  <div
                    className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                      item.checked ? "left-[22px]" : "left-[3px]"
                    }`}
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-4 h-4 text-sienna" />
            <h2 className="font-heading text-lg text-charcoal">Security</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-charcoal/50 mb-1.5 block">
                Current password
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                className="w-full bg-cream/50 border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/25 focus:border-sienna/40 outline-none transition-colors"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-charcoal/50 mb-1.5 block">
                  New password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full bg-cream/50 border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/25 focus:border-sienna/40 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-charcoal/50 mb-1.5 block">
                  Confirm password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full bg-cream/50 border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/25 focus:border-sienna/40 outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white border border-red-200 rounded-xl p-6">
          <h2 className="font-heading text-lg text-red-600 mb-4">
            Danger Zone
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-charcoal">
                Delete account
              </div>
              <div className="text-xs text-charcoal/40">
                Permanently delete your account and all data.
              </div>
            </div>
            <button className="flex items-center gap-2 text-sm text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-[#16A34A]">
              <Check className="w-4 h-4" />
              Saved
            </span>
          )}
          <button
            onClick={save}
            className="bg-charcoal text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-charcoal-light transition-all duration-300"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
