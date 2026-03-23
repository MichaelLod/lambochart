import { useState, useEffect, useCallback, useRef } from 'react';
import { Byoky, type ByokySession, type ConnectResponse } from '@byoky/sdk';

const STORAGE_KEY = 'lambochart:session';
const byoky = new Byoky({ timeout: 120_000 });

function bindSession(
  s: ByokySession,
  setSession: React.Dispatch<React.SetStateAction<ByokySession | null>>,
) {
  s.onDisconnect(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
  });
  s.onProvidersUpdated((providers) => {
    setSession((prev) => (prev ? { ...prev, providers } : null));
  });
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  setSession(s);
}

export function useByoky() {
  const [session, setSession] = useState<ByokySession | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          bindSession(s, setSession);
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      });
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const connect = useCallback(async (): Promise<boolean> => {
    setConnecting(true);
    setError(null);

    try {
      const s = await byoky.connect({
        providers: [
          { id: 'anthropic', required: false },
          { id: 'openai', required: false },
        ],
        modal: {
          theme: {
            accentColor: '#7c5cfc',
            backgroundColor: '#12121a',
            textColor: '#e8e8f0',
            borderRadius: '16px',
          },
        },
      });
      bindSession(s, setSession);
      return true;
    } catch (e) {
      const msg = (e as Error).message;
      if (msg !== 'User cancelled') {
        setError(msg);
      }
      return false;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    session?.disconnect();
    setSession(null);
  }, [session]);

  return { session, connecting, error, connect, disconnect };
}
