# PCB Salary Calculator (Monorepo)

A monorepo for a Malaysia salary planning tool with:
- `frontend`: React + Vite UI for PCB and EPF calculators
- `backend`: NestJS API for PCB calculation logic

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

Run backend and frontend in separate terminals.

1. Backend
```bash
cd backend
npm install
npm run start:dev
```
Backend runs on `http://localhost:3000`.

2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## What the App Includes

- PCB calculator (monthly tax and deductions summary)
- EPF projection calculator (to age 60 with increment/dividend assumptions)
- About page (purpose, references, disclaimer)

## Notes

- Frontend calls backend at `http://localhost:3000/pcb/calculate`.
- CORS is configured for `http://localhost:5173`.

## Deploy Frontend to GitHub Pages

This repo includes a workflow at `.github/workflows/deploy-frontend-pages.yml` that deploys `frontend/dist` to GitHub Pages when you push to `main`.

1. Push this repository to GitHub (branch: `main`).
2. In GitHub, go to `Settings > Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. (Required for PCB tab in production) Go to `Settings > Secrets and variables > Actions > Variables` and create:
   - `VITE_API_BASE_URL` = your deployed backend URL (example: `https://your-backend.example.com`)
5. Push to `main` again (or run the workflow manually from `Actions`).

Your app URL will be:

`https://<your-github-username>.github.io/pcb-salary-calculator/`

Important:
- GitHub Pages only hosts the frontend. Your NestJS backend must be deployed separately for PCB calculation to work.
- EPF and About tabs work as static frontend logic.

## License

This project is for internal/personal use unless you define a separate license.
