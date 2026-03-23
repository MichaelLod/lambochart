import { useState, useCallback } from 'react';
import { useByoky } from './hooks/useByoky';
import { Landing } from './components/Landing';
import { Flowchart } from './components/Flowchart';

type AppView = 'landing' | 'chart';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const byoky = useByoky();

  const handleConnect = useCallback(async () => {
    await byoky.connect();
  }, [byoky]);

  const handleOpenCanvas = useCallback(() => {
    setView('chart');
  }, []);

  if (view === 'chart') {
    return (
      <Flowchart
        data={null}
        session={byoky.session}
        onConnect={handleConnect}
        onBack={() => setView('landing')}
      />
    );
  }

  return <Landing onCanvas={handleOpenCanvas} />;
}
