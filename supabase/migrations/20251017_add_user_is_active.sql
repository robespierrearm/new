-- Добавление поля is_active для деактивации пользователей
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Комментарий
COMMENT ON COLUMN public.users.is_active IS 'Активен ли пользователь (деактивированные не могут войти)';

-- Индекс
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
