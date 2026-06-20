'use client';

import { SplineScene } from '@/components/ui/splite';
import { Card } from '@/components/ui/card';
import { Spotlight } from '@/components/ui/spotlight-aceternity';

export function Hero() {
  return (
    <section className="pt-32 pb-16 lg:pt-40 lg:pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden">
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
          <div className="flex h-full flex-col md:flex-row">
            <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
              <p className="text-sm font-medium text-accent tracking-widest uppercase mb-4">Workflows, not prompts</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 leading-tight">
                Build with AI.<br />Ship faster.
              </h1>
              <p className="mt-4 text-neutral-300 max-w-lg">
                A curated marketplace of AI workflows that actually save time. Each workflow includes the prompt, model, results, and time saved.
              </p>
            </div>
            <div className="flex-1 relative min-h-[300px]">
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
