import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import Header from './components/Header.tsx';

type CalculatorTab = 'pcb' | 'epf';

function Root() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('pcb');

  useEffect(() => {
    document.body.classList.remove('theme-pcb-body', 'theme-epf-body');
    document.body.classList.add(activeTab === 'epf' ? 'theme-epf-body' : 'theme-pcb-body');
  }, [activeTab]);

  return (
    <div className="app-shell">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <App activeTab={activeTab} />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
