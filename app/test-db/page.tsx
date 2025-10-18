'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestDBPage() {
  const [status, setStatus] = useState('Проверка подключения...');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Проверяем переменные окружения
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        console.log('Supabase URL:', url);
        console.log('Supabase Key exists:', !!key);
        
        if (!url || !key) {
          setStatus('❌ Переменные окружения не загружены');
          setError({ message: 'NEXT_PUBLIC_SUPABASE_URL или NEXT_PUBLIC_SUPABASE_ANON_KEY отсутствуют' });
          return;
        }

        setStatus('Подключение к базе данных...');

        // Пробуем разные таблицы
        const tables = ['users', 'tenders', 'suppliers', 'messages'];
        const results: any = {};

        for (const table of tables) {
          try {
            setStatus(`Проверка таблицы: ${table}...`);
            console.log(`Checking table: ${table}`);
            
            const { data, error, count } = await supabase
              .from(table)
              .select('*', { count: 'exact', head: false })
              .limit(3);

            if (error) {
              console.error(`Error in ${table}:`, error);
              results[table] = { error: error.message, code: error.code };
            } else {
              console.log(`Success ${table}:`, data);
              results[table] = { success: true, count, data };
            }
          } catch (err: any) {
            console.error(`Exception in ${table}:`, err);
            results[table] = { error: err.message };
          }
        }

        setStatus('✅ Проверка завершена!');
        setData(results);
        console.log('All results:', results);

      } catch (err) {
        setStatus('❌ Критическая ошибка');
        setError(err);
        console.error('Critical error:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Тест подключения к базе данных</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold mb-2">Статус:</h2>
          <p className="text-lg">{status}</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="font-semibold mb-2 text-red-700">Ошибка:</h2>
            <pre className="text-sm overflow-auto">{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}

        {data && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="font-semibold mb-2 text-green-700">Данные получены:</h2>
            <p className="mb-2">Найдено записей: {data.length}</p>
            <pre className="text-sm overflow-auto bg-white p-3 rounded border">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="font-semibold mb-2">Переменные окружения:</h2>
          <div className="space-y-1 text-sm">
            <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Не установлена'}</p>
            <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Установлена' : '❌ Не установлена'}</p>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="font-semibold mb-2">Инструкции:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Проверьте консоль браузера (F12) на наличие ошибок</li>
            <li>Проверьте вкладку Network на наличие запросов к Supabase</li>
            <li>Убедитесь, что файл .env.local существует и содержит правильные ключи</li>
            <li>Перезапустите сервер разработки после изменения .env.local</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
