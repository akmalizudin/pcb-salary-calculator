type TaxBracket = {
  min: number;
  max: number;
  rate: number;
  baseTax: number;
};

const TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 5000, rate: 0.0, baseTax: 0 },
  { min: 5000, max: 20000, rate: 0.01, baseTax: 0 },
  { min: 20000, max: 35000, rate: 0.03, baseTax: 150 },
  { min: 35000, max: 50000, rate: 0.06, baseTax: 600 },
  { min: 50000, max: 70000, rate: 0.11, baseTax: 1500 },
  { min: 70000, max: 100000, rate: 0.19, baseTax: 3700 },
  { min: 100000, max: 400000, rate: 0.25, baseTax: 9400 },
  { min: 400000, max: 600000, rate: 0.26, baseTax: 84400 },
  { min: 600000, max: 2000000, rate: 0.28, baseTax: 136400 },
  { min: 2000000, max: Infinity, rate: 0.3, baseTax: 528400 },
];

const DEDUCTION_CATEGORY_AMOUNT = {
  1: 0,
  2: 5000,
  3: 9000,
} as const;

type DeductionCategory = keyof typeof DEDUCTION_CATEGORY_AMOUNT;

type PcbInput = {
  monthlySalary: number;
  allowance?: number;
  bonus?: number;
  epfRate?: number;
  monthNumber?: number;
  ytdGross?: number;
  ytdEpf?: number;
  ytdPcb?: number;
  ytdZakat?: number;
  deductionCategory?: DeductionCategory;
  includeBonusInSocsoEis?: boolean;
};

export type PcbResult = {
  monthlyPCB: number;
  baseMonthlyPcb: number;
  additionalBonusPcb: number;
  netSalary: number;
  epf: number;
  socso: number;
  eis: number;
  totalDeductions: number;
  currentMonthGross: number;
};

function roundToNearest5Sen(amount: number): number {
  const sen = Math.round(amount * 100);
  const remainder = ((sen % 5) + 5) % 5;
  const roundedSen = remainder <= 2 ? sen - remainder : sen + (5 - remainder);
  return Number((roundedSen / 100).toFixed(2));
}

function calculateResidentTax(chargeableIncome: number): number {
  const income = Math.max(0, chargeableIncome);

  for (const bracket of TAX_BRACKETS_2026) {
    if (income <= bracket.max) {
      const tax = bracket.baseTax + (income - bracket.min) * bracket.rate;
      return Number(Math.max(0, tax).toFixed(2));
    }
  }

  return 0;
}

function calculatePerkesoInsuredWage(wage: number, cap: number): number {
  const cappedWage = Math.min(Math.max(0, wage), cap);

  if (cappedWage <= 0) return 0;
  if (cappedWage <= 30) return 30;
  if (cappedWage <= 50) return 40;
  if (cappedWage <= 70) return 60;
  if (cappedWage <= 100) return 80;

  return Math.floor((cappedWage - 1) / 100) * 100 + 50;
}

export function calculatePcb(input: PcbInput): PcbResult {
  const epfRate = input.epfRate ?? 0.11;
  const allowance = input.allowance ?? 0;
  const bonus = input.bonus ?? 0;

  const monthNumber = input.monthNumber ?? 1;
  const n = Math.max(0, 12 - monthNumber);

  const ytdGross = input.ytdGross ?? 0;
  const ytdEpf = input.ytdEpf ?? 0;
  const ytdPcb = input.ytdPcb ?? 0;
  const ytdZakat = input.ytdZakat ?? 0;

  const deductionCategory = input.deductionCategory ?? 3;
  const deductionAmount = DEDUCTION_CATEGORY_AMOUNT[deductionCategory];

  const monthlySalary = input.monthlySalary;
  const monthlyGross = monthlySalary + allowance;
  const currentMonthGross = monthlyGross + bonus;

  const monthlyEpf = Number((currentMonthGross * epfRate).toFixed(2));

  const Y1 = monthlyGross;
  const K1 = Y1 * epfRate;
  const Y2 = Y1;

  const remainingEpfReliefBeforeFuture = Math.max(0, 4000 - (ytdEpf + K1));
  const K2 = n > 0 ? Math.min(remainingEpfReliefBeforeFuture / n, Y2 * epfRate) : 0;

  const P = Math.max(0, (ytdGross - ytdEpf) + (Y1 - K1) + (Y2 - K2) * n - deductionAmount);
  const taxOnP = calculateResidentTax(P);

  const baseMonthlyPcbRaw = Number(((taxOnP - (ytdPcb + ytdZakat)) / (n + 1)).toFixed(2));
  const baseMonthlyPcb = roundToNearest5Sen(Math.max(0, baseMonthlyPcbRaw));
  const E = Number((ytdZakat + baseMonthlyPcbRaw * (n + 1)).toFixed(2));

  let additionalBonusPcb = 0;
  if (bonus > 0) {
    const Yt = bonus;
    const KtActual = Yt * epfRate;
    const remainingEpfReliefForBonus = Math.max(0, 4000 - (ytdEpf + K1 + K2 * n));
    const Kt = Math.min(KtActual, remainingEpfReliefForBonus);

    const PWithBonus = P + (Yt - Kt);
    const taxOnPWithBonus = calculateResidentTax(PWithBonus);

    const additionalBonusPcbRaw = Number(((taxOnPWithBonus - E) - (ytdPcb + ytdZakat)).toFixed(2));
    additionalBonusPcb = roundToNearest5Sen(Math.max(0, additionalBonusPcbRaw));
  }

  const monthlyPCB = Number((baseMonthlyPcb + additionalBonusPcb).toFixed(2));

  const includeBonusInSocsoEis = input.includeBonusInSocsoEis ?? true;
  const socsoEisWageBase = includeBonusInSocsoEis ? currentMonthGross : monthlyGross;
  const insuredWage = calculatePerkesoInsuredWage(socsoEisWageBase, 6000);

  const monthlySocso = Number((insuredWage * 0.005).toFixed(2));
  const monthlyEis = Number((insuredWage * 0.002).toFixed(2));

  const totalDeductions = monthlyEpf + monthlySocso + monthlyEis + monthlyPCB;
  const netSalary = currentMonthGross - totalDeductions;

  return {
    monthlyPCB,
    baseMonthlyPcb,
    additionalBonusPcb,
    netSalary: Number(netSalary.toFixed(2)),
    epf: monthlyEpf,
    socso: monthlySocso,
    eis: monthlyEis,
    totalDeductions: Number(totalDeductions.toFixed(2)),
    currentMonthGross: Number(currentMonthGross.toFixed(2)),
  };
}
