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
COMMENT ON COLUMN public.tenders.id IS 'Уникальный идентификатор тендера';
COMMENT ON COLUMN public.tenders.name IS 'Название тендера';
COMMENT ON COLUMN public.tenders.link IS 'Ссылка на тендер';
COMMENT ON COLUMN public.tenders.publication_date IS 'Дата публикации тендера';
COMMENT ON COLUMN public.tenders.submission_date IS 'Дата подачи заявки';
COMMENT ON COLUMN public.tenders.start_price IS 'Начальная цена тендера';
COMMENT ON COLUMN public.tenders.win_price IS 'Цена победы (заполняется при статусе "победа")';
COMMENT ON COLUMN public.tenders.status IS 'Статус тендера: черновик, подано, победа';
COMMENT ON COLUMN public.tenders.created_at IS 'Дата создания записи';
