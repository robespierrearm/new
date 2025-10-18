import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Получение контекста из базы данных для AI
export async function GET() {
  try {
    // Загружаем тендеры
    const { data: tenders, error: tendersError } = await supabase
      .from('tenders')
      .select('*')
      .order('created_at', { ascending: false });

    if (tendersError) {
      console.error('Ошибка загрузки тендеров:', tendersError);
    }

    // Загружаем поставщиков
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*');

    if (suppliersError) {
      console.error('Ошибка загрузки поставщиков:', suppliersError);
    }

    // Загружаем расходы
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*');

    if (expensesError && expensesError.code !== 'PGRST116') {
      console.error('Ошибка загрузки расходов:', expensesError);
    }

    // Формируем статистику
    const stats = {
      tenders: {
        total: tenders?.length || 0,
        byStatus: {
          новый: tenders?.filter(t => t.status === 'новый').length || 0,
          подано: tenders?.filter(t => t.status === 'подано').length || 0,
          'на рассмотрении': tenders?.filter(t => t.status === 'на рассмотрении').length || 0,
          победа: tenders?.filter(t => t.status === 'победа').length || 0,
          'в работе': tenders?.filter(t => t.status === 'в работе').length || 0,
          завершён: tenders?.filter(t => t.status === 'завершён').length || 0,
          проигрыш: tenders?.filter(t => t.status === 'проигрыш').length || 0,
        },
        totalStartPrice: tenders?.reduce((sum, t) => sum + (t.start_price || 0), 0) || 0,
        totalWinPrice: tenders?.reduce((sum, t) => sum + (t.win_price || 0), 0) || 0,
        recentTenders: tenders?.slice(0, 5).map(t => ({
          name: t.name,
          status: t.status,
          start_price: t.start_price,
          win_price: t.win_price,
          publication_date: t.publication_date,
        })) || [],
      },
      suppliers: {
        total: suppliers?.length || 0,
        byCategory: suppliers?.reduce((acc: any, s) => {
          const cat = s.category || 'Без категории';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {}) || {},
      },
      expenses: {
        total: expenses?.length || 0,
        totalAmount: expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0,
        byCategory: expenses?.reduce((acc: any, e) => {
          const cat = e.category || 'Прочее';
          acc[cat] = (acc[cat] || 0) + (e.amount || 0);
          return acc;
        }, {}) || {},
      },
      financial: {
        totalIncome: tenders?.filter(t => t.status === 'завершён').reduce((sum, t) => sum + (t.win_price || 0), 0) || 0,
        totalExpenses: expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0,
      },
    };

    // Вычисляем прибыль и налог
    const grossProfit = stats.financial.totalIncome - stats.financial.totalExpenses;
    const tax = grossProfit > 0 ? grossProfit * 0.07 : 0;
    const netProfit = grossProfit - tax;

    const financialStats = {
      ...stats.financial,
      grossProfit,
      tax,
      netProfit,
    };

    stats.financial = financialStats as any;

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error getting AI context:', error);
    return NextResponse.json(
      { error: 'Ошибка получения контекста' },
      { status: 500 }
    );
  }
}
