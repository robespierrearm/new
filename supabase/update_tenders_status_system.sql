-- Обновление таблицы tenders для системы смены статусов

-- Добавляем новую колонку submission_deadline если её нет
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS submission_deadline DATE;
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Удаляем старое ограничение статуса
ALTER TABLE public.tenders DROP CONSTRAINT IF EXISTS tenders_status_check;

-- Добавляем новое ограничение с 7 статусами
ALTER TABLE public.tenders ADD CONSTRAINT tenders_status_check 
  CHECK (status IN ('новый', 'подано', 'на рассмотрении', 'победа', 'в работе', 'завершён', 'проигрыш'));

-- Обновляем старые статусы на новые (если есть данные)
UPDATE public.tenders SET status = 'новый' WHERE status = 'черновик';
UPDATE public.tenders SET status = 'завершён' WHERE status = 'победа' AND win_price IS NOT NULL;

-- Устанавливаем статус по умолчанию
ALTER TABLE public.tenders ALTER COLUMN status SET DEFAULT 'новый';

-- Индекс для submission_deadline
CREATE INDEX IF NOT EXISTS idx_tenders_submission_deadline ON public.tenders(submission_deadline);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_tenders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_tenders_updated_at ON public.tenders;
CREATE TRIGGER trigger_update_tenders_updated_at
    BEFORE UPDATE ON public.tenders
    FOR EACH ROW
    EXECUTE FUNCTION update_tenders_updated_at();

-- Комментарии
COMMENT ON COLUMN public.tenders.submission_deadline IS 'Дедлайн подачи заявки';
COMMENT ON COLUMN public.tenders.status IS 'Статус: новый, подано, на рассмотрении, победа, в работе, завершён, проигрыш';
COMMENT ON COLUMN public.tenders.updated_at IS 'Дата последнего обновления (автоматически)';
