import React, { useMemo } from 'react';
import { Debt } from '../types';
import { formatCurrency, calculateProgress } from '../utils/formatters';
import { BarChart3, PieChart } from 'lucide-react';

interface ChartsSectionProps {
  debts: Debt[];
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ debts }) => {
  const activeDebts = debts.filter(d => d.paidInstallments < d.totalInstallments);

  const stats = useMemo(() => {
    return debts.reduce(
      (acc, debt) => {
        const paidValue = (debt.totalValue / debt.totalInstallments) * debt.paidInstallments;
        const remaining = debt.totalValue - paidValue;
        
        acc.totalPaid += paidValue;
        acc.remainingDebt += remaining;
        return acc;
      },
      { totalPaid: 0, remainingDebt: 0 }
    );
  }, [debts]);

  const totalValue = stats.totalPaid + stats.remainingDebt;
  const paidPercentage = totalValue > 0 ? (stats.totalPaid / totalValue) * 100 : 0;
  const remainingPercentage = totalValue > 0 ? (stats.remainingDebt / totalValue) * 100 : 0;

  if (debts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Gráfico de Progresso Individual */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-800">Progresso por Dívida</h3>
        </div>
        
        <div className="space-y-5">
          {activeDebts.length === 0 ? (
            <p className="text-slate-500 text-sm italic text-center py-4">Todas as dívidas estão quitadas! 🎉</p>
          ) : (
            activeDebts.map(debt => {
              const progress = calculateProgress(debt.paidInstallments, debt.totalInstallments);
              return (
                <div key={debt.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700 truncate max-w-[200px]">{debt.description}</span>
                    <span className="text-slate-500 text-xs">
                      {debt.paidInstallments}/{debt.totalInstallments} ({Math.round(progress)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-3 rounded-full bg-indigo-500 transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Gráfico de Resumo Financeiro */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-800">Composição Total</h3>
        </div>

        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-40 h-40 rounded-full bg-slate-100 border-[16px] border-slate-100 mb-6 flex items-center justify-center overflow-hidden">
             {/* Simples representação visual de gráfico de pizza usando conic-gradient */}
             <div 
               className="absolute inset-0 rounded-full"
               style={{ 
                 background: `conic-gradient(#4f46e5 ${paidPercentage}%, #fbbf24 ${paidPercentage}% 100%)` 
               }}
             />
             <div className="absolute inset-[8px] bg-white rounded-full flex flex-col items-center justify-center z-10">
                <span className="text-xs text-slate-400 font-medium">Pago</span>
                <span className="text-xl font-bold text-slate-800">{Math.round(paidPercentage)}%</span>
             </div>
          </div>

          <div className="w-full space-y-3">
             <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                   <span className="text-sm text-slate-600">Pago</span>
                </div>
                <span className="text-sm font-semibold text-indigo-700">{formatCurrency(stats.totalPaid)}</span>
             </div>
             <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                   <span className="text-sm text-slate-600">Restante</span>
                </div>
                <span className="text-sm font-semibold text-amber-700">{formatCurrency(stats.remainingDebt)}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;