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
    if (view === 'landing') {
      setView('brainstorm');
    }
  }, [byoky, view]);

  const handleOpenCanvas = useCallback(() => {
    setChartData(null);
    setView('chart');
  }, []);

  const handleGenerateChart = useCallback(async () => {
    const data = await chat.generateFlowchart();
    if (data) {
      setChartData(data);
      setView('chart');
    }
  }, [chat]);

  const handleBackFromChart = useCallback(() => {
    if (byoky.session && chat.messages.length > 0) {
      setView('brainstorm');
    } else {
      setView('landing');
    }
  }, [byoky.session, chat.messages.length]);

  if (view === 'landing' && !byoky.session) {
    return (
      <Landing
        onConnect={handleConnect}
        onCanvas={handleOpenCanvas}
        connecting={byoky.connecting}
        error={byoky.error}
      />
    );
  }

  if (view === 'chart') {
    return (
      <Flowchart
        data={chartData}
        session={byoky.session}
        onConnect={handleConnect}
        onBack={handleBackFromChart}
      />
    );
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
