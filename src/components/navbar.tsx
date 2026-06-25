"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Presentation } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-sienna rounded-lg flex items-center justify-center transition-all duration-300 cubic-bezier(0.25, 0.8, 0.25, 1) group-hover:rounded-xl group-hover:shadow-lg group-hover:shadow-sienna/20">
              <Presentation className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading text-xl text-charcoal tracking-tight">
              ClassDeck
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link
              href="/#features"
              className="text-sm text-charcoal/60 hover:text-charcoal transition-colors duration-300"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm text-charcoal/60 hover:text-charcoal transition-colors duration-300"
            >
              How It Works
            </Link>
            <Link
              href="/#pricing"
              className="text-sm text-charcoal/60 hover:text-charcoal transition-colors duration-300"
            >
              Pricing
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-charcoal px-4 py-2 rounded-lg hover:bg-charcoal/5 transition-all duration-300"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium text-white bg-charcoal px-5 py-2.5 rounded-lg hover:bg-charcoal-light transition-all duration-300 hover:shadow-lg hover:shadow-charcoal/10"
            >
              Get Started Free
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-charcoal"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-cream">
          <div className="px-6 py-6 space-y-4">
            <Link
              href="/#features"
              className="block text-sm text-charcoal/60 hover:text-charcoal"
              onClick={() => setOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="block text-sm text-charcoal/60 hover:text-charcoal"
              onClick={() => setOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/#pricing"
              className="block text-sm text-charcoal/60 hover:text-charcoal"
              onClick={() => setOpen(false)}
            >
              Pricing
            </Link>
            <div className="pt-4 border-t border-border space-y-3">
              <Link
                href="/login"
                className="block text-sm font-medium text-charcoal"
                onClick={() => setOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="block text-sm font-medium text-white bg-charcoal text-center px-5 py-2.5 rounded-lg"
                onClick={() => setOpen(false)}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
