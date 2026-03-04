import { Card } from 'primereact/card';

export default function AboutTab() {
  return (
    <main className="theme-about">
      <section className="hero-section hero-section-about">
        <h1>About GajiPlanner.my</h1>
        <p>Simple salary planning tools for PCB estimation and EPF long-term projection.</p>
      </section>

      <section className="grid app-content">
        <div className="col-12">
          <Card className="surface-card about-article">
            <h2>About This Calculator</h2>
            <p>
              This page provides two simple tools for salary planning in Malaysia. The PCB
              calculator estimates monthly deductions, and the EPF calculator projects long-term
              savings to age 60 based on your salary growth and dividend assumptions.
            </p>
            <h3>References</h3>
            <p>
              The calculations are based on public guidance and schedules from LHDN (for PCB) and
              KWSP/EPF (for contribution rates and dividend context), together with the assumptions
              you enter in the form.
            </p>
            <h3>Disclaimer</h3>
            <p>
              This tool is for estimation and planning only. It is not official tax or financial
              advice. Actual payroll, PCB, and EPF figures may differ depending on policy updates,
              payroll settings, reliefs, and personal employment details.
            </p>
          </Card>
        </div>
      </section>

      <footer className="app-footer">
        <small>
          &copy; 2026 GajiPlanner.my. Independent calculator, not affiliated with LHDN Malaysia
          or KWSP.
        </small>
      </footer>
    </main>
  );
}
