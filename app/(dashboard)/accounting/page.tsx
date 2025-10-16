'use client';

import { useEffect, useState } from 'react';
import { supabase, Tender, Expense } from '@/lib/supabase';
import { TenderAccounting } from '@/components/TenderAccounting';
import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';

interface TenderWithExpenses {
  tender: Tender;
  expenses: Expense[];
}

export default function AccountingPage() {
  const [tendersWithExpenses, setTendersWithExpenses] = useState<TenderWithExpenses[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных
  const loadData = async () => {
    setIsLoading(true);

    // Загружаем тендеры со статусами "победа", "в работе", "завершён"
    const { data: tenders, error: tendersError } = await supabase
      .from('tenders')
      .select('*')
      .in('status', ['победа', 'в работе', 'завершён'])
      .order('created_at', { ascending: false });

    if (tendersError) {
      console.error('Ошибка загрузки тендеров:', tendersError);
      setIsLoading(false);
      return;
    }

    if (!tenders || tenders.length === 0) {
      setTendersWithExpenses([]);
      setIsLoading(false);
      return;
    }

    // Загружаем расходы для всех тендеров
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .in('tender_id', tenders.map(t => t.id));

    if (expensesError) {
      console.error('Ошибка загрузки расходов:', expensesError);
    }

    // Группируем расходы по тендерам
    const result: TenderWithExpenses[] = tenders.map(tender => ({
      tender,
      expenses: (expenses || []).filter(exp => exp.tender_id === tender.id),
    }));

    setTendersWithExpenses(result);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Общая статистика
  const totalIncome = tendersWithExpenses.reduce((sum, item) => sum + (item.tender.win_price || 0), 0);
  const totalExpenses = tendersWithExpenses.reduce((sum, item) => 
    sum + item.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0
  );
  const grossProfit = totalIncome - totalExpenses;
  const totalTax = grossProfit > 0 ? grossProfit * 0.07 : 0;
  const netProfit = grossProfit - totalTax;

  // Форматирование суммы
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Заголовок */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Бухгалтерия</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          Финансовый учёт по выигранным тендерам
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Загрузка данных...</p>
        </div>
      ) : tendersWithExpenses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет данных для отображения</h3>
          <p className="text-gray-600">
            Выигранные тендеры появятся здесь автоматически
          </p>
        </div>
      ) : (
        <>
          {/* Общая статистика */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Всего тендеров</p>
                  <p className="text-2xl font-bold text-gray-900">{tendersWithExpenses.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Общий доход</p>
                  <p className="text-2xl font-bold text-green-600">{formatAmount(totalIncome)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Общие расходы</p>
                  <p className="text-2xl font-bold text-red-600">{formatAmount(totalExpenses)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Чистая прибыль</p>
                  <p className={`text-2xl font-bold ${netProfit > 0 ? 'text-green-600' : netProfit < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {formatAmount(netProfit)}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${netProfit > 0 ? 'text-green-600' : netProfit < 0 ? 'text-red-600' : 'text-gray-600'}`} />
              </div>
            </div>
          </div>

          {/* Детальная статистика */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Общая статистика</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Всего тендеров:</span>
                  <span className="font-semibold">{tendersWithExpenses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Общий доход:</span>
                  <span className="font-semibold text-green-600">{formatAmount(totalIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Общие расходы:</span>
                  <span className="font-semibold text-red-600">{formatAmount(totalExpenses)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Чистая прибыль:</span>
                  <span className={`font-semibold ${grossProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(grossProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Налоги к уплате (7%):</span>
                  <span className="font-semibold text-orange-600">{formatAmount(totalTax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-gray-900 font-bold">Итого к получению:</span>
                  <span className={`font-bold text-lg ${netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Список тендеров с accordion */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Детализация по тендерам</h2>
            {tendersWithExpenses.map((item) => (
              <TenderAccounting
                key={item.tender.id}
                tender={item.tender}
                expenses={item.expenses}
                onExpenseAdded={loadData}
                onExpenseDeleted={loadData}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
