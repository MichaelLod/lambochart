import { useState, useEffect, useCallback, useRef } from 'react';
import { Byoky, type ByokySession, type ConnectResponse, isExtensionInstalled, getStoreUrl, ByokyError } from '@byoky/sdk';

const STORAGE_KEY = 'lambochart:session';
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
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const response: ConnectResponse = JSON.parse(saved);
      byoky.reconnect(response).then((s) => {
        if (s) {
          s.onDisconnect(() => {
            sessionStorage.removeItem(STORAGE_KEY);
            setSession(null);
          });
          setSession(s);
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      });
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
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
      s.onDisconnect(() => {
        sessionStorage.removeItem(STORAGE_KEY);
        setSession(null);
      });
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
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
