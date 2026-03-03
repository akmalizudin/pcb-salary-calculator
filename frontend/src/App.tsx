import { useMemo, useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';

type CalculatorTab = 'pcb' | 'epf';

type AppProps = {
  activeTab: CalculatorTab;
};

type PCBResult = {
  monthlyPCB: number;
  baseMonthlyPcb: number;
  additionalBonusPcb: number;
  netSalary: number;
  epf: number;
  socso: number;
  eis: number;
  totalDeductions: number;
  currentMonthGross?: number;
};

type EPFResult = {
  monthlyContribution: number;
  annualContribution: number;
  monthlyTakeHomeAfterEPF: number;
};

export default function App({ activeTab }: AppProps) {
  const [salary, setSalary] = useState<number | null>(null);
  const [allowance, setAllowance] = useState<number | null>(null);
  const [bonus, setBonus] = useState<number | null>(null);
  const [pcbResult, setPcbResult] = useState<PCBResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [pcbError, setPcbError] = useState('');

  const [epfSalary, setEpfSalary] = useState<number | null>(null);
  const [epfRate, setEpfRate] = useState<number | null>(11);
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

  const calculatePCB = async () => {
    if (!salary || salary <= 0) {
      setPcbError('Please enter a valid monthly salary');
      return;
    }

    setLoading(true);
    setPcbError('');
    setPcbResult(null);

    try {
      const res = await fetch('http://localhost:3000/pcb/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlySalary: salary,
          allowance: allowance ?? 0,
          bonus: bonus ?? 0,
        }),
      });

      if (!res.ok) {
        throw new Error('API error');
      }

      const data: PCBResult = await res.json();
      setPcbResult(data);
    } catch {
      setPcbError('Failed to calculate PCB. Please check backend connection.');
    } finally {
      setLoading(false);
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
    if (!epfSalary || epfSalary <= 0) {
      setEpfError('Please enter a valid monthly salary');
      return;
    }

    const rate = (epfRate ?? 0) / 100;
    if (rate <= 0 || rate > 1) {
      setEpfError('Please enter a valid EPF rate between 0 and 100');
      return;
    }

    const monthlyContribution = epfSalary * rate;

    setEpfError('');
    setEpfResult({
      monthlyContribution,
      annualContribution: monthlyContribution * 12,
      monthlyTakeHomeAfterEPF: epfSalary - monthlyContribution,
    });
  };

  const resetEPFForm = () => {
    setEpfSalary(null);
    setEpfRate(11);
    setEpfResult(null);
    setEpfError('');
  };

  if (activeTab === 'epf') {
    return (
      <main className="theme-epf">
        <section className="hero-section">
          <div className="hero-chip">
            <i className="pi pi-bolt"></i>
            <span>Malaysia Salary & PCB Companion</span>
          </div>

          <h1>EPF Calculator</h1>
          <p>Estimate your monthly and annual employee EPF contribution instantly.</p>
        </section>

        <section className="grid app-content">
          <div className="col-12 lg:col-7">
            <Card className="surface-card calculator-card">
              <div className="card-title-row">
                <h2>EPF Inputs</h2>
              </div>

              <form
                className="calculator-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  calculateEPF();
                }}
              >
                <div className="field">
                  <label htmlFor="epf-salary" className="required-field">
                    Monthly Salary (RM)
                  </label>
                  <InputNumber
                    id="epf-salary"
                    value={epfSalary}
                    onChange={(event) => setEpfSalary(event.value ?? null)}
                    mode="currency"
                    currency="MYR"
                    locale="en-MY"
                    placeholder="e.g. 4500"
                    className="w-full"
                  />
                </div>

                <div className="field mb-0">
                  <label htmlFor="epf-rate" className="required-field">
                    Employee EPF Rate (%)
                  </label>
                  <InputNumber
                    id="epf-rate"
                    value={epfRate}
                    onChange={(event) => setEpfRate(event.value ?? null)}
                    min={1}
                    max={100}
                    minFractionDigits={0}
                    maxFractionDigits={2}
                    placeholder="e.g. 11"
                    suffix=" %"
                    className="w-full"
                  />
                </div>

                <div className="action-row">
                  <Button
                    type="submit"
                    label="Calculate EPF"
                    icon="pi pi-calculator"
                    className="calculate-btn"
                    disabled={!epfSalary || epfSalary <= 0}
                  />
                  <Button
                    type="button"
                    label="Reset"
                    icon="pi pi-refresh"
                    text
                    className="reset-btn"
                    onClick={resetEPFForm}
                  />
                </div>
              </form>

              {epfError && <p className="error">{epfError}</p>}
            </Card>
          </div>

          <div className="col-12 lg:col-5">
            <Card className="surface-card summary-card">
              <h2>Calculation Summary</h2>

              {!epfResult && (
                <div className="empty-state">
                  <i className="pi pi-chart-bar"></i>
                  <p>Enter salary and EPF rate to estimate your contribution.</p>
                </div>
              )}

              {epfResult && (
                <div className="result-grid">
                  <article className="stat-card stat-card--accent">
                    <span>Monthly EPF Contribution</span>
                    <strong>RM {epfResult.monthlyContribution.toFixed(2)}</strong>
                  </article>

                  <article className="stat-card stat-card--green">
                    <span>Monthly Salary After EPF</span>
                    <strong>RM {epfResult.monthlyTakeHomeAfterEPF.toFixed(2)}</strong>
                  </article>

                  <article className="deduction-card">
                    <h3>Contribution Breakdown</h3>
                    <div className="deduction-row">
                      <span>Annual EPF Contribution</span>
                      <strong>RM {epfResult.annualContribution.toFixed(2)}</strong>
                    </div>
                  </article>
                </div>
              )}
            </Card>
          </div>
        </section>

        <footer className="app-footer">
          <small>
            &copy; 2026 PCBCalculator.my. Independent calculator, not affiliated with LHDN Malaysia.
          </small>
        </footer>
      </main>
    );
  }

  return (
    <main className="theme-pcb">
      <section className="hero-section">
        <div className="hero-chip">
          <i className="pi pi-bolt"></i>
          <span>Malaysia Salary & PCB Companion</span>
        </div>

        <h1>PCB Salary Calculator</h1>
        <p>
          Fast monthly tax estimates for PCB, EPF, SOCSO, and EIS in one streamlined view.
        </p>
      </section>

      <section className="grid app-content">
        <div className="col-12 lg:col-7">
          <Card className="surface-card calculator-card">
            <div className="card-title-row">
              <h2>Income Inputs</h2>
              <span className="income-pill">Estimated Annual Gross: RM {totalIncome.toFixed(2)}</span>
            </div>

            <form
              className="calculator-form"
              onSubmit={(event) => {
                event.preventDefault();
                calculatePCB();
              }}
            >
              <div className="field">
                <label htmlFor="salary" className="required-field">
                  Monthly Salary (RM)
                </label>
                <InputNumber
                  id="salary"
                  value={salary}
                  onChange={(event) => setSalary(event.value ?? null)}
                  mode="currency"
                  currency="MYR"
                  locale="en-MY"
                  placeholder="e.g. 4500"
                  className="w-full"
                />
              </div>

              <div className="grid">
                <div className="col-12 md:col-6">
                  <div className="field mb-0">
                    <label htmlFor="allowance">Allowance (Recurring / RM)</label>
                    <InputNumber
                      id="allowance"
                      value={allowance}
                      onChange={(event) => setAllowance(event.value ?? null)}
                      mode="currency"
                      currency="MYR"
                      locale="en-MY"
                      placeholder="Optional"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field mb-0">
                    <label htmlFor="bonus">Bonus (One-off / RM)</label>
                    <InputNumber
                      id="bonus"
                      value={bonus}
                      onChange={(event) => setBonus(event.value ?? null)}
                      mode="currency"
                      currency="MYR"
                      locale="en-MY"
                      placeholder="Optional"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="action-row">
                <Button
                  type="submit"
                  label="Calculate PCB"
                  icon="pi pi-calculator"
                  className="calculate-btn"
                  disabled={loading || !salary || salary <= 0}
                />
                <Button
                  type="button"
                  label="Reset"
                  icon="pi pi-refresh"
                  text
                  className="reset-btn"
                  onClick={resetPCBForm}
                  disabled={loading}
                />
              </div>
            </form>

            {loading && (
              <div className="loading-wrap">
                <ProgressSpinner strokeWidth="5" />
              </div>
            )}

            {pcbError && <p className="error">{pcbError}</p>}
          </Card>
        </div>

        <div className="col-12 lg:col-5">
          <Card className="surface-card summary-card">
            <h2>Calculation Summary</h2>

            {!pcbResult && !loading && (
              <div className="empty-state">
                <i className="pi pi-chart-bar"></i>
                <p>Enter your salary and run calculation to see deductions and net pay.</p>
              </div>
            )}

            {pcbResult && (
              <div className="result-grid">
                <article className="stat-card stat-card--accent">
                  <span>Monthly PCB</span>
                  <strong>RM {pcbResult.monthlyPCB.toFixed(2)}</strong>
                </article>

                <article className="stat-card stat-card--green">
                  <span>Net Salary</span>
                  <strong>RM {pcbResult.netSalary.toFixed(2)}</strong>
                </article>

                <article className="deduction-card">
                  <h3>Deductions Breakdown</h3>
                  <div className="deduction-row">
                    <span>Gross This Month</span>
                    <strong>RM {(pcbResult.currentMonthGross ?? grossThisMonth).toFixed(2)}</strong>
                  </div>
                  <div className="deduction-row">
                    <span>EPF</span>
                    <strong>RM {pcbResult.epf.toFixed(2)}</strong>
                  </div>
                  <div className="deduction-row">
                    <span>SOCSO</span>
                    <strong>RM {pcbResult.socso.toFixed(2)}</strong>
                  </div>
                  <div className="deduction-row">
                    <span>EIS</span>
                    <strong>RM {pcbResult.eis.toFixed(2)}</strong>
                  </div>
                  <div className="deduction-row">
                    <span>PCB (Base)</span>
                    <strong>RM {pcbResult.baseMonthlyPcb.toFixed(2)}</strong>
                  </div>
                  <div className="deduction-row">
                    <span>PCB (Bonus One-off)</span>
                    <strong>RM {pcbResult.additionalBonusPcb.toFixed(2)}</strong>
                  </div>
                  <div className="deduction-row">
                    <span>PCB (Total)</span>
                    <strong>RM {pcbResult.monthlyPCB.toFixed(2)}</strong>
                  </div>
                  <div className="deduction-row total">
                    <span>Total Deductions</span>
                    <strong>RM {pcbResult.totalDeductions.toFixed(2)}</strong>
                  </div>
                </article>
              </div>
            )}
          </Card>
        </div>
      </section>

      <footer className="app-footer">
        <small>
          &copy; 2026 PCBCalculator.my. Independent calculator, not affiliated with LHDN Malaysia.
        </small>
      </footer>
    </main>
  );
}
