"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GraduationCap, BookOpen, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          role,
          school,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data?.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setShowConfirmation(true);
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          role,
        },
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-2">
        Create your account.
      </h1>
      <p className="text-sm text-charcoal/45 mb-10">
        Free forever for basic features. No credit card needed.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}

      {showConfirmation ? (
        <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 rounded-xl p-6 text-center mb-5">
          <Mail className="w-10 h-10 text-[#16A34A] mx-auto mb-3" />
          <h3 className="font-heading text-lg text-charcoal mb-2">Check your email</h3>
          <p className="text-sm text-charcoal/60 mb-4">
            We sent a confirmation link to <strong className="text-charcoal/80">{email}</strong>.
            Click the link to activate your account, then log in.
          </p>
          <p className="text-xs text-charcoal/40 mb-4">
            Didn't receive it? Check your spam folder or{" "}
            <button onClick={handleSignup} className="text-sienna hover:text-sienna-dark underline">
              resend
            </button>
          </p>
          <Link href="/login"
            className="inline-block bg-charcoal text-white text-sm font-medium py-3 px-6 rounded-xl hover:bg-charcoal-light transition-all">
            Go to Log In
          </Link>
        </div>
      ) : (
      <form className="space-y-5" onSubmit={handleSignup}>
        <div>
          <label className="text-xs font-medium text-charcoal/60 mb-2 block">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                role === "teacher"
                  ? "border-sienna bg-sienna/5 text-sienna"
                  : "border-border bg-white text-charcoal/50 hover:border-charcoal/20"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Teacher
            </button>
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                role === "student"
                  ? "border-sienna bg-sienna/5 text-sienna"
                  : "border-border bg-white text-charcoal/50 hover:border-charcoal/20"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-charcoal/60 mb-1.5 block">
              First name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
              required
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20 transition-all duration-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-charcoal/60 mb-1.5 block">
              Last name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              required
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20 transition-all duration-300"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-charcoal/60 mb-1.5 block">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@school.edu"
            required
            className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20 transition-all duration-300"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-charcoal/60 mb-1.5 block">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full bg-white border border-border rounded-xl px-4 py-3 pr-11 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20 transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-charcoal/50 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {role === "teacher" && (
          <div>
            <label className="text-xs font-medium text-charcoal/60 mb-1.5 block">
              School / Organization (optional)
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Lincoln High School"
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-sienna/40 focus:ring-1 focus:ring-sienna/20 transition-all duration-300"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sienna text-white text-sm font-medium py-3 rounded-xl hover:bg-sienna-dark transition-all duration-300 cubic-bezier(0.25, 0.8, 0.25, 1) hover:shadow-lg hover:shadow-sienna/15 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : role === "teacher" ? (
            "Create Teacher Account"
          ) : (
            "Create Student Account"
          )}
        </button>
      </form>
      )}

      {!showConfirmation && (
        <>
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-cream px-3 text-charcoal/30 tracking-wider">
                or
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full border border-border bg-white text-sm font-medium text-charcoal py-3 rounded-xl hover:border-charcoal/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </button>

          <p className="text-center text-xs text-charcoal/40 mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-sienna font-medium hover:text-sienna-dark transition-colors"
            >
              Log in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
