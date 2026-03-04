# PCB Salary Calculator (Monorepo)

A monorepo for a Malaysia salary planning tool with:
- `frontend`: React + Vite UI for PCB and EPF calculators
- `backend`: NestJS API (optional, retained in repo)

## Project Structure

```text
.
├── frontend/   # React app (PCB, EPF, About)
└── backend/    # NestJS API (PCB endpoints)
```

## Tech Stack

- Frontend: React 19, TypeScript, Vite, PrimeReact
- Backend: NestJS 11, TypeScript, class-validator

## Prerequisites

- Node.js 20+
- npm 10+

## Quick Start

Run frontend:

1. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

2. Optional backend (not required for current calculator flow)
```bash
cd backend
npm install
npm run start:dev
```

## What the App Includes

- PCB calculator (monthly tax and deductions summary)
- EPF projection calculator (to age 60 with increment/dividend assumptions)
- About page (purpose, references, disclaimer)

## Notes

- PCB and EPF calculations are now handled directly in the frontend.
- Backend remains in this monorepo but is optional for the current UI flow.

## Deploy Frontend to GitHub Pages

This repo includes a workflow at `.github/workflows/deploy-frontend-pages.yml` that deploys `frontend/dist` to GitHub Pages when you push to `main`.

1. Push this repository to GitHub (branch: `main`).
2. In GitHub, go to `Settings > Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push to `main` again (or run the workflow manually from `Actions`).

Your app URL will be:

`https://<your-github-username>.github.io/pcb-salary-calculator/`

Important:
- GitHub Pages deployment is enough for this calculator because PCB and EPF logic run in the frontend.

## License

This project is for internal/personal use unless you define a separate license.
