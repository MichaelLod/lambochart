import { useState, useEffect, useCallback, useRef } from 'react';
import { Byoky, type ByokySession, isExtensionInstalled, getStoreUrl, ByokyError } from '@byoky/sdk';

const byoky = new Byoky({ timeout: 120_000 });

export function useByoky() {
  const [session, setSession] = useState<ByokySession | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current) return;
    tried.current = true;
    byoky.tryReconnect().then((s) => {
      if (s) {
        s.onDisconnect(() => setSession(null));
        setSession(s);
      }
    });
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    setPairingCode(null);

    try {
      const s = await byoky.connect({
        providers: [
          { id: 'anthropic', required: false },
          { id: 'openai', required: false },
        ],
        onPairingReady: (code) => setPairingCode(code),
      });
      s.onDisconnect(() => setSession(null));
      setSession(s);
    } catch (e) {
      if (e instanceof ByokyError && e.code === 'WALLET_NOT_INSTALLED') {
        const url = getStoreUrl();
        if (url) window.open(url, '_blank');
        setError('Byoky extension not installed. Opening store...');
      } else {
        setError((e as Error).message);
      }
    } finally {
      setConnecting(false);
      setPairingCode(null);
    }
  }, []);

  const disconnect = useCallback(() => {
    session?.disconnect();
    setSession(null);
  }, [session]);

  return {
    session,
    connecting,
    error,
    pairingCode,
    installed: isExtensionInstalled(),
    connect,
    disconnect,
  };
}
