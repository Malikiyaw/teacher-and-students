import Navbar from "@/components/navbar";
import { Presentation } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="pt-32 pb-24 max-w-3xl mx-auto px-6">
        <h1 className="font-heading text-4xl text-charcoal tracking-tight mb-8">Privacy Policy</h1>
        <div className="prose prose-charcoal space-y-6 text-sm text-charcoal/60 leading-relaxed">
          <p><strong>Last updated:</strong> June 25, 2026</p>
          <h2 className="font-heading text-xl text-charcoal">Information We Collect</h2>
          <p>We collect your name, email address, and role (teacher/student) when you create an account. We also collect presentation data, quiz responses, and poll votes you create or submit.</p>
          <h2 className="font-heading text-xl text-charcoal">How We Use Your Information</h2>
          <p>We use your information to provide the ClassDeck service, including creating presentations, running quizzes, tracking engagement, and processing payments for Pro subscriptions.</p>
          <h2 className="font-heading text-xl text-charcoal">Data Storage</h2>
          <p>All data is stored securely using Supabase (PostgreSQL database with row-level security). File uploads are stored in Supabase Storage. Payment processing is handled by Stripe.</p>
          <h2 className="font-heading text-xl text-charcoal">Data Sharing</h2>
          <p>We do not sell or share your personal information with third parties. We may share data with service providers (Supabase, Stripe, Vercel) solely to operate the service.</p>
          <h2 className="font-heading text-xl text-charcoal">Your Rights</h2>
          <p>You can delete your account and all associated data at any time from the Settings page. You can also export your data by contacting support.</p>
          <h2 className="font-heading text-xl text-charcoal">Contact</h2>
          <p>For privacy questions, contact us at privacy@classdeck.app.</p>
        </div>
        <div className="mt-12">
          <Link href="/" className="text-sm text-sienna hover:text-sienna-dark transition-colors">← Back to home</Link>
        </div>
      </div>
    </>
  );
}
