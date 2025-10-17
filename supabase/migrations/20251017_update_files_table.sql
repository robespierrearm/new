-- Обновление таблицы files для интеграции с тендерами

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
