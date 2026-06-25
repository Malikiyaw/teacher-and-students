import Navbar from "@/components/navbar";
import Link from "next/link";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="pt-32 pb-24 max-w-3xl mx-auto px-6">
        <h1 className="font-heading text-4xl text-charcoal tracking-tight mb-8">Terms of Service</h1>
        <div className="prose prose-charcoal space-y-6 text-sm text-charcoal/60 leading-relaxed">
          <p><strong>Last updated:</strong> June 25, 2026</p>
          <h2 className="font-heading text-xl text-charcoal">Acceptance of Terms</h2>
          <p>By using ClassDeck, you agree to these Terms of Service. If you do not agree, do not use the service.</p>
          <h2 className="font-heading text-xl text-charcoal">Service Description</h2>
          <p>ClassDeck is a presentation platform for classrooms. Teachers can create and present slides, run polls and quizzes, and manage virtual rooms. Students can join rooms, view presentations, and participate in polls and quizzes.</p>
          <h2 className="font-heading text-xl text-charcoal">Free Tier</h2>
          <p>The Starter plan is free and includes up to 5 presentations, basic templates, and rooms with up to 10 students.</p>
          <h2 className="font-heading text-xl text-charcoal">Pro Plan</h2>
          <p>The Pro plan costs $8/month per teacher and includes unlimited presentations, premium templates, rooms with up to 100 students, and analytics.</p>
          <h2 className="font-heading text-xl text-charcoal">User Responsibilities</h2>
          <p>You are responsible for your account credentials and all activity under your account. Teachers are responsible for the content they create and share with students.</p>
          <h2 className="font-heading text-xl text-charcoal">Termination</h2>
          <p>You may delete your account at any time. We reserve the right to suspend accounts that violate these terms.</p>
          <h2 className="font-heading text-xl text-charcoal">Contact</h2>
          <p>For questions about these terms, contact us at legal@classdeck.app.</p>
        </div>
        <div className="mt-12">
          <Link href="/" className="text-sm text-sienna hover:text-sienna-dark transition-colors">← Back to home</Link>
        </div>
      </div>
    </>
  );
}
