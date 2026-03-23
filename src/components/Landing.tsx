interface LandingProps {
  onConnect: () => void;
  onCanvas: () => void;
  connecting: boolean;
  error: string | null;
}

export function Landing({ onConnect, onCanvas, connecting, error }: LandingProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-glow border border-accent/20 text-accent-2 text-sm font-medium mb-6">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L10 6L15 7L11 11L12 16L8 13L4 16L5 11L1 7L6 6L8 1Z" fill="currentColor" />
            </svg>
            powered by <a href="https://byoky.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors">byoky</a>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <svg className="w-14 h-14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logo-bg" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#5a3dd6"/>
                  <stop offset="100%" stopColor="#9b7eff"/>
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="7" fill="url(#logo-bg)"/>
              <polyline points="6,25 14,17 22,10 27,5" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14,17 22,21 27,18" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.65"/>
              <circle cx="6" cy="25" r="2" fill="white" opacity="0.45"/>
              <circle cx="14" cy="17" r="2.8" fill="white"/>
              <circle cx="22" cy="10" r="2.2" fill="white"/>
              <circle cx="27" cy="5" r="2.2" fill="white"/>
              <circle cx="22" cy="21" r="1.8" fill="white" opacity="0.55"/>
              <circle cx="27" cy="18" r="1.8" fill="white" opacity="0.55"/>
            </svg>
            <h1 className="font-display text-5xl font-bold tracking-tight text-text">
              lambochart
            </h1>
          </div>

          <p className="text-text-2 text-lg leading-relaxed mb-2">
            Brainstorm your idea. See the full picture.
          </p>
          <p className="text-text-3 text-base leading-relaxed">
            Visualize the product lifecycle before you start vibe coding —
            from idea to strategy to what's actually achievable.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onConnect}
            disabled={connecting}
            className="inline-flex items-center gap-3 px-8 py-4 bg-accent hover:bg-accent-2 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:cursor-wait"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Brainstorm with AI
          </button>

          <button
            onClick={onCanvas}
            className="inline-flex items-center gap-3 px-8 py-4 bg-surface-2 hover:bg-surface-3 text-text border border-border hover:border-border-2 font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Open Canvas
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose/10 border border-rose/20 rounded-lg text-rose text-sm">
            {error}
          </div>
        )}

        <div className="mt-12 grid grid-cols-3 gap-4 text-left">
          {[
            { title: 'Brainstorm', desc: 'Chat with AI to refine your product idea' },
            { title: 'Drag & Drop', desc: 'Build your flowchart with vibe blocks' },
            { title: 'Strategize', desc: 'Understand risks and paths before coding' },
          ].map((item) => (
            <div key={item.title} className="p-4 bg-surface rounded-xl border border-border">
              <h3 className="text-text font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-text-3 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
