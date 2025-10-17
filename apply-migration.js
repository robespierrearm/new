const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Не заданы переменные окружения');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const applyMigration = async () => {
  console.log('🔧 Применение миграции для таблицы files...\n');
  
  const migration = `
-- Добавляем новые колонки
ALTER TABLE public.files 
ADD COLUMN IF NOT EXISTS tender_id BIGINT REFERENCES public.tenders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'прочее' CHECK (document_type IN ('тендерная документация', 'закрывающие документы', 'прочее')),
ADD COLUMN IF NOT EXISTS uploaded_by TEXT;

-- Обновляем индексы
CREATE INDEX IF NOT EXISTS idx_files_tender_id ON public.files(tender_id);
CREATE INDEX IF NOT EXISTS idx_files_document_type ON public.files(document_type);

-- Комментарии
COMMENT ON COLUMN public.files.tender_id IS 'ID тендера, к которому привязан файл';
COMMENT ON COLUMN public.files.document_type IS 'Тип документа: тендерная документация, закрывающие документы, прочее';
COMMENT ON COLUMN public.files.uploaded_by IS 'Пользователь, загрузивший файл';
  `.trim();
  
  console.log('📝 SQL миграция:');
  console.log('─'.repeat(50));
  console.log(migration);
  console.log('─'.repeat(50));
  console.log('\n⚠️  ВНИМАНИЕ: Эту миграцию нужно применить вручную через SQL Editor!\n');
  console.log('📋 Инструкция:');
  console.log('1. Откройте SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/dauikktsjknklmyonjik/sql/new');
  console.log('\n2. Скопируйте SQL выше');
  console.log('\n3. Вставьте в SQL Editor');
  console.log('\n4. Нажмите "Run" или Ctrl+Enter');
  console.log('\n5. Проверьте результат - должно быть "Success"');
  console.log('\n✅ После этого перезапустите приложение: npm run dev');
};

applyMigration();
