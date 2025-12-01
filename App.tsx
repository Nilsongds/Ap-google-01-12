import React, { useState, useEffect, useMemo } from 'react';
import { Debt } from './types';
import { Plus, LayoutDashboard, WalletCards, Bell, X, ArrowUpDown } from 'lucide-react';
import DebtCard from './components/DebtCard';
import DebtForm from './components/DebtForm';
import Summary from './components/Summary';
import ChartsSection from './components/ChartsSection';
import Modal from './components/Modal';
import { formatCurrency, formatDate, getDebtStatus } from './utils/formatters';

const App: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('debt-tracker-data');
    if (!saved) return [];
    
    // Migration: ensure reminderDays exists for old data
    const parsed = JSON.parse(saved);
    return parsed.map((d: any) => ({
      ...d,
      reminderDays: d.reminderDays ?? 3 // Default to 3 days if missing
    }));
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>(undefined);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  
  // Sorting State
  const [sortField, setSortField] = useState<'nextDueDate' | 'totalValue' | 'status' | 'description'>('nextDueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    localStorage.setItem('debt-tracker-data', JSON.stringify(debts));
  }, [debts]);

  const handleAddDebt = (debt: Omit<Debt, 'id'>) => {
    const newDebt: Debt = {
      ...debt,
      id: crypto.randomUUID(),
    };
    setDebts((prev) => [...prev, newDebt]);
    setIsModalOpen(false);
  };

  const handleEditDebt = (updatedDebt: Debt) => {
    setDebts((prev) => prev.map((d) => (d.id === updatedDebt.id ? updatedDebt : d)));
    setIsModalOpen(false);
    setEditingDebt(undefined);
  };

  const handleDeleteDebt = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta dívida?')) {
      setDebts((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingDebt(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (debt: Debt) => {
    setEditingDebt(debt);
    setIsModalOpen(true);
  };

  const handleQuickPayment = (id: string) => {
    setDebts((prev) => prev.map(debt => {
      if (debt.id === id && debt.paidInstallments < debt.totalInstallments) {
        return { ...debt, paidInstallments: debt.paidInstallments + 1 };
      }
      return debt;
    }));
  };

  const dismissAlert = (id: string) => {
    setDismissedAlerts(prev => [...prev, id]);
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Calculate notifications
  const notifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return debts.filter(debt => {
      if (debt.paidInstallments >= debt.totalInstallments) return false;
      if (dismissedAlerts.includes(debt.id)) return false;

      const dueDate = new Date(debt.nextDueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Show notification if within reminder days range OR overdue (diffDays < 0)
      return diffDays <= (debt.reminderDays || 3);
    }).map(debt => {
      const dueDate = new Date(debt.nextDueDate);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const installmentValue = debt.totalValue / debt.totalInstallments;

      return {
        id: debt.id,
        debtName: debt.description,
        daysRemaining: diffDays,
        amount: installmentValue,
        date: debt.nextDueDate
      };
    });
  }, [debts, dismissedAlerts]);

  // Sorted Debts Logic
  const sortedDebts = useMemo(() => {
    return [...debts].sort((a, b) => {
      let result = 0;
      
      switch (sortField) {
        case 'totalValue':
          result = a.totalValue - b.totalValue;
          break;
        case 'nextDueDate':
          result = new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
          break;
        case 'status':
          // Priority: Atrasada (0) < Em dia (1) < Quitada (2)
          const priority = { 'Atrasada': 0, 'Em dia': 1, 'Quitada': 2 };
          const statusA = getDebtStatus(a);
          const statusB = getDebtStatus(b);
          result = priority[statusA] - priority[statusB];
          break;
        case 'description':
           result = a.description.localeCompare(b.description);
           break;
        default:
          result = 0;
      }

      return sortDirection === 'asc' ? result : -result;
    });
  }, [debts, sortField, sortDirection]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <WalletCards className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Finanças Pessoais</h1>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Dívida</span>
            <span className="sm:hidden">Adicionar</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Notifications Area */}
        {notifications.length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-300">
             <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-800">Lembretes de Pagamento</h2>
            </div>
            <div className="grid gap-3">
              {notifications.map(notif => (
                <div key={notif.id} className={`flex items-start justify-between p-4 rounded-lg border shadow-sm ${notif.daysRemaining < 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div>
                    <h4 className={`font-semibold ${notif.daysRemaining < 0 ? 'text-red-800' : 'text-amber-800'}`}>
                      {notif.debtName}
                    </h4>
                    <p className={`text-sm mt-1 ${notif.daysRemaining < 0 ? 'text-red-700' : 'text-amber-700'}`}>
                      {notif.daysRemaining < 0 
                        ? `Venceu há ${Math.abs(notif.daysRemaining)} dias` 
                        : notif.daysRemaining === 0 
                          ? 'Vence hoje!' 
                          : `Vence em ${notif.daysRemaining} dias`} 
                      — <span className="font-bold">{formatCurrency(notif.amount)}</span> ({formatDate(notif.date)})
                    </p>
                  </div>
                  <button 
                    onClick={() => dismissAlert(notif.id)}
                    className={`p-1 rounded-full hover:bg-black/5 ${notif.daysRemaining < 0 ? 'text-red-400' : 'text-amber-400'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dashboard Summary */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <LayoutDashboard className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Visão Geral</h2>
          </div>
          <Summary debts={debts} />
        </section>

        {/* Charts Section */}
        {debts.length > 0 && (
          <section>
            <ChartsSection debts={debts} />
          </section>
        )}

        {/* Debt List */}
        <section>
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h2 className="text-lg font-semibold text-slate-800">Minhas Dívidas ({debts.length})</h2>
            
            {debts.length > 0 && (
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs font-medium text-slate-500 pl-2 hidden sm:inline">Ordenar por:</span>
                <select 
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as any)}
                  className="text-sm border-none bg-transparent py-1.5 pl-1 pr-6 focus:ring-0 text-slate-700 font-medium cursor-pointer outline-none"
                >
                  <option value="nextDueDate">Vencimento</option>
                  <option value="totalValue">Valor Total</option>
                  <option value="status">Status</option>
                  <option value="description">Nome</option>
                </select>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <button 
                  onClick={toggleSortDirection}
                  className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
                  title={sortDirection === 'asc' ? "Crescente" : "Decrescente"}
                >
                  <ArrowUpDown className={`w-4 h-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </div>
          
          {sortedDebts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <WalletCards className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Nenhuma dívida cadastrada</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                Comece adicionando uma nova dívida para acompanhar seus pagamentos e organizar sua vida financeira.
              </p>
              <button
                onClick={openAddModal}
                className="mt-6 text-indigo-600 font-medium hover:text-indigo-800"
              >
                Adicionar minha primeira dívida &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedDebts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  onEdit={() => openEditModal(debt)}
                  onDelete={() => handleDeleteDebt(debt.id)}
                  onPay={() => handleQuickPayment(debt.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDebt ? 'Editar Dívida' : 'Nova Dívida'}
      >
        <DebtForm
          initialData={editingDebt}
          onSubmit={editingDebt ? handleEditDebt : handleAddDebt}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default App;