import React, { useMemo } from 'react';
import { Debt } from '../types';
import { formatCurrency } from '../utils/formatters';
import { TrendingDown, TrendingUp, DollarSign, PieChart } from 'lucide-react';

interface SummaryProps {
  debts: Debt[];
}

const Summary: React.FC<SummaryProps> = ({ debts }) => {
  const stats = useMemo(() => {
    return debts.reduce(
      (acc, debt) => {
        const paidValue = (debt.totalValue / debt.totalInstallments) * debt.paidInstallments;
        const remaining = debt.totalValue - paidValue;
        
        acc.totalDebt += debt.totalValue;
        acc.totalPaid += paidValue;
        acc.remainingDebt += remaining;
        
        return acc;
      },
      { totalDebt: 0, totalPaid: 0, remainingDebt: 0 }
    );
  }, [debts]);

  const progressPercentage = stats.totalDebt > 0 
    ? (stats.totalPaid / stats.totalDebt) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-slate-500">Dívida Total</p>
        </div>
        <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalDebt)}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm font-medium text-slate-500">Valor Pago</p>
        </div>
        <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <TrendingDown className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-sm font-medium text-slate-500">Restante</p>
        </div>
        <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.remainingDebt)}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <PieChart className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-sm font-medium text-slate-500">Progresso Geral</p>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold text-indigo-900">{Math.round(progressPercentage)}%</p>
          <span className="text-xs text-slate-400 mb-1">quitado</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
          <div 
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Summary;