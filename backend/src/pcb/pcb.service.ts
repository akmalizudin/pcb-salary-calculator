import { Injectable } from '@nestjs/common';
import { CalculatePcbDto } from './dto/calculate-pcb.dto';

@Injectable()
export class PcbService {
  private readonly TAX_BRACKETS_2026 = [
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

  private readonly DEDUCTION_CATEGORY_AMOUNT = {
    1: 0,
    2: 5000,
    3: 9000,
  } as const;

  private roundToNearest5Sen(amount: number): number {
    const sen = Math.round(amount * 100);
    const remainder = ((sen % 5) + 5) % 5;
    const roundedSen = remainder <= 2 ? sen - remainder : sen + (5 - remainder);
    return Number((roundedSen / 100).toFixed(2));
  }

  private calculateResidentTax(chargeableIncome: number): number {
    const income = Math.max(0, chargeableIncome);

    for (const bracket of this.TAX_BRACKETS_2026) {
      if (income <= bracket.max) {
        const tax = bracket.baseTax + (income - bracket.min) * bracket.rate;
        return Number(Math.max(0, tax).toFixed(2));
      }
    }

    return 0;
  }

  private calculatePerkesoInsuredWage(wage: number, cap: number): number {
    const cappedWage = Math.min(Math.max(0, wage), cap);

    if (cappedWage <= 0) return 0;
    if (cappedWage <= 30) return 30;
    if (cappedWage <= 50) return 40;
    if (cappedWage <= 70) return 60;
    if (cappedWage <= 100) return 80;

    return Math.floor((cappedWage - 1) / 100) * 100 + 50;
  }

  calculate(dto: CalculatePcbDto) {
    const epfRate = dto.epfRate ?? 0.11;
    const allowance = dto.allowance ?? 0;
    const bonus = dto.bonus ?? 0;

    const monthNumber = dto.monthNumber ?? 1;
    const n = Math.max(0, 12 - monthNumber);

    const ytdGross = dto.ytdGross ?? 0;
    const ytdEpf = dto.ytdEpf ?? 0;
    const ytdPcb = dto.ytdPcb ?? 0;
    const ytdZakat = dto.ytdZakat ?? 0;

    const deductionCategory = dto.deductionCategory ?? 3;
    const deductionAmount = this.DEDUCTION_CATEGORY_AMOUNT[deductionCategory];

    // ---------- MONTHLY GROSS ----------
    const monthlySalary = dto.monthlySalary;
    const monthlyGross = monthlySalary + allowance;
    const currentMonthGross = monthlyGross + bonus;

    // ---------- EPF ----------
    const monthlyEpf = Number((currentMonthGross * epfRate).toFixed(2));

    // ---------- PCB using LHDN 2026 tax calculation ----------
    const Y1 = monthlyGross;
    const K1 = Y1 * epfRate;
    const Y2 = Y1;

    const remainingEpfReliefBeforeFuture = Math.max(0, 4000 - (ytdEpf + K1));
    const K2 = n > 0 ? Math.min(remainingEpfReliefBeforeFuture / n, Y2 * epfRate) : 0;

    const P = Math.max(0, (ytdGross - ytdEpf) + (Y1 - K1) + (Y2 - K2) * n - deductionAmount);
    const taxOnP = this.calculateResidentTax(P);

    const baseMonthlyPcbRaw = Number(((taxOnP - (ytdPcb + ytdZakat)) / (n + 1)).toFixed(2));
    const baseMonthlyPcb = this.roundToNearest5Sen(Math.max(0, baseMonthlyPcbRaw));

    const E = Number((ytdZakat + baseMonthlyPcbRaw * (n + 1)).toFixed(2));

    let additionalBonusPcb = 0;
    if (bonus > 0) {
      const Yt = bonus;
      const KtActual = Yt * epfRate;
      const remainingEpfReliefForBonus = Math.max(0, 4000 - (ytdEpf + K1 + K2 * n));
      const Kt = Math.min(KtActual, remainingEpfReliefForBonus);

      const PWithBonus = P + (Yt - Kt);
      const taxOnPWithBonus = this.calculateResidentTax(PWithBonus);

      const additionalBonusPcbRaw = Number(
        ((taxOnPWithBonus - E) - (ytdPcb + ytdZakat)).toFixed(2),
      );
      additionalBonusPcb = this.roundToNearest5Sen(Math.max(0, additionalBonusPcbRaw));
    }

    const monthlyPCB = Number((baseMonthlyPcb + additionalBonusPcb).toFixed(2));

    // ---------- SOCSO / EIS ----------
    const includeBonusInSocsoEis = dto.includeBonusInSocsoEis ?? true;
    const socsoEisWageBase = includeBonusInSocsoEis ? currentMonthGross : monthlyGross;
    const insuredWage = this.calculatePerkesoInsuredWage(socsoEisWageBase, 6000);

    const monthlySocso = Number((insuredWage * 0.005).toFixed(2));
    const monthlyEis = Number((insuredWage * 0.002).toFixed(2));

    // ---------- NET FOR CURRENT MONTH ----------
    const totalDeductions = monthlyEpf + monthlySocso + monthlyEis + monthlyPCB;
    const netSalary = currentMonthGross - totalDeductions;

    return {
      monthlySalary,
      allowance: Number(allowance.toFixed(2)),
      bonus: Number(bonus.toFixed(2)),
      monthlyGross: Number(monthlyGross.toFixed(2)),
      currentMonthGross: Number(currentMonthGross.toFixed(2)),
      annualSalary: Number((monthlyGross * 12 + bonus).toFixed(2)),

      epf: monthlyEpf,
      socso: monthlySocso,
      eis: monthlyEis,
      monthlyPCB,
      baseMonthlyPcb,
      additionalBonusPcb,

      totalDeductions: Number(totalDeductions.toFixed(2)),
      netSalary: Number(netSalary.toFixed(2)),

      monthNumber,
      deductionCategory,
      deductionAmount,
      includeBonusInSocsoEis,
      n,
      ytdGross: Number(ytdGross.toFixed(2)),
      ytdEpf: Number(ytdEpf.toFixed(2)),
      ytdPcb: Number(ytdPcb.toFixed(2)),
      ytdZakat: Number(ytdZakat.toFixed(2)),
    };
  }
}
