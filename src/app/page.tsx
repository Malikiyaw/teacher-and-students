import { Navbar } from '@/components/lunchpad/navbar';
import { Hero } from '@/components/lunchpad/hero';
import { Marketplace } from '@/components/lunchpad/marketplace';
import { Showcase } from '@/components/lunchpad/showcase';
import { ToolFinder } from '@/components/lunchpad/tool-finder';
import { Hub } from '@/components/lunchpad/hub';
import { Failures } from '@/components/lunchpad/failures';
import { Footer } from '@/components/lunchpad/footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <div className="max-w-7xl mx-auto px-6 lg:px-12"><div className="h-px bg-ink/10" /></div>
      <Marketplace />
      <Showcase />
      <ToolFinder />
      <Hub />
      <Failures />
      <Footer />
    </>
  );
}
