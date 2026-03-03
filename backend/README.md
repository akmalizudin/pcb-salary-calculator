# Backend (NestJS)

Backend API for the PCB Salary Calculator monorepo.

## Features

- PCB calculation endpoint
- DTO validation with `class-validator`
- CORS enabled for frontend (`http://localhost:5173`)

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
```

## Run

```bash
# development
npm run start:dev

# production
npm run build
npm run start:prod
```

Default URL: `http://localhost:3000`

## API Endpoints

- `GET /pcb/test`
  - Health-style test endpoint
- `POST /pcb/calculate`
  - Calculates PCB + monthly deductions

### Example Request

```json
{
  "monthlySalary": 3500,
  "allowance": 200,
  "bonus": 0
}
```

### Example Response (fields)

- `monthlyPCB`
- `baseMonthlyPcb`
- `additionalBonusPcb`
- `epf`, `socso`, `eis`
- `totalDeductions`
- `netSalary`

## Test

```bash
npm run test
npm run test:e2e
npm run test:cov
```
