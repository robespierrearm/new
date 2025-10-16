-- Добавление колонки submitted_price для цены подачи заявки

ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS submitted_price NUMERIC(15, 2);

-- Индекс для submitted_price
CREATE INDEX IF NOT EXISTS idx_tenders_submitted_price ON public.tenders(submitted_price);

-- Комментарий
COMMENT ON COLUMN public.tenders.submitted_price IS 'Цена по которой подали заявку на тендер';
