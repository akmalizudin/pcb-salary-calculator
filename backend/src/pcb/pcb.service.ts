import { Injectable } from '@nestjs/common';
import { CalculatePcbDto } from './dto/calculate-pcb.dto';

@Injectable()
export class PcbService {
  calculate(dto: CalculatePcbDto) {
    const epfRate = dto.epfRate ?? 0.11;

    // ---------- BASIC ----------
    const monthlySalary = dto.monthlySalary;
    const annualSalary = monthlySalary * 12;

    // ---------- EPF ----------
    const monthlyEpf = monthlySalary * epfRate;
    const annualEpf = monthlyEpf * 12;

    // ---------- TAX ----------
    const chargeableIncome = Math.max(0, annualSalary - annualEpf);

    const TAX_BRACKETS_2025 = [
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

    let remainingIncome = chargeableIncome;
    let totalTax = 0;
    let previousLimit = 0;

    for (const bracket of TAX_BRACKETS_2025) {
      if (remainingIncome <= 0) break;

      const taxableAmount = Math.min(
        bracket.upTo - previousLimit,
        remainingIncome,
      );

      totalTax += taxableAmount * bracket.rate;
      remainingIncome -= taxableAmount;
      previousLimit = bracket.upTo;
    }

    const annualTax = Number(totalTax.toFixed(2));
    const monthlyPCB = Number((annualTax / 12).toFixed(2));

    // ---------- SOCSO ----------
    const socsoSalaryCap = Math.min(monthlySalary, 5000);
    const monthlySocso = Number((socsoSalaryCap * 0.005).toFixed(2));

    // ---------- EIS ----------
    const monthlyEis = Number((socsoSalaryCap * 0.002).toFixed(2));

    // ---------- TOTALS ----------
    const totalDeductions = monthlyEpf + monthlySocso + monthlyEis + monthlyPCB;

    const netSalary = monthlySalary - totalDeductions;

    return {
      monthlySalary,
      annualSalary,

      epf: Number(monthlyEpf.toFixed(2)),
      socso: monthlySocso,
      eis: monthlyEis,
      monthlyPCB,

      totalDeductions: Number(totalDeductions.toFixed(2)),
      netSalary: Number(netSalary.toFixed(2)),

      annualEpf: Number(annualEpf.toFixed(2)),
      chargeableIncome: Number(chargeableIncome.toFixed(2)),
      annualTax,
    };
  }
}
