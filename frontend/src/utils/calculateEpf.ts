import type { EPFResult } from '../types/epf';

type CalculateEpfInput = {
  monthlySalary: number | null;
  yearlyIncrementPercent: number | null;
  yearlyDividendPercent: number | null;
  bonusMonths: number | null;
  currentAge: number | null;
};

type CalculateEpfOutput =
  | {
      result: EPFResult;
      error: '';
    }
  | {
      result: null;
      error: string;
    };

const EPF_EMPLOYEE_CONTRIBUTION_RATE = 0.11;
const EPF_EMPLOYER_CONTRIBUTION_RATE = 0.13;

export function calculateEpf(input: CalculateEpfInput): CalculateEpfOutput {
  const {
    monthlySalary,
    yearlyIncrementPercent,
    yearlyDividendPercent,
    bonusMonths,
    currentAge,
  } = input;

  if (!monthlySalary || monthlySalary <= 0) {
    return {
      result: null,
      error: 'Please enter a valid monthly salary',
    };
  }

  if (!currentAge || currentAge < 16 || currentAge >= 60) {
    return {
      result: null,
      error: 'Please enter a valid age between 16 and 59',
    };
  }

  const incrementRate = (yearlyIncrementPercent ?? 0) / 100;
  if (incrementRate < 0 || incrementRate > 1) {
    return {
      result: null,
      error: 'Please enter a valid yearly increment between 0% and 100%',
    };
  }

  const dividendRate = (yearlyDividendPercent ?? 0) / 100;
  if (dividendRate < 0 || dividendRate > 1) {
    return {
      result: null,
      error: 'Please enter a valid yearly dividend between 0% and 100%',
    };
  }

  if ((bonusMonths ?? 0) < 0) {
    return {
      result: null,
      error: 'Please enter a valid bonus months value (0 or more)',
    };
  }

  const monthsToRetirement = (60 - currentAge) * 12;
  const monthlyDividendRate = Math.pow(1 + dividendRate, 1 / 12) - 1;
  const normalizedBonusMonths = bonusMonths ?? 0;
  const bonusMode: EPFResult['bonusMode'] = normalizedBonusMonths > 0 ? 'months' : 'none';

  let currentMonthlySalary = monthlySalary;
  let projectedSavings = 0;
  let totalContributions = 0;
  let totalEmployeeContributions = 0;
  let totalEmployerContributions = 0;

  const targetAges = [30, 40, 50, 60];
  const filteredMilestoneAges = targetAges.filter((targetAge) => currentAge < targetAge);
  const savingsByAge = new Map<number, number>();

  for (let month = 1; month <= monthsToRetirement; month += 1) {
    const employeeMonthlyContribution = currentMonthlySalary * EPF_EMPLOYEE_CONTRIBUTION_RATE;
    const employerMonthlyContribution = currentMonthlySalary * EPF_EMPLOYER_CONTRIBUTION_RATE;
    const monthlyContribution = employeeMonthlyContribution + employerMonthlyContribution;

    totalEmployeeContributions += employeeMonthlyContribution;
    totalEmployerContributions += employerMonthlyContribution;
    totalContributions += monthlyContribution;
    projectedSavings += monthlyContribution;

    if (month % 12 === 0) {
      const annualBonus = currentMonthlySalary * normalizedBonusMonths;
      const employeeBonusContribution = annualBonus * EPF_EMPLOYEE_CONTRIBUTION_RATE;
      const employerBonusContribution = annualBonus * EPF_EMPLOYER_CONTRIBUTION_RATE;
      const bonusContribution = employeeBonusContribution + employerBonusContribution;

      totalEmployeeContributions += employeeBonusContribution;
      totalEmployerContributions += employerBonusContribution;
      totalContributions += bonusContribution;
      projectedSavings += bonusContribution;
    }

    projectedSavings *= 1 + monthlyDividendRate;

    if (month % 12 === 0) {
      const ageAtYearEnd = currentAge + month / 12;
      if (filteredMilestoneAges.includes(ageAtYearEnd)) {
        savingsByAge.set(ageAtYearEnd, projectedSavings);
      }
      currentMonthlySalary *= 1 + incrementRate;
    }
  }

  const salaryMilestones = filteredMilestoneAges
    .map((targetAge) => ({
      age: targetAge,
      salary: monthlySalary * Math.pow(1 + incrementRate, targetAge - currentAge),
    }));
  const savingsMilestones = filteredMilestoneAges.map((targetAge) => ({
    age: targetAge,
    savings: savingsByAge.get(targetAge) ?? projectedSavings,
  }));

  return {
    result: {
      projectedSavingsAt60: projectedSavings,
      totalContributions,
      totalEmployeeContributions,
      totalEmployerContributions,
      estimatedDividends: projectedSavings - totalContributions,
      yearsToRetirement: 60 - currentAge,
      bonusMode,
      bonusMonths: normalizedBonusMonths,
      salaryMilestones,
      savingsMilestones,
    },
    error: '',
  };
}
