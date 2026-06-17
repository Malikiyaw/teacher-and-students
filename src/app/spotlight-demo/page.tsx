'use client'

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Spotlight as AceternitySpotlight } from "@/components/ui/spotlight-aceternity";
import { Spotlight as IbelickSpotlight } from "@/components/ui/spotlight-ibelick";

export default function SpotlightDemo() {
  return (
    <main className="min-h-screen bg-background p-8">
      <nav className="flex items-center justify-center gap-6 py-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">SplineScene</Link>
        <Link href="/hero-demo" className="hover:text-foreground transition-colors">PixelHero</Link>
        <Link href="/spotlight-demo" className="hover:text-foreground transition-colors">Spotlights</Link>
      </nav>
      <h1 className="text-3xl font-bold mb-8 text-center">Spotlight Comparison</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Aceternity Version */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Aceternity (SVG)</h2>
          <Card className="w-full h-[400px] bg-black/[0.96] relative overflow-hidden">
            <AceternitySpotlight
              className="-top-40 left-0 md:left-40 md:-top-20"
              fill="white"
            />
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <h3 className="text-2xl font-bold text-white">Static Spotlight</h3>
              <p className="text-neutral-300 mt-2 text-center px-8">
                SVG-based animated spotlight. No mouse tracking — purely CSS animation.
              </p>
            </div>
          </Card>
        </div>

        {/* Ibelick Version */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Ibelick (Framer Motion)</h2>
          <Card className="w-full h-[400px] bg-black/[0.96] relative overflow-hidden">
            <IbelickSpotlight className="-top-20 left-0" size={300} />
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <h3 className="text-2xl font-bold text-white">Interactive Spotlight</h3>
              <p className="text-neutral-300 mt-2 text-center px-8">
                Framer-motion powered spotlight. Tracks mouse movement for interactive effect.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
