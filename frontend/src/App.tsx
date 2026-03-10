import { useMemo, useState } from 'react';
import { calculatePcb, type PcbResult } from './utils/calculatePcb';
import type { EPFResult } from './types/epf';
import { calculateEpf } from './utils/calculateEpf';
import AboutTab from './components/tabs/AboutTab';
import EpfTab from './components/tabs/EpfTab';
import LoanTab from './components/tabs/LoanTab';
import PcbTab from './components/tabs/PcbTab';

type CalculatorTab = 'pcb' | 'epf' | 'loan' | 'about';

type AppProps = {
  activeTab: CalculatorTab;
};

export default function App({ activeTab }: AppProps) {
  const [salary, setSalary] = useState<number | null>(null);
  const [allowance, setAllowance] = useState<number | null>(null);
  const [bonus, setBonus] = useState<number | null>(null);
  const [pcbResult, setPcbResult] = useState<PcbResult | null>(null);
  const [pcbError, setPcbError] = useState('');

  const [epfSalary, setEpfSalary] = useState<number | null>(null);
  const [epfIncrement, setEpfIncrement] = useState<number | null>(3);
  const [epfDividend, setEpfDividend] = useState<number | null>(6);
  const [epfBonusMonths, setEpfBonusMonths] = useState<number | null>(null);
  const [epfAge, setEpfAge] = useState<number | null>(null);
  const [epfResult, setEpfResult] = useState<EPFResult | null>(null);
  const [epfError, setEpfError] = useState('');

  const totalIncome = useMemo(
    () => ((salary ?? 0) + (allowance ?? 0)) * 12 + (bonus ?? 0),
    [salary, allowance, bonus],
  );

  const grossThisMonth = useMemo(
    () => (salary ?? 0) + (allowance ?? 0) + (bonus ?? 0),
    [salary, allowance, bonus],
  );

  const calculatePCB = () => {
    if (!salary || salary <= 0) {
      setPcbError('Please enter a valid monthly salary');
      return;
    }

    setPcbError('');
    setPcbResult(null);

    try {
      const result = calculatePcb({
        monthlySalary: salary,
        allowance: allowance ?? 0,
        bonus: bonus ?? 0,
      });
      setPcbResult(result);
    } catch {
      setPcbError('Failed to calculate PCB. Please check input values.');
    }
  };

  const resetPCBForm = () => {
    setSalary(null);
    setAllowance(null);
    setBonus(null);
    setPcbResult(null);
    setPcbError('');
  };

  const calculateEPF = () => {
    const { result, error } = calculateEpf({
      monthlySalary: epfSalary,
      yearlyIncrementPercent: epfIncrement,
      yearlyDividendPercent: epfDividend,
      bonusMonths: epfBonusMonths,
      currentAge: epfAge,
    });

    if (error) {
      setEpfError(error);
      setEpfResult(null);
      return;
    }

    setEpfError('');
    setEpfResult(result);
  };

  const resetEPFForm = () => {
    setEpfSalary(null);
    setEpfIncrement(3);
    setEpfDividend(6);
    setEpfBonusMonths(null);
    setEpfAge(null);
    setEpfResult(null);
    setEpfError('');
  };

  if (activeTab === 'about') {
    return <AboutTab />;
  }

  if (activeTab === 'epf') {
    return (
      <EpfTab
        epfSalary={epfSalary}
        epfIncrement={epfIncrement}
        epfDividend={epfDividend}
        epfBonusMonths={epfBonusMonths}
        epfAge={epfAge}
        epfResult={epfResult}
        epfError={epfError}
        onEpfSalaryChange={setEpfSalary}
        onEpfIncrementChange={setEpfIncrement}
        onEpfDividendChange={setEpfDividend}
        onEpfBonusMonthsChange={setEpfBonusMonths}
        onEpfAgeChange={setEpfAge}
        onCalculate={calculateEPF}
        onReset={resetEPFForm}
      />
    );
  }

  if (activeTab === 'loan') {
    return <LoanTab />;
  }

  return (
    <PcbTab
      salary={salary}
      allowance={allowance}
      bonus={bonus}
      totalIncome={totalIncome}
      grossThisMonth={grossThisMonth}
      pcbResult={pcbResult}
      pcbError={pcbError}
      onSalaryChange={setSalary}
      onAllowanceChange={setAllowance}
      onBonusChange={setBonus}
      onCalculate={calculatePCB}
      onReset={resetPCBForm}
    />
  );
}
