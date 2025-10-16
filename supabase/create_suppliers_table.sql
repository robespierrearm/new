-- Создание таблицы suppliers для TenderCRM

CREATE TABLE IF NOT EXISTS public.suppliers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для оптимизации поиска
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_phone ON public.suppliers(phone);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON public.suppliers(created_at);

-- Комментарии к таблице
COMMENT ON TABLE public.suppliers IS 'Таблица поставщиков для CRM системы';
COMMENT ON COLUMN public.suppliers.id IS 'Уникальный идентификатор поставщика';
COMMENT ON COLUMN public.suppliers.name IS 'Название компании поставщика';
COMMENT ON COLUMN public.suppliers.contact_person IS 'Контактное лицо';
COMMENT ON COLUMN public.suppliers.phone IS 'Телефон';
COMMENT ON COLUMN public.suppliers.email IS 'Email';
COMMENT ON COLUMN public.suppliers.category IS 'Категория поставщика';
COMMENT ON COLUMN public.suppliers.notes IS 'Примечания';
COMMENT ON COLUMN public.suppliers.created_at IS 'Дата создания записи';
