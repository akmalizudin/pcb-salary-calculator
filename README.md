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

## License

This project is for internal/personal use unless you define a separate license.
