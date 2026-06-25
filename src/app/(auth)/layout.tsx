import Link from "next/link";
import { Presentation } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-charcoal text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sienna/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sienna/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <Link href="/" className="flex items-center gap-2.5 relative">
          <div className="w-9 h-9 bg-sienna rounded-lg flex items-center justify-center">
            <Presentation className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading text-xl tracking-tight">ClassDeck</span>
        </Link>

        <div className="relative">
          <blockquote className="font-heading text-3xl leading-snug mb-6">
            &ldquo;I used to dread setting up presentations.
            <br />
            Now my students ask when we&apos;re using ClassDeck again.&rdquo;
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-sienna/20 rounded-full flex items-center justify-center text-sm font-medium text-sienna">
              MR
            </div>
            <div>
              <div className="text-sm font-medium">Maria Rodriguez</div>
              <div className="text-xs text-white/40">
                Biology teacher, Lincoln High
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/25 relative">
          &copy; 2026 ClassDeck. Free for classrooms.
        </div>
      </div>

      <div className="flex flex-col justify-center px-8 py-12 lg:px-16 bg-cream">
        {children}
      </div>
    </div>
  );
}
