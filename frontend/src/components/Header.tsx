type CalculatorTab = 'pcb' | 'epf' | 'loan' | 'about';

type HeaderProps = {
  activeTab: CalculatorTab;
  onTabChange: (tab: CalculatorTab) => void;
};

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-brand">
        <i className="pi pi-wallet" aria-hidden="true"></i>
        <span>GajiPlanner.my</span>
      </div>

      <div className="header-link" role="tablist" aria-label="Calculator tabs">
        <button
          type="button"
          className={`header-tab ${activeTab === 'pcb' ? 'active' : ''}`}
          onClick={() => onTabChange('pcb')}
          role="tab"
          aria-selected={activeTab === 'pcb'}
        >
          PCB Calculator
        </button>
        <button
          type="button"
          className={`header-tab header-tab-epf ${activeTab === 'epf' ? 'active' : ''}`}
          onClick={() => onTabChange('epf')}
          role="tab"
          aria-selected={activeTab === 'epf'}
        >
          EPF Calculator
        </button>
        <button
          type="button"
          className={`header-tab header-tab-loan ${activeTab === 'loan' ? 'active' : ''}`}
          onClick={() => onTabChange('loan')}
          role="tab"
          aria-selected={activeTab === 'loan'}
        >
          Loan Affordability
        </button>
        <button
          type="button"
          className={`header-tab header-tab-about ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => onTabChange('about')}
          role="tab"
          aria-selected={activeTab === 'about'}
        >
          About
        </button>
      </div>
    </header>
  );
}
