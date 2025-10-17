-- Создание таблицы для ссылок в тендерной документации

CREATE TABLE IF NOT EXISTS public.tender_links (
  id BIGSERIAL PRIMARY KEY,
  tender_id BIGINT NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  document_type TEXT DEFAULT 'тендерная документация',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Комментарии
COMMENT ON TABLE public.tender_links IS 'Ссылки в тендерной документации';
COMMENT ON COLUMN public.tender_links.tender_id IS 'ID тендера';
COMMENT ON COLUMN public.tender_links.name IS 'Название ссылки';
COMMENT ON COLUMN public.tender_links.url IS 'URL ссылки';
COMMENT ON COLUMN public.tender_links.document_type IS 'Тип документа (тендерная документация, закрывающие документы, прочее)';
COMMENT ON COLUMN public.tender_links.description IS 'Описание ссылки';

-- Индексы
CREATE INDEX IF NOT EXISTS idx_tender_links_tender_id ON public.tender_links(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_links_document_type ON public.tender_links(document_type);

-- RLS (Row Level Security)
ALTER TABLE public.tender_links ENABLE ROW LEVEL SECURITY;

-- Политики доступа (все могут читать и изменять)
CREATE POLICY "Enable read access for all users" ON public.tender_links
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.tender_links
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.tender_links
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.tender_links
  FOR DELETE USING (true);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_tender_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tender_links_updated_at
  BEFORE UPDATE ON public.tender_links
  FOR EACH ROW
  EXECUTE FUNCTION update_tender_links_updated_at();
