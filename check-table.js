const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Не заданы переменные окружения NEXT_PUBLIC_SUPABASE_URL и/или NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  process.exit(1);
}

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
