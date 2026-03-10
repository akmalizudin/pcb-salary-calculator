import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import type { PcbResult } from '../../utils/calculatePcb';

type PcbTabProps = {
  salary: number | null;
  allowance: number | null;
  bonus: number | null;
  totalIncome: number;
  grossThisMonth: number;
  pcbResult: PcbResult | null;
  pcbError: string;
  onSalaryChange: (value: number | null) => void;
  onAllowanceChange: (value: number | null) => void;
  onBonusChange: (value: number | null) => void;
  onCalculate: () => void;
  onReset: () => void;
};

export default function PcbTab({
  salary,
  allowance,
  bonus,
  totalIncome,
  grossThisMonth,
  pcbResult,
  pcbError,
  onSalaryChange,
  onAllowanceChange,
  onBonusChange,
  onCalculate,
  onReset,
}: PcbTabProps) {
  return (
    <main className="theme-pcb">
      <section className="hero-section">
        <div className="hero-chip">
          <i className="pi pi-receipt"></i>
          <span>PCB Tax & Payroll Estimator</span>
        </div>

        <h1>PCB Calculator</h1>
        <p>Fast monthly tax estimates for PCB, EPF, SOCSO, and EIS in one streamlined view.</p>
      </section>

      <section className="grid app-content">
        <div className="col-12 lg:col-7">
          <Card className="surface-card calculator-card">
            <div className="card-title-row">
              {/* <h2>Income Inputs</h2> */}
              <span className="income-pill">Estimated Annual Gross: RM {totalIncome.toFixed(2)}</span>
            </div>

            <form
              className="calculator-form"
              onSubmit={(event) => {
                event.preventDefault();
                onCalculate();
              }}
            >
              <div className="field">
                <label htmlFor="salary" className="required-field">
                  Monthly Salary (RM)
                </label>
                <InputNumber
                  id="salary"
                  value={salary}
                  onChange={(event) => onSalaryChange(event.value ?? null)}
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
                      onChange={(event) => onAllowanceChange(event.value ?? null)}
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
                      onChange={(event) => onBonusChange(event.value ?? null)}
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
                  disabled={!salary || salary <= 0}
                />
                <Button
                  type="button"
                  label="Reset"
                  icon="pi pi-refresh"
                  text
                  className="reset-btn"
                  onClick={onReset}
                />
              </div>
            </form>

            {pcbError && <p className="error">{pcbError}</p>}
          </Card>
        </div>

        <div className="col-12 lg:col-5">
          <Card className="surface-card summary-card">
            <h2>Calculation Summary</h2>

            {!pcbResult && (
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
          &copy; 2026 GajiPlanner.my. Independent calculator, not affiliated with LHDN Malaysia.
        </small>
      </footer>
    </main>
  );
}
