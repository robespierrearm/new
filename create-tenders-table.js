const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pfxzckysajoeuafisfym.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmeHpja3lzYWpvZXVhZmlzZnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzODgsImV4cCI6MjA3NTE0MTM4OH0.VK-G25BzsA72qaDm-wQtEHbnwgrShmRZzDYHaZPTmOo';

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
      console.log('1. Откройте https://supabase.com/dashboard/project/pfxzckysajoeuafisfym/sql');
      console.log('2. Скопируйте содержимое файла supabase/create_tenders_table.sql');
      console.log('3. Выполните SQL скрипт');
    } else {
      console.log('✅ Таблица tenders успешно создана!');
    }
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    console.log('\n📝 Создайте таблицу вручную:');
    console.log('1. Откройте https://supabase.com/dashboard/project/pfxzckysajoeuafisfym/sql');
    console.log('2. Скопируйте содержимое файла supabase/create_tenders_table.sql');
    console.log('3. Выполните SQL скрипт');
  }
};

createTable();
