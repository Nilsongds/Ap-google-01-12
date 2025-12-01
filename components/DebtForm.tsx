import React, { useState, useEffect } from 'react';
import { Debt } from '../types';
import { Save, Bell } from 'lucide-react';

interface DebtFormProps {
  initialData?: Debt;
  onSubmit: (debt: any) => void;
  onCancel: () => void;
}

const DebtForm: React.FC<DebtFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [description, setDescription] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('1');
  const [paidInstallments, setPaidInstallments] = useState('0');
  const [nextDueDate, setNextDueDate] = useState('');
  const [reminderDays, setReminderDays] = useState('3');

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setTotalValue(initialData.totalValue.toString());
      setTotalInstallments(initialData.totalInstallments.toString());
      setPaidInstallments(initialData.paidInstallments.toString());
      setNextDueDate(initialData.nextDueDate);
      setReminderDays((initialData.reminderDays || 3).toString());
    } else {
        // Default next due date to today + 30 days
        const date = new Date();
        date.setDate(date.getDate() + 30);
        setNextDueDate(date.toISOString().split('T')[0]);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const total = parseFloat(totalValue);
    const installments = parseInt(totalInstallments, 10);
    const paid = parseInt(paidInstallments, 10);
    const reminder = parseInt(reminderDays, 10);

    if (isNaN(total) || total <= 0) return alert('O valor total deve ser maior que zero.');
    if (isNaN(installments) || installments <= 0) return alert('O número de parcelas deve ser maior que zero.');
    if (paid < 0 || paid > installments) return alert('Parcelas pagas inválidas.');
    if (isNaN(reminder) || reminder < 0) return alert('Dias para lembrete inválido.');

    const debtData = {
      ...initialData,
      description,
      totalValue: total,
      totalInstallments: installments,
      paidInstallments: paid,
      nextDueDate,
      reminderDays: reminder,
    };

    onSubmit(debtData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Descrição da Dívida
        </label>
        <input
          type="text"
          id="description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          placeholder="Ex: Cartão de Crédito"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="totalValue" className="block text-sm font-medium text-slate-700 mb-1">
            Valor Total (R$)
          </label>
          <input
            type="number"
            id="totalValue"
            required
            min="0.01"
            step="0.01"
            value={totalValue}
            onChange={(e) => setTotalValue(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            placeholder="0,00"
          />
        </div>
        <div>
          <label htmlFor="nextDueDate" className="block text-sm font-medium text-slate-700 mb-1">
            Próximo Vencimento
          </label>
          <input
            type="date"
            id="nextDueDate"
            required
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="totalInstallments" className="block text-sm font-medium text-slate-700 mb-1">
            Total Parcelas
          </label>
          <input
            type="number"
            id="totalInstallments"
            required
            min="1"
            value={totalInstallments}
            onChange={(e) => setTotalInstallments(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label htmlFor="paidInstallments" className="block text-sm font-medium text-slate-700 mb-1">
            Parcelas Pagas
          </label>
          <input
            type="number"
            id="paidInstallments"
            required
            min="0"
            max={totalInstallments}
            value={paidInstallments}
            onChange={(e) => setPaidInstallments(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="reminderDays" className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-400" />
          Dias para Lembrete
        </label>
        <div className="relative">
          <input
            type="number"
            id="reminderDays"
            required
            min="0"
            max="60"
            value={reminderDays}
            onChange={(e) => setReminderDays(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          <span className="absolute right-3 top-2 text-sm text-slate-400 pointer-events-none">
            dias antes
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Você receberá um aviso no aplicativo {reminderDays} dias antes do vencimento.
        </p>
      </div>

      <div className="pt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {initialData ? 'Salvar Alterações' : 'Cadastrar Dívida'}
        </button>
      </div>
    </form>
  );
};

export default DebtForm;