import { Injectable } from '@nestjs/common';
import { CalculatePcbDto } from './dto/calculate-pcb.dto';

@Injectable()
export class PcbService {
  private readonly TAX_BRACKETS_2025 = [
    { upTo: 5000, rate: 0.0 },
    { upTo: 20000, rate: 0.01 },
    { upTo: 35000, rate: 0.03 },
    { upTo: 50000, rate: 0.06 },
    { upTo: 70000, rate: 0.11 },
    { upTo: 100000, rate: 0.19 },
    { upTo: 400000, rate: 0.25 },
    { upTo: 600000, rate: 0.26 },
    { upTo: 2000000, rate: 0.28 },
    { upTo: Infinity, rate: 0.3 },
  ];

  private calculateProgressiveTax(chargeableIncome: number): number {
    let remainingIncome = Math.max(0, chargeableIncome);
    let totalTax = 0;
    let previousLimit = 0;

    for (const bracket of this.TAX_BRACKETS_2025) {
      if (remainingIncome <= 0) break;

      const taxableAmount = Math.min(bracket.upTo - previousLimit, remainingIncome);
      totalTax += taxableAmount * bracket.rate;
      remainingIncome -= taxableAmount;
      previousLimit = bracket.upTo;
    }

    return Number(totalTax.toFixed(2));
  }

  calculate(dto: CalculatePcbDto) {
    const epfRate = dto.epfRate ?? 0.11;
    const allowance = dto.allowance ?? 0;
    const bonus = dto.bonus ?? 0;

    // ---------- MONTHLY GROSS ----------
    const monthlySalary = dto.monthlySalary;
    const monthlyGross = monthlySalary + allowance;
    const currentMonthGross = monthlyGross + bonus;

    // ---------- ANNUAL BASE (RECURRING) ----------
    const annualBaseSalary = monthlyGross * 12;
    const annualBaseEpf = annualBaseSalary * epfRate;
    const annualBaseChargeableIncome = Math.max(0, annualBaseSalary - annualBaseEpf);
    const annualBaseTax = this.calculateProgressiveTax(annualBaseChargeableIncome);
    const baseMonthlyPcb = Number((annualBaseTax / 12).toFixed(2));

    // ---------- ADDITIONAL REMUNERATION (BONUS) ----------
    // Use tax-difference method so bonus tax is charged in bonus month instead of spread over 12 months.
    const annualWithBonusSalary = annualBaseSalary + bonus;
    const annualWithBonusEpf = annualWithBonusSalary * epfRate;
    const annualWithBonusChargeableIncome = Math.max(
      0,
      annualWithBonusSalary - annualWithBonusEpf,
    );
    const annualWithBonusTax = this.calculateProgressiveTax(annualWithBonusChargeableIncome);
    const additionalBonusPcb = Number(Math.max(0, annualWithBonusTax - annualBaseTax).toFixed(2));
    const monthlyPCB = Number((baseMonthlyPcb + additionalBonusPcb).toFixed(2));

    // ---------- EPF ----------
    const monthlyEpf = Number((currentMonthGross * epfRate).toFixed(2));

    // ---------- SOCSO / EIS ----------
    // PERKESO wage ceiling increased to RM6,000 (effective 1 Oct 2024).
    const socsoSalaryCap = Math.min(currentMonthGross, 6000);
    const monthlySocso = Number((socsoSalaryCap * 0.005).toFixed(2));
    const monthlyEis = Number((socsoSalaryCap * 0.002).toFixed(2));

    // ---------- NET FOR CURRENT MONTH ----------
    const totalDeductions = monthlyEpf + monthlySocso + monthlyEis + monthlyPCB;
    const netSalary = currentMonthGross - totalDeductions;

    return {
      monthlySalary,
      allowance: Number(allowance.toFixed(2)),
      bonus: Number(bonus.toFixed(2)),
      monthlyGross: Number(monthlyGross.toFixed(2)),
      currentMonthGross: Number(currentMonthGross.toFixed(2)),
      annualSalary: Number(annualWithBonusSalary.toFixed(2)),

      epf: monthlyEpf,
      socso: monthlySocso,
      eis: monthlyEis,
      monthlyPCB,
      baseMonthlyPcb,
      additionalBonusPcb,

      totalDeductions: Number(totalDeductions.toFixed(2)),
      netSalary: Number(netSalary.toFixed(2)),

      annualEpf: Number(annualWithBonusEpf.toFixed(2)),
      chargeableIncome: Number(annualWithBonusChargeableIncome.toFixed(2)),
      annualTax: annualWithBonusTax,
    };
  }
}
