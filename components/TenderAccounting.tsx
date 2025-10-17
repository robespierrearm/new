'use client';

import { useMemo, useState } from 'react';
import { Tender, Expense, ExpenseInsert, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Plus, Trash2, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TenderAccountingProps {
  tender: Tender;
  expenses: Expense[];
  onExpenseAdded: () => void;
  onExpenseDeleted: () => void;
}

export function TenderAccounting({ tender, expenses, onExpenseAdded, onExpenseDeleted }: TenderAccountingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<ExpenseInsert>({
    tender_id: tender.id,
    category: '',
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
  const formattedSummary = useMemo(() => ({
    income,
    totalExpenses,
    profit,
    tax,
    netProfit,
  }), [income, totalExpenses, profit, tax, netProfit]);

  // Форматирование суммы
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Генерация PDF-отчёта
  const buildPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 40;

    // "Логотип" TenderCRM (текстом)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('TenderCRM', 40, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Отчёт по тендеру: ${tender.name}`, 40, (y += 18));
    doc.text(`Дата формирования: ${formatDate(new Date())}`, 40, (y += 16));

    // Сводка
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Финансовая сводка', 40, y);
    doc.setFont('helvetica', 'normal');
    y += 16;
    const summaryRows = [
      ['Доход', formatCurrency(formattedSummary.income)],
      ['Расходы', formatCurrency(formattedSummary.totalExpenses)],
      ['Прибыль', formatCurrency(formattedSummary.profit)],
      ['Налог (7%)', formatCurrency(formattedSummary.tax)],
      ['Чистая прибыль', formatCurrency(formattedSummary.netProfit)],
    ];
    autoTable(doc, {
      startY: y,
      theme: 'striped',
      head: [['Показатель', 'Значение']],
      body: summaryRows,
      styles: { font: 'helvetica' },
      headStyles: { fillColor: [240, 240, 240] },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 40, right: 40 },
    });

    // Таблица расходов
    const afterSummaryY = (doc as any).lastAutoTable?.finalY || 40;
    const expenseRows = expenses.map((e) => [e.description || '—', e.category, formatCurrency(e.amount)]);
    autoTable(doc, {
      startY: afterSummaryY + 24,
      theme: 'striped',
      head: [['Поставщик/описание', 'Категория', 'Сумма']],
      body: expenseRows,
      styles: { font: 'helvetica' },
      headStyles: { fillColor: [240, 240, 240] },
      columnStyles: { 2: { halign: 'right' } },
      margin: { left: 40, right: 40 },
    });

    // Итоговая строка с чистой прибылью
    const afterExpensesY = (doc as any).lastAutoTable?.finalY || afterSummaryY + 24;
    doc.setFont('helvetica', 'bold');
    doc.text(`Итого (чистая прибыль): ${formatCurrency(formattedSummary.netProfit)}`, 40, afterExpensesY + 24);

    return doc;
  };

  const handleDownloadPdf = () => {
    const doc = buildPdf();
    const safeName = (tender.name || 'тендер').replace(/[^\p{L}\p{N}\s_-]/gu, '').slice(0, 60).trim();
    const filename = `Отчет_${safeName || 'тендер'}.pdf`;
    doc.save(filename);
  };

  const handleSharePdf = async () => {
    try {
      setIsSharing(true);
      const doc = buildPdf();
      const blob = doc.output('blob');
      const safeName = (tender.name || 'тендер').replace(/[^\p{L}\p{N}\s_-]/gu, '').slice(0, 60).trim();
      const filename = `Отчет_${safeName || 'тендер'}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      if (navigator.share && (navigator as any).canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename, text: `Отчёт по тендеру: ${tender.name}` });
      } else {
        // Фоллбек: просто скачать файл, если шаринг недоступен
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
      alert('Не удалось переслать отчёт');
    } finally {
      setIsSharing(false);
    }
  };

  // Добавление расхода
  const handleAddExpense = async () => {
    if (!newExpense.category.trim()) {
      alert('Введите категорию расхода');
      return;
    }

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
        category: '',
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
            <div className="bg-white p-4 rounded-lg border col-span-2">
              <Button
                type="button"
                onClick={() => setIsModalOpen(true)}
                size="sm"
                variant="secondary"
                className="mb-3 inline-flex items-center gap-2 border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 transition-shadow shadow-sm hover:shadow"
                aria-label="Открыть финансовую сводку"
              >
                <BarChart3 className="h-4 w-4" />
                Финансовая сводка
              </Button>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Доход из контракта:</span>
                  <span className="font-medium text-green-600">{formatAmount(income)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Расходы:</span>
                  <span className="font-medium text-red-600">{formatAmount(totalExpenses)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Прибыль:</span>
                  <span className={cn(
                    "font-medium",
                    profit > 0 ? "text-green-600" : profit < 0 ? "text-red-600" : "text-gray-600"
                  )}>
                    {formatAmount(profit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Налог УСН (7%):</span>
                  <span className="font-medium text-orange-600">{formatAmount(tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
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
                    <Input
                      id="category"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      placeholder="Например: Материалы"
                    />
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
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 opacity-100 animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full sm:max-w-2xl mx-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-4 sm:p-6 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Финансовая сводка — {tender.name}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-600">Доход</span>
                  <span className="font-semibold text-green-600">{formatAmount(formattedSummary.income)}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-600">Расходы</span>
                  <span className="font-semibold text-red-600">{formatAmount(formattedSummary.totalExpenses)}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-600">Прибыль</span>
                  <span className={cn(
                    'font-semibold',
                    formattedSummary.profit > 0 ? 'text-green-600' : formattedSummary.profit < 0 ? 'text-red-600' : 'text-gray-600'
                  )}>{formatAmount(formattedSummary.profit)}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-600">Налог (7%)</span>
                  <span className="font-semibold text-orange-600">{formatAmount(formattedSummary.tax)}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3 sm:col-span-2">
                  <span className="font-semibold text-gray-900">Чистая прибыль</span>
                  <span className={cn(
                    'font-bold',
                    formattedSummary.netProfit > 0 ? 'text-green-700' : formattedSummary.netProfit < 0 ? 'text-red-700' : 'text-gray-700'
                  )}>{formatAmount(formattedSummary.netProfit)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Детализация расходов</h4>
                {expenses.length === 0 ? (
                  <p className="text-sm text-gray-500">Расходы не добавлены</p>
                ) : (
                  <div className="max-h-64 overflow-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="text-left p-2">Поставщик/описание</th>
                          <th className="text-left p-2">Категория</th>
                          <th className="text-right p-2">Сумма</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((e) => (
                          <tr key={e.id} className="border-t">
                            <td className="p-2">{e.description || '—'}</td>
                            <td className="p-2">{e.category}</td>
                            <td className="p-2 text-right font-medium">{formatAmount(e.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
                <Button onClick={() => handleDownloadPdf()} variant="default">Скачать PDF</Button>
                <Button onClick={() => handleSharePdf()} variant="outline" disabled={isSharing}>{isSharing ? 'Подготовка…' : 'Переслать'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(d: Date) {
  return d.toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}
 
