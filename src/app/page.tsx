import Link from "next/link";
import Navbar from "@/components/navbar";
import {
  Presentation,
  Users,
  BarChart3,
  Timer,
  Vote,
  Brain,
  PenTool,
  Share2,
  Zap,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero — asymmetric, overlapping blocks */}
      <section className="relative pt-32 lg:pt-44 pb-24 lg:pb-40 overflow-hidden">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-sienna/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sienna/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            <div className="lg:col-span-7 lg:pr-8">
              <div className="inline-flex items-center gap-2 bg-sienna/8 border border-sienna/15 rounded-full px-4 py-1.5 mb-8">
                <Sparkles className="w-3.5 h-3.5 text-sienna" />
                <span className="text-xs font-medium text-sienna tracking-wide uppercase">
                  Built for real classrooms
                </span>
              </div>

              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] text-charcoal leading-[1.05] tracking-tight mb-8">
                Presentations
                <br />
                that actually
                <br />
                <span className="text-sienna">engage.</span>
              </h1>

              <p className="text-lg lg:text-xl text-charcoal/55 max-w-xl leading-relaxed mb-10">
                The slide deck tool teachers and students actually want to use.
                Create, present, and interact in real-time — no cable fights,
                no login hassles, no bore.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-charcoal text-white text-sm font-medium px-7 py-3.5 rounded-xl hover:bg-charcoal-light transition-all duration-300 cubic-bezier(0.25, 0.8, 0.25, 1) hover:shadow-xl hover:shadow-charcoal/10 hover:-translate-y-0.5"
                >
                  Start Creating Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/#how-it-works"
                  className="inline-flex items-center justify-center gap-2 text-sm font-medium text-charcoal/60 px-7 py-3.5 rounded-xl border border-border hover:border-charcoal/20 hover:text-charcoal transition-all duration-300"
                >
                  See How It Works
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative bg-charcoal rounded-2xl p-1 shadow-2xl shadow-charcoal/15">
                <div className="bg-[#2A2523] rounded-xl aspect-[4/3] p-6 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#B91C1C]/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#CA8A04]/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]/80" />
                    <span className="ml-3 text-xs text-white/30 font-medium">
                      presenter-mode.classdeck.app
                    </span>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="font-heading text-3xl text-white mb-2">
                        Photosynthesis
                      </div>
                      <div className="text-white/40 text-sm">
                        Chapter 4 — Biology 101
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/25">Slide 3 of 18</span>
                    <div className="flex items-center gap-3">
                      <div className="bg-sienna/20 text-sienna text-xs px-3 py-1 rounded-full font-medium">
                        Live Poll Active
                      </div>
                      <div className="text-white/25 text-xs">14 joined</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-6 bg-white rounded-xl shadow-lg shadow-charcoal/8 border border-border px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-sienna/10 rounded-lg flex items-center justify-center">
                  <Vote className="w-5 h-5 text-sienna" />
                </div>
                <div>
                  <div className="text-xs font-medium text-charcoal">
                    12 votes received
                  </div>
                  <div className="text-[11px] text-charcoal/40">
                    Poll closes in 0:34
                  </div>
                </div>
              </div>

              {/* Floating badge 2 */}
              <div className="absolute -top-3 -right-4 bg-white rounded-xl shadow-lg shadow-charcoal/8 border border-border px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#16A34A]/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#16A34A]" />
                </div>
                <div>
                  <div className="text-xs font-medium text-charcoal">
                    Room active
                  </div>
                  <div className="text-[11px] text-charcoal/40">
                    28 students connected
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof — clean strip */}
      <section className="py-8 border-y border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-charcoal/30 text-sm font-medium tracking-wide">
            <span>5,200+ classrooms</span>
            <span className="hidden sm:inline text-charcoal/15">|</span>
            <span>140+ schools</span>
            <span className="hidden sm:inline text-charcoal/15">|</span>
            <span>12 countries</span>
            <span className="hidden sm:inline text-charcoal/15">|</span>
            <span>Free forever for basics</span>
          </div>
        </div>
      </section>

      {/* Features — staggered grid, not zigzag */}
      <section id="features" className="py-24 lg:py-36">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mb-20">
            <span className="text-xs font-medium text-sienna tracking-widest uppercase mb-4 block">
              Everything you need
            </span>
            <h2 className="font-heading text-4xl lg:text-5xl text-charcoal tracking-tight leading-tight">
              Tools that make
              <br />
              teaching sharper.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: PenTool,
                title: "Visual Slide Editor",
                desc: "Drag, drop, design. Add text, images, shapes, and backgrounds without fighting your software.",
              },
              {
                icon: Presentation,
                title: "Presenter Mode",
                desc: "Fullscreen presenting with speaker notes, laser pointer, and keyboard navigation.",
              },
              {
                icon: Vote,
                title: "Live Polls",
                desc: "Launch a poll mid-presentation. Students vote on their phones. Results update in real-time.",
              },
              {
                icon: Brain,
                title: "Interactive Quizzes",
                desc: "Multiple choice, true/false, timed challenges. Auto-scored with instant leaderboards.",
              },
              {
                icon: Timer,
                title: "Countdown Timer",
                desc: "Set timed activities with audible alerts. Perfect for group work and exams.",
              },
              {
                icon: Users,
                title: "Room System",
                desc: "Teachers create rooms, students join with a code. No emails, no friction.",
              },
              {
                icon: Share2,
                title: "Instant Sharing",
                desc: "Share a link or code. Anyone can view presentations without creating an account.",
              },
              {
                icon: BarChart3,
                title: "Analytics",
                desc: "Track engagement, quiz scores, and participation across your classes.",
              },
              {
                icon: Zap,
                title: "Real-time Collab",
                desc: "Multiple editors on the same deck. See changes live. No merge conflicts.",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="group p-7 rounded-2xl border border-transparent hover:border-border hover:bg-white transition-all duration-300 cubic-bezier(0.25, 0.8, 0.25, 1)"
              >
                <div className="w-11 h-11 bg-sienna/8 rounded-xl flex items-center justify-center mb-5 group-hover:bg-sienna/12 transition-colors duration-300">
                  <feature.icon className="w-5 h-5 text-sienna" />
                </div>
                <h3 className="font-heading text-lg text-charcoal mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-charcoal/50 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — large asymmetric layout */}
      <section
        id="how-it-works"
        className="py-24 lg:py-36 bg-white border-y border-border"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <span className="text-xs font-medium text-sienna tracking-widest uppercase mb-4 block">
                Simple workflow
              </span>
              <h2 className="font-heading text-4xl lg:text-5xl text-charcoal tracking-tight leading-tight mb-6">
                Three steps.
                <br />
                No manual needed.
              </h2>
              <p className="text-charcoal/50 leading-relaxed">
                ClassDeck works the way your brain does — pick a template, add
                your content, share with the room. That&apos;s it.
              </p>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 space-y-16">
              {[
                {
                  step: "01",
                  title: "Create your deck",
                  desc: "Pick a template or start blank. Add slides, images, text. The editor does what you expect — nothing fancy, nothing frustrating.",
                },
                {
                  step: "02",
                  title: "Start a room",
                  desc: "Click 'Present' and get a room code. Students enter it on their phones. No accounts needed on their end.",
                },
                {
                  step: "03",
                  title: "Engage and measure",
                  desc: "Launch polls, quizzes, timers. Watch responses come in live. Review analytics after class to see who's keeping up.",
                },
              ].map((item, i) => (
                <div key={item.step} className="relative pl-16">
                  <div className="absolute left-0 top-0 font-heading text-4xl text-sienna/15">
                    {item.step}
                  </div>
                  <h3 className="font-heading text-xl text-charcoal mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-charcoal/50 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Teachers vs For Students — split layout */}
      <section className="py-24 lg:py-36">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="font-heading text-4xl lg:text-5xl text-charcoal tracking-tight">
              Built for both sides.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-charcoal rounded-2xl p-10 lg:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sienna/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
              <span className="text-xs font-medium text-white/40 tracking-widest uppercase mb-6 block">
                For Teachers
              </span>
              <h3 className="font-heading text-3xl mb-6 leading-snug">
                Stop fighting
                <br />
                the projector.
              </h3>
              <ul className="space-y-4">
                {[
                  "Create and reuse presentation templates",
                  "Launch live polls without leaving your slides",
                  "See which students are engaged (and which aren't)",
                  "Auto-grade quizzes, skip the paperwork",
                  "No IT support needed — it just works",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-white/70"
                  >
                    <Check className="w-4 h-4 text-sienna mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-border rounded-2xl p-10 lg:p-12 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-sienna/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />
              <span className="text-xs font-medium text-charcoal/40 tracking-widest uppercase mb-6 block">
                For Students
              </span>
              <h3 className="font-heading text-3xl text-charcoal mb-6 leading-snug">
                Actually pay attention
                <br />
                in class.
              </h3>
              <ul className="space-y-4">
                {[
                  "Join any class with a simple code",
                  "Answer polls and quizzes from your phone",
                  "Download presentation slides after class",
                  "Track your own quiz scores and progress",
                  "No app download — works in any browser",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-charcoal/60"
                  >
                    <Check className="w-4 h-4 text-sienna mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="py-24 lg:py-36 bg-white border-y border-border"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mb-20">
            <span className="text-xs font-medium text-sienna tracking-widest uppercase mb-4 block">
              Pricing
            </span>
            <h2 className="font-heading text-4xl lg:text-5xl text-charcoal tracking-tight leading-tight">
              Free to start.
              <br />
              Pay when you grow.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            <div className="border border-border rounded-2xl p-8 lg:p-10 bg-cream/50">
              <h3 className="font-heading text-2xl text-charcoal mb-2">
                Starter
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-heading text-4xl text-charcoal">
                  $0
                </span>
                <span className="text-sm text-charcoal/40">/month</span>
              </div>
              <p className="text-sm text-charcoal/50 mb-8">
                Everything a solo teacher needs to get started.
              </p>
              <ul className="space-y-3.5 mb-10">
                {[
                  "5 presentations",
                  "Basic templates",
                  "Live polls & quizzes",
                  "Room system (10 students)",
                  "Presenter mode",
                  "Timer & name picker",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-charcoal/60"
                  >
                    <Check className="w-4 h-4 text-sienna shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center text-sm font-medium text-charcoal border border-border px-5 py-3 rounded-xl hover:border-charcoal/20 transition-all duration-300"
              >
                Get Started Free
              </Link>
            </div>

            <div className="border-2 border-sienna rounded-2xl p-8 lg:p-10 relative">
              <div className="absolute -top-3.5 left-8 bg-sienna text-white text-xs font-medium px-3 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="font-heading text-2xl text-charcoal mb-2">
                Pro
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-heading text-4xl text-charcoal">
                  $8
                </span>
                <span className="text-sm text-charcoal/40">
                  /month per teacher
                </span>
              </div>
              <p className="text-sm text-charcoal/50 mb-8">
                Unlimited everything. For serious educators.
              </p>
              <ul className="space-y-3.5 mb-10">
                {[
                  "Unlimited presentations",
                  "Premium templates",
                  "Rooms up to 100 students",
                  "Analytics dashboard",
                  "Quiz leaderboards",
                  "Priority support",
                  "Custom branding",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-charcoal/60"
                  >
                    <Check className="w-4 h-4 text-sienna shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center text-sm font-medium text-white bg-sienna px-5 py-3 rounded-xl hover:bg-sienna-dark transition-all duration-300 cubic-bezier(0.25, 0.8, 0.25, 1) hover:shadow-lg hover:shadow-sienna/15"
              >
                Start Pro Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-36">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="bg-charcoal rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sienna/10 rounded-full blur-3xl pointer-events-none" />
            <h2 className="font-heading text-4xl lg:text-5xl text-white tracking-tight mb-6 relative">
              Ready to ditch the
              <br />
              boring slides?
            </h2>
            <p className="text-white/45 max-w-lg mx-auto mb-10 relative">
              Join thousands of teachers already using ClassDeck to make their
              presentations something students actually look forward to.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-sienna text-white text-sm font-medium px-8 py-4 rounded-xl hover:bg-sienna-light transition-all duration-300 cubic-bezier(0.25, 0.8, 0.25, 1) hover:shadow-xl hover:shadow-sienna/20 relative"
            >
              Create Your Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-sienna rounded-md flex items-center justify-center">
                <Presentation className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading text-base text-charcoal">
                ClassDeck
              </span>
            </div>
            <div className="flex items-center gap-8 text-xs text-charcoal/40">
              <Link href="/privacy" className="hover:text-charcoal/60 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-charcoal/60 transition-colors">
                Terms
              </Link>
              <span>&copy; 2026 ClassDeck</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
