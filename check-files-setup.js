const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Не заданы переменные окружения');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const checkSetup = async () => {
  console.log('🔍 Проверка настройки системы файлов...\n');
  
  // Проверка таблицы files
  console.log('1️⃣ Проверка таблицы files...');
  const { data: tableData, error: tableError } = await supabase
    .from('files')
    .select('*')
    .limit(1);
  
  if (tableError) {
    console.error('❌ Таблица files не существует или недоступна:', tableError.message);
  } else {
    console.log('✅ Таблица files существует');
    
    // Проверка новых колонок
    if (tableData && tableData.length > 0) {
      const firstRow = tableData[0];
      console.log('   Колонки:', Object.keys(firstRow).join(', '));
      
      if ('tender_id' in firstRow) {
        console.log('   ✅ Колонка tender_id существует');
      } else {
        console.log('   ❌ Колонка tender_id отсутствует - нужно применить миграцию!');
      }
      
      if ('document_type' in firstRow) {
        console.log('   ✅ Колонка document_type существует');
      } else {
        console.log('   ❌ Колонка document_type отсутствует - нужно применить миграцию!');
      }
    } else {
      console.log('   ℹ️  Таблица пустая, невозможно проверить колонки');
    }
  }
  
  // Проверка Storage bucket
  console.log('\n2️⃣ Проверка Storage bucket "files"...');
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets();
  
  if (bucketsError) {
    console.error('❌ Ошибка получения списка buckets:', bucketsError.message);
  } else {
    const filesBucket = buckets.find(b => b.name === 'files');
    if (filesBucket) {
      console.log('✅ Bucket "files" существует');
      console.log('   ID:', filesBucket.id);
      console.log('   Public:', filesBucket.public);
    } else {
      console.log('❌ Bucket "files" не существует - нужно создать!');
      console.log('\n📝 Инструкция по созданию bucket:');
      console.log('1. Откройте: https://supabase.com/dashboard/project/dauikktsjknklmyonjik/storage/buckets');
      console.log('2. Нажмите "New bucket"');
      console.log('3. Название: files');
      console.log('4. Public bucket: Да (для простоты) или Нет (для безопасности)');
      console.log('5. Нажмите "Create bucket"');
    }
  }
  
  // Попытка загрузить тестовый файл
  console.log('\n3️⃣ Проверка возможности загрузки файла...');
  const testContent = new Blob(['test'], { type: 'text/plain' });
  const testPath = `test_${Date.now()}.txt`;
  
  const { error: uploadError } = await supabase.storage
    .from('files')
    .upload(testPath, testContent);
  
  if (uploadError) {
    console.error('❌ Ошибка загрузки тестового файла:', uploadError.message);
    console.log('\n💡 Возможные причины:');
    console.log('   - Bucket "files" не существует');
    console.log('   - Нет прав на загрузку (проверьте Storage Policies)');
  } else {
    console.log('✅ Тестовый файл успешно загружен');
    
    // Удаляем тестовый файл
    await supabase.storage.from('files').remove([testPath]);
    console.log('✅ Тестовый файл удален');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Проверка завершена!');
};

checkSetup();
