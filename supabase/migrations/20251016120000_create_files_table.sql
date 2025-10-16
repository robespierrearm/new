-- Создание таблицы для хранения метаданных файлов

CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  category TEXT DEFAULT 'прочее',
  show_on_dashboard BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Политики доступа (доступ для всех)
CREATE POLICY "Enable read access for all users" ON public.files
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.files
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.files
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON public.files
  FOR DELETE USING (true);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_files_category ON public.files(category);
CREATE INDEX IF NOT EXISTS idx_files_dashboard ON public.files(show_on_dashboard);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON public.files(uploaded_at DESC);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_files_updated_at
  BEFORE UPDATE ON public.files
  FOR EACH ROW
  EXECUTE FUNCTION update_files_updated_at();

-- Комментарии
COMMENT ON TABLE public.files IS 'Метаданные загруженных файлов';
COMMENT ON COLUMN public.files.name IS 'Название файла (пользовательское)';
COMMENT ON COLUMN public.files.original_name IS 'Оригинальное имя файла';
COMMENT ON COLUMN public.files.file_path IS 'Путь к файлу в Supabase Storage';
COMMENT ON COLUMN public.files.category IS 'Категория файла';
COMMENT ON COLUMN public.files.show_on_dashboard IS 'Показывать на дашборде';
