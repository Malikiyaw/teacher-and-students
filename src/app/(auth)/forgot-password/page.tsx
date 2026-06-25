"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setSent(false);
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <Link href="/login" className="inline-flex items-center gap-2 text-sm text-charcoal/40 hover:text-charcoal/60 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>
      <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-2">Reset password</h1>
      <p className="text-sm text-charcoal/45 mb-10">Enter your email and we&apos;ll send you a reset link.</p>

      {sent ? (
        <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 rounded-xl p-6 text-center">
          <Check className="w-8 h-8 text-[#16A34A] mx-auto mb-3" />
          <p className="text-sm text-charcoal/70">Check your email for a password reset link.</p>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="text-xs font-medium text-charcoal/60 mb-1.5 block">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="you@school.edu"
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20 transition-all duration-300"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-charcoal text-white text-sm font-medium py-3 rounded-xl hover:bg-charcoal-light transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send Reset Link"}
          </button>
        </form>
      )}
    </div>
  );
}
