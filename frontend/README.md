# Frontend (React + Vite)

Frontend for the PCB Salary Calculator monorepo.

## Features

- Header tabs: `PCB Calculator`, `EPF Calculator`, `About`
- PCB form with salary inputs and deduction summary
- EPF long-term projection to age 60
- Theme switching by tab (PCB/EPF/About)

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Default URL: `http://localhost:5173`

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Notes

- Expects backend API at `http://localhost:3000`.
- Main API used: `POST /pcb/calculate`.
