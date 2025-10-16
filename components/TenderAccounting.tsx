'use client';

import { useState } from 'react';
import { Tender, Expense, ExpenseInsert, EXPENSE_CATEGORIES, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TenderAccountingProps {
  tender: Tender;
  expenses: Expense[];
  onExpenseAdded: () => void;
  onExpenseDeleted: () => void;
}

export function TenderAccounting({ tender, expenses, onExpenseAdded, onExpenseDeleted }: TenderAccountingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<ExpenseInsert>({
    tender_id: tender.id,
    category: 'Материалы',
    amount: 0,
    description: '',
  });

  // Расчёты
  const income = tender.win_price || 0;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const profit = income - totalExpenses;
  const taxRate = 0.07; // 7% налог
  const tax = profit > 0 ? profit * taxRate : 0;
  const netProfit = profit - tax;

  // Форматирование суммы
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Добавление расхода
  const handleAddExpense = async () => {
    if (newExpense.amount <= 0) {
      alert('Сумма расхода должна быть больше 0');
      return;
    }

    const { error } = await supabase.from('expenses').insert([newExpense]);

    if (error) {
      console.error('Ошибка добавления расхода:', error);
      alert('Ошибка при добавлении расхода');
    } else {
      setNewExpense({
        tender_id: tender.id,
        category: 'Материалы',
        amount: 0,
        description: '',
      });
      setIsAddingExpense(false);
      onExpenseAdded();
    }
  };

  // Удаление расхода
  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm('Удалить этот расход?')) return;

    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);

    if (error) {
      console.error('Ошибка удаления расхода:', error);
      alert('Ошибка при удалении расхода');
    } else {
      onExpenseDeleted();
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Заголовок (всегда видимый) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-lg text-gray-900">{tender.name}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-gray-600">
              Доход: <span className="font-medium text-green-600">{formatAmount(income)}</span>
            </span>
            <span className="text-gray-600">
              Расходы: <span className="font-medium text-red-600">{formatAmount(totalExpenses)}</span>
            </span>
            <span className={cn(
              "font-semibold",
              netProfit > 0 ? "text-green-600" : netProfit < 0 ? "text-red-600" : "text-gray-600"
            )}>
              {netProfit > 0 ? (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Прибыль: {formatAmount(netProfit)}
                </span>
              ) : netProfit < 0 ? (
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  Убыток: {formatAmount(Math.abs(netProfit))}
                </span>
              ) : (
                'Прибыль: 0 ₽'
              )}
            </span>
          </div>
        </div>
        <div className="ml-4">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* Раскрывающееся содержимое */}
      {isOpen && (
        <div className="border-t bg-gray-50 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Детальные расчёты */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-3">Доходы</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Цена победы:</span>
                  <span className="font-medium text-green-600">{formatAmount(income)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-3">Итоги</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Валовая прибыль:</span>
                  <span className={cn(
                    "font-medium",
                    profit > 0 ? "text-green-600" : profit < 0 ? "text-red-600" : "text-gray-600"
                  )}>
                    {formatAmount(profit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Налог (7%):</span>
                  <span className="font-medium text-orange-600">{formatAmount(tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold text-gray-900">Чистая прибыль:</span>
                  <span className={cn(
                    "font-bold text-lg",
                    netProfit > 0 ? "text-green-600" : netProfit < 0 ? "text-red-600" : "text-gray-600"
                  )}>
                    {formatAmount(netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Список расходов */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Расходы</h4>
              <Button
                onClick={() => setIsAddingExpense(!isAddingExpense)}
                size="sm"
                variant={isAddingExpense ? "outline" : "default"}
              >
                <Plus className="h-4 w-4 mr-1" />
                {isAddingExpense ? 'Отмена' : 'Добавить'}
              </Button>
            </div>

            {/* Форма добавления расхода */}
            {isAddingExpense && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <select
                      id="category"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                    >
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Сумма (₽)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newExpense.amount || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Input
                      id="description"
                      value={newExpense.description || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="Опционально"
                    />
                  </div>
                </div>
                <Button onClick={handleAddExpense} size="sm" className="w-full">
                  Сохранить расход
                </Button>
              </div>
            )}

            {/* Таблица расходов */}
            {expenses.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Расходы не добавлены</p>
            ) : (
              <div className="space-y-2">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{expense.category}</span>
                        {expense.description && (
                          <span className="text-sm text-gray-500">— {expense.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-red-600">{formatAmount(expense.amount)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold text-gray-900">Итого расходов:</span>
                  <span className="font-bold text-red-600">{formatAmount(totalExpenses)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
