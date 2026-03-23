interface LandingProps {
  onConnect: () => void;
  connecting: boolean;
  error: string | null;
  pairingCode: string | null;
}

export function Landing({ onConnect, connecting, error, pairingCode }: LandingProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-glow border border-accent/20 text-accent-2 text-sm font-medium mb-6">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L10 6L15 7L11 11L12 16L8 13L4 16L5 11L1 7L6 6L8 1Z" fill="currentColor" />
            </svg>
            powered by byoky
          </div>

          <h1 className="font-display text-5xl font-bold tracking-tight text-text mb-4">
            lambochart
          </h1>

          <p className="text-text-2 text-lg leading-relaxed mb-2">
            Brainstorm your idea. See the full picture.
          </p>
          <p className="text-text-3 text-base leading-relaxed">
            Visualize the product lifecycle before you start vibe coding —
            from idea to strategy to what's actually achievable.
          </p>
        </div>

        <button
          onClick={onConnect}
          disabled={connecting}
          className="inline-flex items-center gap-3 px-8 py-4 bg-accent hover:bg-accent-2 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:cursor-wait"
        >
          {connecting ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              Connect Wallet
            </>
          )}
        </button>

        {pairingCode && (
          <div className="mt-6 p-4 bg-surface rounded-xl border border-border">
            <p className="text-text-2 text-sm mb-2">Scan with Byoky mobile app:</p>
            <code className="text-accent-2 text-xs break-all">{pairingCode}</code>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-rose/10 border border-rose/20 rounded-lg text-rose text-sm">
            {error}
          </div>
        )}

        <div className="mt-12 grid grid-cols-3 gap-4 text-left">
          {[
            { title: 'Brainstorm', desc: 'Chat with AI to refine your product idea' },
            { title: 'Visualize', desc: 'See the full lifecycle as a flowchart' },
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
