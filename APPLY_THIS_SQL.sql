-- ============================================
-- ВАЖНО: Выполните этот SQL в Supabase SQL Editor
-- ============================================

-- Шаг 1: Добавляем новые колонки в таблицу files
ALTER TABLE public.files 
ADD COLUMN IF NOT EXISTS tender_id BIGINT REFERENCES public.tenders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'прочее',
ADD COLUMN IF NOT EXISTS uploaded_by TEXT;

-- Шаг 2: Добавляем проверку для document_type (после добавления колонки)
ALTER TABLE public.files 
DROP CONSTRAINT IF EXISTS files_document_type_check;

ALTER TABLE public.files 
ADD CONSTRAINT files_document_type_check 
CHECK (document_type IN ('тендерная документация', 'закрывающие документы', 'прочее'));

-- Шаг 3: Обновляем существующие записи (если есть)
UPDATE public.files 
SET document_type = 'прочее' 
WHERE document_type IS NULL;

-- Шаг 4: Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_files_tender_id ON public.files(tender_id);
CREATE INDEX IF NOT EXISTS idx_files_document_type ON public.files(document_type);

-- Шаг 5: Добавляем комментарии к колонкам
COMMENT ON COLUMN public.files.tender_id IS 'ID тендера, к которому привязан файл';
COMMENT ON COLUMN public.files.document_type IS 'Тип документа: тендерная документация, закрывающие документы, прочее';
COMMENT ON COLUMN public.files.uploaded_by IS 'Пользователь, загрузивший файл';

-- ============================================
-- После выполнения должно появиться: "Success"
-- ============================================
