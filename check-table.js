const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pfxzckysajoeuafisfym.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmeHpja3lzYWpvZXVhZmlzZnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzODgsImV4cCI6MjA3NTE0MTM4OH0.VK-G25BzsA72qaDm-wQtEHbnwgrShmRZzDYHaZPTmOo';

const supabase = createClient(supabaseUrl, supabaseKey);

const checkTable = async () => {
  console.log('🔍 Проверка структуры таблицы tenders...\n');
  
  const { data, error } = await supabase
    .from('tenders')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Ошибка:', error.message);
    console.log('\n💡 Таблица tenders не существует или недоступна');
  } else {
    console.log('✅ Таблица tenders существует');
    console.log('📊 Структура (первая запись):');
    console.log(JSON.stringify(data, null, 2));
  }
};

checkTable();
