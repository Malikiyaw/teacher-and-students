import Link from "next/link";
import { SplineSceneBasic } from "@/components/ui/demo-spline";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="flex items-center justify-center gap-6 py-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          SplineScene
        </Link>
        <Link href="/hero-demo" className="hover:text-foreground transition-colors">
          PixelHero
        </Link>
        <Link href="/spotlight-demo" className="hover:text-foreground transition-colors">
          Spotlights
        </Link>
      </nav>
      <SplineSceneBasic />
    </main>
  );
}
