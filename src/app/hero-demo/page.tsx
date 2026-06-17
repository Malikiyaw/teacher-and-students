'use client'

import Link from "next/link";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";

export default function HeroDemo() {
  return (
    <div className="w-full min-h-screen bg-background">
      <nav className="flex items-center justify-center gap-6 py-6 text-sm text-muted-foreground relative z-50">
        <Link href="/" className="hover:text-foreground transition-colors">SplineScene</Link>
        <Link href="/hero-demo" className="hover:text-foreground transition-colors">PixelHero</Link>
        <Link href="/spotlight-demo" className="hover:text-foreground transition-colors">Spotlights</Link>
      </nav>
      <PixelHero
        word1="Silent"
        word2="Precision."
        description="Interfaces with refined motion. Every calculated detail delivers an elevated digital experience."
        primaryCta="Explore Design"
        primaryCtaMobile="Explore"
        secondaryCta="View GitHub"
        secondaryCtaMobile="GitHub"
        onPrimaryClick={() => console.log("Primary click action triggered.")}
        onSecondaryClick={() => console.log("Secondary click action triggered.")}
        githubUrl="https://github.com"
      />
    </div>
  );
}
