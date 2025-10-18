import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// API для выполнения действий по запросу AI
export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    
    // Нормализуем название действия (убираем префикс если есть)
    const normalizedAction = action.toLowerCase().replace('add_', '');

    switch (normalizedAction) {
      case 'tender':
        return await addTender(data);
      
      case 'expense':
        return await addExpense(data);
      
      case 'supplier':
        return await addSupplier(data);
      
      default:
        return NextResponse.json(
          { error: `Неизвестное действие: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error in AI action:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка выполнения действия' },
      { status: 500 }
    );
  }
}

// Добавление тендера
async function addTender(data: any) {
  const { error } = await supabase.from('tenders').insert([{
    name: data.name,
    purchase_number: data.purchase_number || null,
    link: data.link || null,
    region: data.region || null,
    publication_date: data.publication_date || new Date().toISOString().split('T')[0],
    submission_date: data.submission_date || null,
    submission_deadline: data.submission_deadline || null,
    start_price: data.start_price || null,
    submitted_price: data.submitted_price || null,
    win_price: data.win_price || null,
    status: data.status || 'новый',
  }]);

  if (error) {
    throw new Error(`Ошибка добавления тендера: ${error.message}`);
  }

  return NextResponse.json({ 
    success: true, 
    message: `Тендер "${data.name}" успешно добавлен` 
  });
}

// Добавление расхода
async function addExpense(data: any) {
  const { error } = await supabase.from('expenses').insert([{
    tender_id: data.tender_id,
    category: data.category || 'Прочее',
    amount: data.amount,
    description: data.description || null,
  }]);

  if (error) {
    throw new Error(`Ошибка добавления расхода: ${error.message}`);
  }

  return NextResponse.json({ 
    success: true, 
    message: `Расход на сумму ${data.amount} ₽ успешно добавлен` 
  });
}

// Добавление поставщика
async function addSupplier(data: any) {
  const { error } = await supabase.from('suppliers').insert([{
    name: data.name,
    contact_person: data.contact_person || null,
    phone: data.phone || null,
    email: data.email || null,
    category: data.category || null,
    notes: data.notes || null,
  }]);

  if (error) {
    throw new Error(`Ошибка добавления поставщика: ${error.message}`);
  }

  return NextResponse.json({ 
    success: true, 
    message: `Поставщик "${data.name}" успешно добавлен` 
  });
}
