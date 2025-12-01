export interface Debt {
  id: string;
  description: string;
  totalValue: number;
  totalInstallments: number;
  paidInstallments: number;
  nextDueDate: string; // YYYY-MM-DD
  reminderDays: number; // Dias antes do vencimento para notificar
}

export type DebtStatus = 'Em dia' | 'Atrasada' | 'Quitada';

export interface DebtStatistics {
  totalDebt: number;
  totalPaid: number;
  remainingDebt: number;
  progressPercentage: number;
  monthlyCommitment: number;
}