import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import type { EPFResult } from '../../types/epf';

type EpfTabProps = {
  epfSalary: number | null;
  epfIncrement: number | null;
  epfDividend: number | null;
  epfBonusMonths: number | null;
  epfAge: number | null;
  epfResult: EPFResult | null;
  epfError: string;
  onEpfSalaryChange: (value: number | null) => void;
  onEpfIncrementChange: (value: number | null) => void;
  onEpfDividendChange: (value: number | null) => void;
  onEpfBonusMonthsChange: (value: number | null) => void;
  onEpfAgeChange: (value: number | null) => void;
  onCalculate: () => void;
  onReset: () => void;
};

export default function EpfTab({
  epfSalary,
  epfIncrement,
  epfDividend,
  epfBonusMonths,
  epfAge,
  epfResult,
  epfError,
  onEpfSalaryChange,
  onEpfIncrementChange,
  onEpfDividendChange,
  onEpfBonusMonthsChange,
  onEpfAgeChange,
  onCalculate,
  onReset,
}: EpfTabProps) {
  return (
    <main className="theme-epf">
      <section className="hero-section">
        <div className="hero-chip">
          <i className="pi pi-bolt"></i>
          <span>Malaysia Salary & EPF Companion</span>
        </div>

        <h1>EPF Calculator</h1>
        <p>Project your EPF savings at age 60 based on salary, growth, and dividend assumptions.</p>
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
                onCalculate();
              }}
            >
              <div className="field">
                <label htmlFor="epf-salary" className="required-field">
                  Monthly Salary (RM)
                </label>
                <InputNumber
                  id="epf-salary"
                  value={epfSalary}
                  onChange={(event) => onEpfSalaryChange(event.value ?? null)}
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
                    <label htmlFor="epf-increment" className="required-field">
                      Yearly Increment (%)
                    </label>
                    <InputNumber
                      id="epf-increment"
                      value={epfIncrement}
                      onChange={(event) => onEpfIncrementChange(event.value ?? null)}
                      min={0}
                      max={100}
                      minFractionDigits={0}
                      maxFractionDigits={2}
                      placeholder="e.g. 3"
                      suffix=" %"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field mb-0">
                    <label htmlFor="epf-dividend" className="required-field">
                      Expected Yearly Dividend (%)
                    </label>
                    <InputNumber
                      id="epf-dividend"
                      value={epfDividend}
                      onChange={(event) => onEpfDividendChange(event.value ?? null)}
                      min={0}
                      max={100}
                      minFractionDigits={0}
                      maxFractionDigits={2}
                      placeholder="e.g. 6"
                      suffix=" %"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="grid">
                <div className="col-12 md:col-6">
                  <div className="field mb-0">
                    <label htmlFor="epf-age" className="required-field">
                      Current Age
                    </label>
                    <InputNumber
                      id="epf-age"
                      value={epfAge}
                      onChange={(event) => onEpfAgeChange(event.value ?? null)}
                      minFractionDigits={0}
                      maxFractionDigits={0}
                      placeholder="e.g. 30"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field mb-0">
                    <label htmlFor="epf-bonus-months">Yearly Bonus (Months of Salary)</label>
                    <InputNumber
                      id="epf-bonus-months"
                      value={epfBonusMonths}
                      onChange={(event) => onEpfBonusMonthsChange(event.value ?? null)}
                      min={0}
                      minFractionDigits={0}
                      maxFractionDigits={2}
                      placeholder="e.g. 2.5"
                      suffix=" months"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="action-row">
                <Button
                  type="submit"
                  label="Project to Age 60"
                  icon="pi pi-calculator"
                  className="calculate-btn"
                  disabled={!epfSalary || epfSalary <= 0 || !epfAge}
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

            {epfError && <p className="error">{epfError}</p>}
          </Card>
        </div>

        <div className="col-12 lg:col-5">
          <Card className="surface-card summary-card">
            <h2>Calculation Summary</h2>

            {!epfResult && (
              <div className="empty-state">
                <i className="pi pi-chart-bar"></i>
                <p>Enter your assumptions to estimate your EPF savings when you turn 60.</p>
              </div>
            )}

            {epfResult && (
              <div className="result-grid">
                <article className="stat-card stat-card--accent">
                  <span>Projected EPF Savings at 60</span>
                  <strong>
                    RM{' '}
                    {epfResult.projectedSavingsAt60.toLocaleString('en-MY', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </article>

                <article className="stat-card stat-card--green">
                  <span>Years to Retirement</span>
                  <strong>{epfResult.yearsToRetirement} years</strong>
                </article>

                <article className="deduction-card">
                  <h3>Projection Breakdown</h3>
                  <div className="deduction-row">
                    <span>Employee Contributions (11%)</span>
                    <strong>
                      RM{' '}
                      {epfResult.totalEmployeeContributions.toLocaleString('en-MY', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                  <div className="deduction-row">
                    <span>Employer Contributions (13%)</span>
                    <strong>
                      RM{' '}
                      {epfResult.totalEmployerContributions.toLocaleString('en-MY', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                  <div className="deduction-row">
                    <span>Total EPF Contributions (24%)</span>
                    <strong>
                      RM{' '}
                      {epfResult.totalContributions.toLocaleString('en-MY', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                  <div className="deduction-row">
                    <span>Estimated Dividends Earned</span>
                    <strong>
                      RM{' '}
                      {epfResult.estimatedDividends.toLocaleString('en-MY', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                  <div className="deduction-row">
                    <span>Bonus Assumption</span>
                    <strong>
                      {epfResult.bonusMode === 'months' &&
                        `${epfResult.bonusMonths.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} months/year`}
                      {epfResult.bonusMode === 'none' && 'None'}
                    </strong>
                  </div>
                </article>

                <article className="deduction-card">
                  <h3>Projected Salary Milestones</h3>
                  {epfResult.salaryMilestones.map((milestone) => (
                    <div className="deduction-row" key={milestone.age}>
                      <span>Salary at age {milestone.age}</span>
                      <strong>
                        RM{' '}
                        {milestone.salary.toLocaleString('en-MY', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </div>
                  ))}
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
