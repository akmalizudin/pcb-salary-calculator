# GajiPlanner.my

Malaysia salary planning web app with:
- PCB (monthly tax and deduction estimate)
- EPF projection to age 60
- About page with context and disclaimer

## Live Demo

[GajiPlanner.my (GitHub Pages)](https://akmalizudin.github.io/pcb-salary-calculator/)

## Current Architecture

- Frontend-only for deployed app (React + Vite on GitHub Pages)
- No backend is required for current PCB and EPF calculations
- A NestJS backend folder is still in this repo, but optional

## Features

- PCB calculator (monthly PCB, EPF, SOCSO, EIS, net salary)
- EPF long-term projection (salary growth + dividend assumptions)
- Clean tabbed UI (`PCB`, `EPF`, `About`)

## Tech Stack

- React 19
- TypeScript
- Vite
- PrimeReact + PrimeFlex

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

App URL: `http://localhost:5173`

## Build

```bash
cd frontend
npm run build
```

## Deployment (GitHub Pages)

Deployment is automated via:
`.github/workflows/deploy-frontend-pages.yml`

## Disclaimer

This app is for estimation and planning only, not official tax or financial advice.
Actual payroll and statutory deductions may differ based on latest policy and personal details.

## License

For internal/personal use unless a separate license is added.
