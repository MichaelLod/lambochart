import { useState, useCallback } from 'react';
import { useByoky } from './hooks/useByoky';
import { useChat } from './hooks/useChat';
import { Landing } from './components/Landing';
import { Chat } from './components/Chat';
import { Flowchart } from './components/Flowchart';
import type { AppView, FlowchartData } from './lib/types';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [chartData, setChartData] = useState<FlowchartData | null>(null);

  const byoky = useByoky();
  const chat = useChat(byoky.session);

  const handleConnect = useCallback(async () => {
    await byoky.connect();
    setView('brainstorm');
  }, [byoky]);

  const handleGenerateChart = useCallback(async () => {
    const data = await chat.generateFlowchart();
    if (data) {
      setChartData(data);
      setView('chart');
    }
  }, [chat]);

  const handleBackToBrainstorm = useCallback(() => {
    setView('brainstorm');
  }, []);

  if (view === 'landing' && !byoky.session) {
    return (
      <Landing
        onConnect={handleConnect}
        connecting={byoky.connecting}
        error={byoky.error}
        pairingCode={byoky.pairingCode}
      />
    );
  }

  if (view === 'chart' && chartData) {
    return <Flowchart data={chartData} onBack={handleBackToBrainstorm} />;
  }

  return (
    <Chat
      messages={chat.messages}
      loading={chat.loading}
      error={chat.error}
      onSend={chat.sendMessage}
      onGenerateChart={handleGenerateChart}
    />
  );
}
