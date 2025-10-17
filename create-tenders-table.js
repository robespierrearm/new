const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Не заданы переменные окружения NEXT_PUBLIC_SUPABASE_URL и/или NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  console.error('   Установите их в .env.local или экспортируйте перед запуском скрипта.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const createTable = async () => {
  console.log('🔧 Создание таблицы tenders в Supabase...');
  
  const sql = `
-- Создание таблицы tenders для TenderCRM
CREATE TABLE IF NOT EXISTS public.tenders (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  link TEXT,
  publication_date DATE NOT NULL,
  submission_date DATE,
  start_price NUMERIC(15, 2),
  win_price NUMERIC(15, 2),
  status TEXT NOT NULL CHECK (status IN ('черновик', 'подано', 'победа')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_tenders_status ON public.tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_publication_date ON public.tenders(publication_date);
CREATE INDEX IF NOT EXISTS idx_tenders_created_at ON public.tenders(created_at);

-- Комментарии к таблице
COMMENT ON TABLE public.tenders IS 'Таблица тендеров для CRM системы';
`;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Ошибка создания таблицы:', error.message);
      console.log('\n📝 Создайте таблицу вручную:');
      console.log('1. Откройте ваш Supabase Dashboard → SQL Editor');
      console.log('2. Скопируйте содержимое файла supabase/create_tenders_table.sql');
      console.log('3. Выполните SQL скрипт');
    } else {
      console.log('✅ Таблица tenders успешно создана!');
    }
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    console.log('\n📝 Создайте таблицу вручную:');
    console.log('1. Откройте ваш Supabase Dashboard → SQL Editor');
    console.log('2. Скопируйте содержимое файла supabase/create_tenders_table.sql');
    console.log('3. Выполните SQL скрипт');
  }
};

createTable();
