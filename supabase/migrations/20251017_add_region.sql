-- Добавление поля region в таблицу tenders

ALTER TABLE public.tenders 
ADD COLUMN IF NOT EXISTS region TEXT;

COMMENT ON COLUMN public.tenders.region IS 'Регион / Адрес доставки';

CREATE INDEX IF NOT EXISTS idx_tenders_region ON public.tenders(region);
