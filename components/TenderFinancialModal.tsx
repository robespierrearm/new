'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tender, Expense, supabase } from '@/lib/supabase';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface TenderFinancialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tender: Tender;
}

export function TenderFinancialModal({ open, onOpenChange, tender }: TenderFinancialModalProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadExpenses();
    }
  }, [open, tender.id]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('tender_id', tender.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Ошибка загрузки расходов:', error);
    } finally {
      setLoading(false);
    }
  };

  const income = tender.win_price || 0;
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const netProfit = income - totalExpenses;

  const formatAmount = (amount: number | null) => {
    if (!amount) return '0 ₽';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <div>
              <div>Финансовая сводка</div>
              <div className="text-sm font-normal text-gray-500 mt-1">{tender.name}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Основные показатели */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Доход */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-700 mb-1">Доход</div>
              <div className="text-2xl font-bold text-green-900">{formatAmount(income)}</div>
              <div className="text-xs text-green-600 mt-1">Цена победы</div>
            </div>

            {/* Расходы */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-700 mb-1">Расходы</div>
              <div className="text-2xl font-bold text-red-900">{formatAmount(totalExpenses)}</div>
              <div className="text-xs text-red-600 mt-1">{expenses.length} позиций</div>
            </div>

            {/* Прибыль */}
            <div className={`p-4 rounded-lg border ${
              netProfit > 0 
                ? 'bg-blue-50 border-blue-200' 
                : netProfit < 0 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className={`text-sm mb-1 ${
                netProfit > 0 ? 'text-blue-700' : netProfit < 0 ? 'text-orange-700' : 'text-gray-700'
              }`}>
                {netProfit > 0 ? 'Прибыль' : netProfit < 0 ? 'Убыток' : 'Результат'}
              </div>
              <div className={`text-2xl font-bold flex items-center gap-2 ${
                netProfit > 0 ? 'text-blue-900' : netProfit < 0 ? 'text-orange-900' : 'text-gray-900'
              }`}>
                {netProfit > 0 && <TrendingUp className="h-6 w-6" />}
                {netProfit < 0 && <TrendingDown className="h-6 w-6" />}
                {formatAmount(Math.abs(netProfit))}
              </div>
              <div className={`text-xs mt-1 ${
                netProfit > 0 ? 'text-blue-600' : netProfit < 0 ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {netProfit > 0 ? '+' : netProfit < 0 ? '-' : ''}{((Math.abs(netProfit) / (income || 1)) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Детализация расходов */}
          {expenses.length > 0 && (
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-medium text-gray-900">Детализация расходов</h3>
              </div>
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0">
                    <tr>
                      <th className="text-left p-3">Описание</th>
                      <th className="text-left p-3">Категория</th>
                      <th className="text-right p-3">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{expense.description || '—'}</td>
                        <td className="p-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                            {expense.category}
                          </span>
                        </td>
                        <td className="p-3 text-right font-medium">{formatAmount(expense.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Если нет расходов */}
          {expenses.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Расходы по тендеру не добавлены</p>
              <p className="text-sm mt-1">Перейдите в раздел "Бухгалтерия" для добавления расходов</p>
            </div>
          )}
        </div>

        {/* Счетчик */}
        <div className="pt-3 border-t text-sm text-gray-500">
          Всего расходов: {expenses.length} • Прибыль: {formatAmount(netProfit)}
        </div>
      </DialogContent>
    </Dialog>
  );
}
