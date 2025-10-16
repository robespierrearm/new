-- Создание таблицы expenses для учёта расходов по тендерам

CREATE TABLE IF NOT EXISTS public.expenses (
  id BIGSERIAL PRIMARY KEY,
  tender_id BIGINT NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_expenses_tender_id ON public.expenses(tender_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_expenses_updated_at ON public.expenses;
CREATE TRIGGER trigger_update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_expenses_updated_at();

-- Комментарии к таблице
COMMENT ON TABLE public.expenses IS 'Таблица расходов по тендерам для бухгалтерии';
COMMENT ON COLUMN public.expenses.id IS 'Уникальный идентификатор расхода';
COMMENT ON COLUMN public.expenses.tender_id IS 'ID тендера (внешний ключ)';
COMMENT ON COLUMN public.expenses.category IS 'Категория расхода (материалы, работа, транспорт, налоги и т.д.)';
COMMENT ON COLUMN public.expenses.amount IS 'Сумма расхода в рублях';
COMMENT ON COLUMN public.expenses.description IS 'Описание расхода';
COMMENT ON COLUMN public.expenses.created_at IS 'Дата создания записи';
COMMENT ON COLUMN public.expenses.updated_at IS 'Дата последнего обновления (автоматически)';

-- Пример данных для тестирования (опционально, можно удалить)
-- INSERT INTO public.expenses (tender_id, category, amount, description) VALUES
-- (1, 'Материалы', 500000.00, 'Закупка стройматериалов'),
-- (1, 'Работа', 300000.00, 'Оплата труда рабочих'),
-- (1, 'Транспорт', 50000.00, 'Доставка материалов');
