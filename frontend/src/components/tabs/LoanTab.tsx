import { useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';

type LoanType = 'car' | 'home';

type LoanPeriodOption = {
  label: string;
  value: number;
};

const loanTypeOptions: Array<{ label: string; value: LoanType }> = [
  { label: 'Car', value: 'car' },
  { label: 'Home', value: 'home' },
];

const loanPeriods: Record<LoanType, LoanPeriodOption[]> = {
  car: [
    { label: '5 years', value: 5 },
    { label: '7 years', value: 7 },
    { label: '9 years', value: 9 },
  ],
  home: [{ label: '35 years', value: 35 }],
};

const annualInterestRateByType: Record<LoanType, number> = {
  car: 3,
  home: 4,
};

const salaryRatios = [
  { label: '30% of salary', ratio: 0.3 },
  { label: '20% of salary', ratio: 0.2 },
  { label: '10% of salary', ratio: 0.1 },
];

type LoanComparisonResult = {
  years: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
};

type LoanCalculation = {
  loanAmount: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  salarySuggestions: Array<{ label: string; salary: number }>;
  comparisons: LoanComparisonResult[];
};

function calculateMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate <= 0) {
    return principal / months;
  }

  const growth = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * growth) / (growth - 1);
}

export default function LoanTab() {
  const [loanType, setLoanType] = useState<LoanType>('car');
  const [itemPrice, setItemPrice] = useState<number | null>(null);
  const [downPayment, setDownPayment] = useState<number | null>(null);
  const [loanPeriodYears, setLoanPeriodYears] = useState<number>(5);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(annualInterestRateByType.car);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null);
  const [loanError, setLoanError] = useState('');

  const currentPeriodOptions = loanPeriods[loanType];

  const estimatedLoanAmount = useMemo(() => {
    const normalizedItemPrice = itemPrice ?? 0;
    const normalizedDownPayment = downPayment ?? 0;
    return Math.max(normalizedItemPrice - normalizedDownPayment, 0);
  }, [itemPrice, downPayment]);

  const clearCalculation = () => {
    setCalculation(null);
    setLoanError('');
  };

  const calculateLoan = () => {
    if (!itemPrice || itemPrice <= 0) {
      setLoanError('Please enter a valid item price.');
      setCalculation(null);
      return;
    }

    if ((downPayment ?? 0) < 0) {
      setLoanError('Down payment cannot be negative.');
      setCalculation(null);
      return;
    }

    if ((downPayment ?? 0) > itemPrice) {
      setLoanError('Down payment cannot exceed item price.');
      setCalculation(null);
      return;
    }

    if (annualInterestRate < 0) {
      setLoanError('Interest rate cannot be negative.');
      setCalculation(null);
      return;
    }

    if (estimatedLoanAmount <= 0) {
      setLoanError('Loan amount must be greater than RM 0.00.');
      setCalculation(null);
      return;
    }

    const monthlyPayment = calculateMonthlyPayment(estimatedLoanAmount, annualInterestRate, loanPeriodYears);
    const totalPayment = monthlyPayment * loanPeriodYears * 12;
    const totalInterest = totalPayment - estimatedLoanAmount;
    const salarySuggestions = salaryRatios.map(({ label, ratio }) => ({
      label,
      salary: monthlyPayment / ratio,
    }));

    const periodsForComparison = comparisonMode
      ? currentPeriodOptions.map((option) => option.value)
      : [loanPeriodYears];

    const comparisons = periodsForComparison.map((years) => {
      const monthly = calculateMonthlyPayment(estimatedLoanAmount, annualInterestRate, years);
      const total = monthly * years * 12;
      return {
        years,
        monthlyPayment: monthly,
        totalPayment: total,
        totalInterest: total - estimatedLoanAmount,
      };
    });

    setLoanError('');
    setCalculation({
      loanAmount: estimatedLoanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      salarySuggestions,
      comparisons,
    });
  };

  const resetForm = () => {
    setLoanType('car');
    setItemPrice(null);
    setDownPayment(null);
    setLoanPeriodYears(5);
    setAnnualInterestRate(annualInterestRateByType.car);
    setComparisonMode(true);
    setCalculation(null);
    setLoanError('');
  };

  return (
    <main className="theme-loan">
      <section className="hero-section">
        <div className="hero-chip">
          <i className="pi pi-home"></i>
          <span>Loan Affordability & Salary Planner</span>
        </div>

        <h1>Loan Affordability</h1>
        <p>
          Estimate monthly loan payments for cars or homes and get salary targets based on
          repayment ratios.
        </p>
      </section>

      <section className="grid app-content">
        <div className="col-12 lg:col-7">
          <Card className="surface-card calculator-card">
            <div className="card-title-row">
              {/* <h2>Loan Inputs</h2> */}
              <span className="income-pill">Rate: {annualInterestRate.toFixed(2)}% p.a.</span>
            </div>

            <form
              className="calculator-form"
              onSubmit={(event) => {
                event.preventDefault();
                calculateLoan();
              }}
            >
              <div className="grid">
                <div className="col-12 md:col-6">
                  <div className="field mb-0">
                    <label htmlFor="loan-type" className="required-field">
                      Item Type
                    </label>
                    <Dropdown
                      id="loan-type"
                      value={loanType}
                      onChange={(event) => {
                        const nextType = event.value as LoanType;
                        setLoanType(nextType);
                        setLoanPeriodYears(loanPeriods[nextType][0].value);
                        setAnnualInterestRate(annualInterestRateByType[nextType]);
                        clearCalculation();
                      }}
                      options={loanTypeOptions}
                      optionLabel="label"
                      optionValue="value"
                      className="w-full loan-dropdown-plain"
                    />
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field mb-0">
                    <label htmlFor="loan-period" className="required-field">
                      Loan Period
                    </label>
                    <Dropdown
                      id="loan-period"
                      value={loanPeriodYears}
                      onChange={(event) => {
                        setLoanPeriodYears(event.value as number);
                        clearCalculation();
                      }}
                      options={currentPeriodOptions}
                      optionLabel="label"
                      optionValue="value"
                      className="w-full loan-dropdown-plain"
                    />
                  </div>
                </div>
              </div>

              <div className="field">
                <label htmlFor="loan-rate" className="required-field">
                  Annual Interest Rate (%)
                </label>
                <InputNumber
                  id="loan-rate"
                  value={annualInterestRate}
                  onChange={(event) => {
                    setAnnualInterestRate(event.value ?? 0);
                    clearCalculation();
                  }}
                  min={0}
                  max={100}
                  minFractionDigits={0}
                  maxFractionDigits={2}
                  suffix=" %"
                  placeholder="e.g. 3.00"
                  className="w-full"
                />
              </div>

              <div className="grid">
                <div className="col-12 md:col-6">
                  <div className="field mb-0">
                    <label htmlFor="item-price" className="required-field">
                      Item Price (RM)
                    </label>
                    <InputNumber
                      id="item-price"
                      value={itemPrice}
                      onChange={(event) => {
                        setItemPrice(event.value ?? null);
                        clearCalculation();
                      }}
                      mode="currency"
                      currency="MYR"
                      locale="en-MY"
                      placeholder="e.g. 50,000"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field mb-0">
                    <label htmlFor="down-payment">Down Payment (RM)</label>
                    <InputNumber
                      id="down-payment"
                      value={downPayment}
                      onChange={(event) => {
                        setDownPayment(event.value ?? null);
                        clearCalculation();
                      }}
                      mode="currency"
                      currency="MYR"
                      locale="en-MY"
                      placeholder="Optional"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="loan-amount-preview">
                <span>Estimated Loan Amount</span>
                <strong>
                  RM{' '}
                  {estimatedLoanAmount.toLocaleString('en-MY', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>

              <div className="loan-option-toggle">
                <input
                  id="comparison-mode"
                  type="checkbox"
                  checked={comparisonMode}
                  onChange={(event) => {
                    setComparisonMode(event.currentTarget.checked);
                    clearCalculation();
                  }}
                />
                <label htmlFor="comparison-mode">Comparison mode</label>
              </div>

              <div className="action-row">
                <Button
                  type="submit"
                  label="Calculate"
                  icon="pi pi-calculator"
                  className="calculate-btn"
                  disabled={!itemPrice || itemPrice <= 0}
                />
                <Button
                  type="button"
                  label="Reset"
                  icon="pi pi-refresh"
                  text
                  className="reset-btn"
                  onClick={resetForm}
                />
              </div>

              {loanError && <p className="error">{loanError}</p>}
            </form>
          </Card>
        </div>

        <div className="col-12 lg:col-5">
          <Card className="surface-card summary-card">
            <h2>Affordability Summary</h2>

            {!calculation && (
              <div className="empty-state">
                <i className="pi pi-chart-bar"></i>
                <p>Enter loan inputs and click Calculate to view affordability insights.</p>
              </div>
            )}

            {calculation && (
              <div className="result-grid">
                <article className="stat-card stat-card--accent">
                  <span>Estimated Monthly Payment</span>
                  <strong>
                    RM{' '}
                    {calculation.monthlyPayment.toLocaleString('en-MY', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </article>

                <article className="stat-card stat-card--green">
                  <span>Loan Amount</span>
                  <strong>
                    RM{' '}
                    {calculation.loanAmount.toLocaleString('en-MY', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </article>

                <article className="deduction-card">
                  <h3>Suggested Monthly Salary</h3>
                  {calculation.salarySuggestions.map((suggestion) => (
                    <div className="deduction-row" key={suggestion.label}>
                      <span>{suggestion.label}</span>
                      <strong>
                        RM{' '}
                        {suggestion.salary.toLocaleString('en-MY', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </div>
                  ))}
                  <div className="deduction-row">
                    <span>Total Estimated Interest</span>
                    <strong>
                      RM{' '}
                      {calculation.totalInterest.toLocaleString('en-MY', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                  <div className="deduction-row total">
                    <span>Total Repayment</span>
                    <strong>
                      RM{' '}
                      {calculation.totalPayment.toLocaleString('en-MY', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                </article>

                <article className="deduction-card">
                  <h3>Period Comparison</h3>
                  <div className="loan-comparison-grid">
                    {calculation.comparisons.map((comparison) => (
                      <div className="loan-comparison-item" key={comparison.years}>
                        <h4>{comparison.years} years</h4>
                        <div className="loan-comparison-row">
                          <span>Monthly</span>
                          <strong>
                            RM{' '}
                            {comparison.monthlyPayment.toLocaleString('en-MY', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </strong>
                        </div>
                        <div className="loan-comparison-row">
                          <span>Interest</span>
                          <strong>
                            RM{' '}
                            {comparison.totalInterest.toLocaleString('en-MY', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </strong>
                        </div>
                        <div className="loan-comparison-row total">
                          <span>Total</span>
                          <strong>
                            RM{' '}
                            {comparison.totalPayment.toLocaleString('en-MY', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            )}
          </Card>
        </div>
      </section>

      <footer className="app-footer">
        <small>
          &copy; 2026 GajiPlanner.my. Loan figures are estimates for planning and not a bank quote.
        </small>
      </footer>
    </main>
  );
}
