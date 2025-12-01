import React from 'react';
import { Debt } from '../types';
import { calculateProgress, formatCurrency, formatDate, getDebtStatus } from '../utils/formatters';
import { Calendar, Trash2, Edit2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface DebtCardProps {
  debt: Debt;
  onEdit: () => void;
  onDelete: () => void;
  onPay: () => void;
}

const DebtCard: React.FC<DebtCardProps> = ({ debt, onEdit, onDelete, onPay }) => {
  const status = getDebtStatus(debt);
  const progress = calculateProgress(debt.paidInstallments, debt.totalInstallments);
  const remainingValue = (debt.totalValue / debt.totalInstallments) * (debt.totalInstallments - debt.paidInstallments);
  const installmentValue = debt.totalValue / debt.totalInstallments;

  const statusColors = {
    'Quitada': 'bg-green-100 text-green-700 border-green-200',
    'Atrasada': 'bg-red-100 text-red-700 border-red-200',
    'Em dia': 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const statusIcons = {
    'Quitada': <CheckCircle className="w-4 h-4" />,
    'Atrasada': <AlertCircle className="w-4 h-4" />,
    'Em dia': <Clock className="w-4 h-4" />,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-full hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
            {statusIcons[status]}
            {status}
          </span>
          <h3 className="text-lg font-bold text-slate-800 mt-2 line-clamp-1" title={debt.description}>
            {debt.description}
          </h3>
          <p className="text-slate-500 text-sm font-medium">
            {formatCurrency(debt.totalValue)}
          </p>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Editar">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Excluir">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 flex-grow">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Progresso</span>
            <span className="font-semibold text-slate-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${status === 'Quitada' ? 'bg-green-500' : 'bg-indigo-600'}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-slate-500">
              {debt.paidInstallments} de {debt.totalInstallments} parcelas
            </span>
             <span className="text-xs font-medium text-slate-600">
              {formatCurrency(installmentValue)}/mês
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="block text-xs text-slate-400 mb-0.5">Restante</span>
            <span className="font-semibold text-slate-700">{formatCurrency(remainingValue)}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 mb-0.5 flex items-center gap-1">
               <Calendar className="w-3 h-3" /> Vencimento
            </span>
            <span className={`font-semibold ${status === 'Atrasada' ? 'text-red-600' : 'text-slate-700'}`}>
              {status === 'Quitada' ? '-' : formatDate(debt.nextDueDate)}
            </span>
          </div>
        </div>
      </div>

      {status !== 'Quitada' && (
        <button
          onClick={onPay}
          className="mt-5 w-full py-2 px-4 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium text-sm transition-colors flex items-center justify-center gap-2 group"
        >
          <CheckCircle className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600" />
          Pagar 1 Parcela
        </button>
      )}
    </div>
  );
};

export default DebtCard;