-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_online BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Комментарии для таблицы users
COMMENT ON TABLE public.users IS 'Пользователи системы';
COMMENT ON COLUMN public.users.username IS 'Имя пользователя';
COMMENT ON COLUMN public.users.email IS 'Email пользователя';
COMMENT ON COLUMN public.users.password IS 'Пароль (хешированный)';
COMMENT ON COLUMN public.users.is_online IS 'Статус онлайн';
COMMENT ON COLUMN public.users.is_active IS 'Активен ли пользователь (деактивированные не могут войти)';
COMMENT ON COLUMN public.users.last_activity IS 'Время последней активности';

-- Индексы для users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON public.users(is_online);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Создание таблицы логов действий
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  action_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Комментарии для таблицы activity_logs
COMMENT ON TABLE public.activity_logs IS 'Журнал действий пользователей';
COMMENT ON COLUMN public.activity_logs.user_id IS 'ID пользователя';
COMMENT ON COLUMN public.activity_logs.username IS 'Имя пользователя';
COMMENT ON COLUMN public.activity_logs.action IS 'Описание действия';
COMMENT ON COLUMN public.activity_logs.action_type IS 'Тип действия (login, logout, tender_add, tender_edit, etc.)';
COMMENT ON COLUMN public.activity_logs.details IS 'Дополнительные детали (JSON)';

-- Индексы для activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON public.activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Политики доступа для users (все могут читать и изменять)
CREATE POLICY "Enable read access for all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.users
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.users
  FOR DELETE USING (true);

-- Политики доступа для activity_logs (все могут читать и добавлять)
CREATE POLICY "Enable read access for all users" ON public.activity_logs
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- Триггер для автоматического обновления updated_at в users
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- Вставка главного администратора
INSERT INTO public.users (username, email, password, is_online, is_active, last_activity)
VALUES ('Armen', 'Armen@gmail.com', 'Armen@gmail.com', false, true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Лог создания администратора
INSERT INTO public.activity_logs (user_id, username, action, action_type, details)
SELECT id, username, 'Создан главный администратор', 'system', '{"role": "admin"}'::jsonb
FROM public.users
WHERE email = 'Armen@gmail.com'
ON CONFLICT DO NOTHING;
