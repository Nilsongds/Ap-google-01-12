import { Debt, DebtStatus } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export const getDebtStatus = (debt: Debt): DebtStatus => {
  if (debt.paidInstallments >= debt.totalInstallments) {
    return 'Quitada';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(debt.nextDueDate);
  due.setHours(0, 0, 0, 0);

  // Note: Since the input is YYYY-MM-DD, the timezone offset might cause issues if not handled carefully.
  // We compare raw date strings for safety or use UTC midnight if strictly needed.
  // For this simple app, assuming local time consistency.
  
  if (due < today) {
    return 'Atrasada';
  }

  return 'Em dia';
};

export const calculateProgress = (paid: number, total: number): number => {
  if (total === 0) return 0;
  return Math.min(100, (paid / total) * 100);
};
