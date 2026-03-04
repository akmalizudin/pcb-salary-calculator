import { useMemo, useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';

type CalculatorTab = 'pcb' | 'epf' | 'about';

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
  projectedSavingsAt60: number;
  totalContributions: number;
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  estimatedDividends: number;
  yearsToRetirement: number;
  salaryMilestones: Array<{
    age: number;
    salary: number;
  }>;
};

export default function App({ activeTab }: AppProps) {
  const EPF_EMPLOYEE_CONTRIBUTION_RATE = 0.11;
  const EPF_EMPLOYER_CONTRIBUTION_RATE = 0.13;
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

  const [salary, setSalary] = useState<number | null>(null);
  const [allowance, setAllowance] = useState<number | null>(null);
  const [bonus, setBonus] = useState<number | null>(null);
  const [pcbResult, setPcbResult] = useState<PCBResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [pcbError, setPcbError] = useState('');

  const [epfSalary, setEpfSalary] = useState<number | null>(null);
  const [epfIncrement, setEpfIncrement] = useState<number | null>(3);
  const [epfDividend, setEpfDividend] = useState<number | null>(6);
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

  const calculatePCB = async () => {
    if (!salary || salary <= 0) {
      setPcbError('Please enter a valid monthly salary');
      return;
    }

    setLoading(true);
    setPcbError('');
    setPcbResult(null);

    try {
      const res = await fetch(`${apiBaseUrl}/pcb/calculate`, {
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

    if (!epfAge || epfAge < 16 || epfAge >= 60) {
      setEpfError('Please enter a valid age between 16 and 59');
      return;
    }

    const incrementRate = (epfIncrement ?? 0) / 100;
    if (incrementRate < 0 || incrementRate > 1) {
      setEpfError('Please enter a valid yearly increment between 0% and 100%');
      return;
    }

    const dividendRate = (epfDividend ?? 0) / 100;
    if (dividendRate < 0 || dividendRate > 1) {
      setEpfError('Please enter a valid yearly dividend between 0% and 100%');
      return;
    }

    const monthsToRetirement = (60 - epfAge) * 12;
    const monthlyDividendRate = Math.pow(1 + dividendRate, 1 / 12) - 1;

    let currentMonthlySalary = epfSalary;
    let projectedSavings = 0;
    let totalContributions = 0;
    let totalEmployeeContributions = 0;
    let totalEmployerContributions = 0;

    for (let month = 1; month <= monthsToRetirement; month += 1) {
      const employeeMonthlyContribution = currentMonthlySalary * EPF_EMPLOYEE_CONTRIBUTION_RATE;
      const employerMonthlyContribution = currentMonthlySalary * EPF_EMPLOYER_CONTRIBUTION_RATE;
      const monthlyContribution = employeeMonthlyContribution + employerMonthlyContribution;

      totalEmployeeContributions += employeeMonthlyContribution;
      totalEmployerContributions += employerMonthlyContribution;
      totalContributions += monthlyContribution;
      projectedSavings += monthlyContribution;
      projectedSavings *= 1 + monthlyDividendRate;

      if (month % 12 === 0) {
        currentMonthlySalary *= 1 + incrementRate;
      }
    }

    const targetAges = [30, 40, 50, 60];
    const salaryMilestones = targetAges
      .filter((targetAge) => {
        if (targetAge === 30) {
          return epfAge < 30;
        }

        return epfAge < targetAge;
      })
      .map((targetAge) => ({
        age: targetAge,
        salary: epfSalary * Math.pow(1 + incrementRate, targetAge - epfAge),
      }));

    setEpfError('');
    setEpfResult({
      projectedSavingsAt60: projectedSavings,
      totalContributions,
      totalEmployeeContributions,
      totalEmployerContributions,
      estimatedDividends: projectedSavings - totalContributions,
      yearsToRetirement: 60 - epfAge,
      salaryMilestones,
    });
  };

  const resetEPFForm = () => {
    setEpfSalary(null);
    setEpfIncrement(3);
    setEpfDividend(6);
    setEpfAge(null);
    setEpfResult(null);
    setEpfError('');
  };

  if (activeTab === 'about') {
    return (
      <main className="theme-about">
        <section className="hero-section hero-section-about">
          {/* <div className="hero-chip">
            <i className="pi pi-info-circle"></i>
            <span>About This Tool</span>
          </div> */}

          <h1>About Malaysia Salary Calculator</h1>
          <p>Simple salary planning tools for PCB estimation and EPF long-term projection.</p>
        </section>

        <section className="grid app-content">
          <div className="col-12">
            <Card className="surface-card about-article">
              <h2>About This Calculator</h2>
              <p>
                This page provides two simple tools for salary planning in Malaysia.
                The PCB calculator estimates monthly deductions, and the EPF calculator
                projects long-term savings to age 60 based on your salary growth and dividend assumptions.
              </p>
              <h3>References</h3>
              <p>
                The calculations are based on public guidance and schedules from
                LHDN (for PCB) and KWSP/EPF (for contribution rates and dividend context),
                together with the assumptions you enter in the form.
              </p>
              <h3>Disclaimer</h3>
              <p>
                This tool is for estimation and planning only. It is not official tax or financial advice.
                Actual payroll, PCB, and EPF figures may differ depending on policy updates,
                payroll settings, reliefs, and personal employment details.
              </p>
            </Card>
          </div>
        </section>

        <footer className="app-footer">
          <small>
            &copy; 2026 PCBCalculator.my. Independent calculator, not affiliated with LHDN Malaysia or KWSP.
          </small>
        </footer>
      </main>
    );
  }

  if (activeTab === 'epf') {
    return (
      <main className="theme-epf">
        <section className="hero-section">
          <div className="hero-chip">
            <i className="pi pi-bolt"></i>
            <span>Malaysia Salary & PCB Companion</span>
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

                <div className="grid">
                  <div className="col-12 md:col-6">
                    <div className="field mb-0">
                      <label htmlFor="epf-increment" className="required-field">
                        Yearly Increment (%)
                      </label>
                      <InputNumber
                        id="epf-increment"
                        value={epfIncrement}
                        onChange={(event) => setEpfIncrement(event.value ?? null)}
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
                        onChange={(event) => setEpfDividend(event.value ?? null)}
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

                <div className="field mb-0">
                  <label htmlFor="epf-age" className="required-field">
                    Current Age
                  </label>
                  <InputNumber
                    id="epf-age"
                    value={epfAge}
                    onChange={(event) => setEpfAge(event.value ?? null)}
                    minFractionDigits={0}
                    maxFractionDigits={0}
                    placeholder="e.g. 30"
                    className="w-full"
                  />
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
                  <p>Enter your assumptions to estimate your EPF savings when you turn 60.</p>
                </div>
              )}

              {epfResult && (
                <div className="result-grid">
                  <article className="stat-card stat-card--accent">
                    <span>Projected EPF Savings at 60</span>
                    <strong>
                      RM {epfResult.projectedSavingsAt60.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      <strong>RM {epfResult.totalContributions.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="deduction-row">
                      <span>Estimated Dividends Earned</span>
                      <strong>RM {epfResult.estimatedDividends.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
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
