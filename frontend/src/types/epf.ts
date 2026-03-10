export type EPFResult = {
  projectedSavingsAt60: number;
  totalContributions: number;
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  estimatedDividends: number;
  yearsToRetirement: number;
  bonusMode: 'months' | 'none';
  bonusMonths: number;
  salaryMilestones: Array<{
    age: number;
    salary: number;
  }>;
  savingsMilestones: Array<{
    age: number;
    savings: number;
  }>;
};
