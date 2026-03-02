import { useMemo, useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';

type CalculationResult = {
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

export default function App() {
  const [salary, setSalary] = useState<number | null>(null);
  const [allowance, setAllowance] = useState<number | null>(null);
  const [bonus, setBonus] = useState<number | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalIncome = useMemo(
    () => (salary ? (salary*12) : 0) + (allowance ?? 0) + (bonus ?? 0),
    [salary, allowance, bonus],
  );

  const calculatePCB = async () => {
    if (!salary || salary <= 0) {
      setError('Please enter a valid monthly salary');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

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

      const data: CalculationResult = await res.json();
      setResult(data);
    } catch {
      setError('Failed to calculate PCB. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSalary(null);
    setAllowance(null);
    setBonus(null);
    setResult(null);
    setError('');
  };

  return (
    <main className="app-shell">
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
              <span className="income-pill">Total Income: RM {totalIncome.toFixed(2)}</span>
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
                  onClick={resetForm}
                  disabled={loading}
                />
              </div>
            </form>

            {loading && (
              <div className="loading-wrap">
                <ProgressSpinner strokeWidth="5" />
              </div>
            )}

            {error && <p className="error">{error}</p>}
          </Card>
        </div>

        <div className="col-12 lg:col-5">
          <Card className="surface-card summary-card">
            <h2>Calculation Summary</h2>

            {!result && !loading && (
              <div className="empty-state">
                <i className="pi pi-chart-bar"></i>
                <p>Enter your salary and run calculation to see deductions and net pay.</p>
              </div>
            )}

            {result && (
              <div className="result-grid">
                <article className="stat-card stat-card--accent">
                  <span>Monthly PCB</span>
                  <strong>RM {result.monthlyPCB.toFixed(2)}</strong>
                </article>

                <article className="stat-card stat-card--green">
                  <span>Net Salary</span>
                  <strong>RM {result.netSalary.toFixed(2)}</strong>
                </article>

                <article className="deduction-card">
                  <h3>Deductions Breakdown</h3>
                  <div className="deduction-row">
                    <span>Gross This Month</span>
                    <strong>RM {(result.currentMonthGross ?? totalIncome).toFixed(2)}</strong>
                  </div>
                  <div className="deduction-row">
                    <span>EPF</span>
                    <strong>RM {result.epf.toFixed(2)}</strong>
                  </div>
                  <div className="deduction-row">
                    <span>SOCSO</span>
                    <strong>RM {result.socso.toFixed(2)}</strong>
                  </div>
                  <div className="deduction-row">
                    <span>EIS</span>
                    <strong>RM {result.eis.toFixed(2)}</strong>
                  </div>
                  <div className="deduction-row">
                    <span>PCB (Base)</span>
                    <strong>RM {result.baseMonthlyPcb.toFixed(2)}</strong>
                  </div>
                  <div className="deduction-row">
                    <span>PCB (Bonus One-off)</span>
                    <strong>RM {result.additionalBonusPcb.toFixed(2)}</strong>
                  </div>
                  <div className="deduction-row">
                    <span>PCB (Total)</span>
                    <strong>RM {result.monthlyPCB.toFixed(2)}</strong>
                  </div>
                  <div className="deduction-row total">
                    <span>Total Deductions</span>
                    <strong>RM {result.totalDeductions.toFixed(2)}</strong>
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
