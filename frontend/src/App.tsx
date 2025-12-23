import { useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function App() {
  const [salary, setSalary] = useState<number | null>(null);
  const [allowance, setAllowance] = useState<number | null>(null);
  const [bonus, setBonus] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculatePCB = async () => {
    if (!salary || salary <= 0) {
      setError('Please enter a valid salary');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const url = 'http://localhost:3000/pcb/calculate';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlySalary: salary }),
      });

      if (!res.ok) throw new Error('API Error');

      const data = await res.json();
      setResult(data);
      console.log(data);
    } catch (err) {
      setError('Failed to calculate PCB. Please check backend.');
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
    <div className="grid justify-content-center m-4">
      <div className="col-12 md:col-8">
        <Card title="PCB Salary Calculator">
          <div className="field">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                calculatePCB();
              }}
            >
              <label htmlFor="salary">Monthly Salary (RM)</label>

              <InputNumber
                id="salary"
                value={salary}
                onValueChange={(e) => setSalary(e.value ?? null)}
                mode="currency"
                currency="MYR"
                locale="en-MY"
                placeholder="Enter salary"
                className="inputtext-lg w-full"
                onKeyDown={(e) => e.key === 'Enter' && calculatePCB()}
              />

              <div className="grid">
                {/* for left side */}
                <div className="col-6 py-3">
                  <label htmlFor="allowance">Allowance (RM)</label>

                  <InputNumber
                    id="allowance"
                    value={allowance}
                    onValueChange={(e) => setAllowance(e.value ?? null)}
                    mode="currency"
                    currency="MYR"
                    locale="en-MY"
                    placeholder="Enter allowance"
                    className="inputtext-lg w-full"
                    onKeyDown={(e) => e.key === 'Enter' && calculatePCB()}
                  />
                </div>

                {/* for right side */}
                <div className="col-6 py-3">
                  <label htmlFor="allowance">Bonus (RM)</label>

                  <InputNumber
                    id="bonus"
                    value={bonus}
                    onValueChange={(e) => setBonus(e.value ?? null)}
                    mode="currency"
                    currency="MYR"
                    locale="en-MY"
                    placeholder="Enter bonus"
                    className="inputtext-lg w-full"
                    onKeyDown={(e) => e.key === 'Enter' && calculatePCB()}
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="flex gap-3">
            <Button
              rounded
              label="Calculate"
              icon="pi pi-check"
              className="my-3"
              onClick={calculatePCB}
              disabled={loading}
            />

            <Button
              text
              label="Reset"
              icon="pi pi-refresh"
              className="my-3"
              onClick={resetForm}
              disabled={loading}
            />
          </div>

          {loading && (
            <div className="flex justify-content-center mt-3">
              <ProgressSpinner />
            </div>
          )}

          {error && <p className="error mt-3">{error}</p>}

          {result && (
            <div className="grid">
              <div className="col-6">
                {/* <Card>
                  <p>
                    <strong>Annual Salary:</strong> RM {result.annualSalary}
                  </p>
                  <p>
                    <strong>Chargeable Income:</strong> RM {result.chargeableIncome}
                  </p>
                  <p>
                    <strong>Annual Tax:</strong> RM {result.annualTax}
                  </p>
                  <p>
                    <strong>Monthly PCB:</strong> RM {result.monthlyPCB}
                  </p>
                </Card> */}
                <Card className="text-center monthly-pcb-card no-padding-card">
                  <h4 className="text-red-500 mb-2">Monthly PCB</h4>
                  <h2 className="text-red-600">RM {result.monthlyPCB.toFixed(2)}</h2>
                </Card>
              </div>

              <div className="col-6">
                <Card className="text-center nett-salary-card no-padding-card">
                  <h4 className="text-red-500 mb-2">Net Salary</h4>
                  <h2 className="text-red-600">RM {result.monthlyPCB.toFixed(2)}</h2>
                </Card>
              </div>
              <div className="col-12">
                <Card className="text-center no-padding-card">
                  <h4 className="text-red-500 mb-3">Monthly Deductions</h4>

                  <div className="flex justify-content-between mx-3">
                    <div className="flex flex-column">
                      <span>EPF</span>
                      <span className="font-bold" style={{ fontSize: '18px', color: '#f71212ff' }}>
                        RM {result.epf.toFixed(2)}
                      </span>
                      <span style={{ fontSize: '12px' }}>11%</span>
                    </div>

                    <div className="flex flex-column">
                      <span>SOCSO</span>
                      <span className="font-bold" style={{ fontSize: '18px', color: '#0070f9ff' }}>
                        RM {result.socso.toFixed(2)}
                      </span>
                      <span style={{ fontSize: '12px' }}>0.5%</span>
                    </div>

                    <div className="flex flex-column">
                      <span>EIS</span>
                      <span
                        className="font-bold"
                        style={{ fontSize: '18px', color: '#15803cd8' }}
                        >
                          RM {result.eis.toFixed(2)}
                      </span>
                      <span style={{ fontSize: '12px' }}>0.2%</span>
                    </div>

                    <div className="flex flex-column">
                      <span>PCB</span>
                      <span className="font-bold" style={{ fontSize: '18px', color: '#f9b406ff' }}>
                        RM {result.monthlyPCB.toFixed(2)}
                      </span>
                      <span style={{ fontSize: '12px' }}>1.0%</span>
                    </div>
                  </div>

                  <div className="flex flex-column">
                    <span>Total</span>
                    <span className="font-bold" style={{ fontSize: '18px' }}>
                      RM {result.totalDeductions.toFixed(2)}
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
