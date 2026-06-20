export function Footer() {
  return (
    <footer className="bg-ink py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-surface/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-[family-name:var(--font-serif)] font-bold text-xl text-surface">AI Lunchpad</span>
            </div>
            <p className="text-sm text-surface/30 leading-relaxed">Real workflows for real builders. Not prompts. Not templates.</p>
          </div>
          <div>
            <h4 className="font-medium text-surface text-sm mb-5">Product</h4>
            <ul className="space-y-3 text-sm text-surface/30">
              <li><a href="#marketplace" className="hover:text-surface transition-colors duration-300">Workflows</a></li>
              <li><a href="#showcase" className="hover:text-surface transition-colors duration-300">Showcase</a></li>
              <li><a href="#tool-finder" className="hover:text-surface transition-colors duration-300">Tool Finder</a></li>
              <li><a href="#hub" className="hover:text-surface transition-colors duration-300">Hub</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-surface text-sm mb-5">Community</h4>
            <ul className="space-y-3 text-sm text-surface/30">
              <li><a href="#hub" className="hover:text-surface transition-colors duration-300">Posts</a></li>
              <li><a href="#failures" className="hover:text-surface transition-colors duration-300">Failures DB</a></li>
              <li><a href="#" className="hover:text-surface transition-colors duration-300">Newsletter</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-surface text-sm mb-5">Connect</h4>
            <ul className="space-y-3 text-sm text-surface/30">
              <li><a href="#" className="hover:text-surface transition-colors duration-300">Twitter / X</a></li>
              <li><a href="#" className="hover:text-surface transition-colors duration-300">Discord</a></li>
              <li><a href="#" className="hover:text-surface transition-colors duration-300">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface/5 pt-8 text-center text-sm text-surface/20">
          &copy; 2026 AI Lunchpad. Built with AI, for AI builders.
        </div>
      </div>
    </footer>
  );
}
