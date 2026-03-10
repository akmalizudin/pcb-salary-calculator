import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import Header from './components/Header.tsx';

type CalculatorTab = 'pcb' | 'epf' | 'loan' | 'about';

function Root() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('pcb');

  useEffect(() => {
    document.body.classList.remove(
      'theme-pcb-body',
      'theme-epf-body',
      'theme-loan-body',
      'theme-about-body',
    );
    if (activeTab === 'epf') {
      document.body.classList.add('theme-epf-body');
      return;
    }

    if (activeTab === 'about') {
      document.body.classList.add('theme-about-body');
      return;
    }

    if (activeTab === 'loan') {
      document.body.classList.add('theme-loan-body');
      return;
    }

    document.body.classList.add('theme-pcb-body');
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
