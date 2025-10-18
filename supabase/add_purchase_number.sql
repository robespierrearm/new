-- Добавление колонки purchase_number (номер гос закупки) в таблицу tenders

ALTER TABLE public.tenders 
ADD COLUMN IF NOT EXISTS purchase_number TEXT;

-- Добавляем комментарий к колонке
COMMENT ON COLUMN public.tenders.purchase_number IS 'Номер государственной закупки';

-- Создаем индекс для быстрого поиска по номеру закупки
CREATE INDEX IF NOT EXISTS idx_tenders_purchase_number ON public.tenders(purchase_number);
