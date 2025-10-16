-- Настройка Row Level Security (RLS) для таблицы expenses

-- 1. Включаем RLS для таблицы expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 2. Создаём политику для SELECT (чтение) - доступно всем
CREATE POLICY "Enable read access for all users" ON public.expenses
  FOR SELECT
  USING (true);

-- 3. Создаём политику для INSERT (добавление) - доступно всем
CREATE POLICY "Enable insert access for all users" ON public.expenses
  FOR INSERT
  WITH CHECK (true);

-- 4. Создаём политику для UPDATE (обновление) - доступно всем
CREATE POLICY "Enable update access for all users" ON public.expenses
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 5. Создаём политику для DELETE (удаление) - доступно всем
CREATE POLICY "Enable delete access for all users" ON public.expenses
  FOR DELETE
  USING (true);

-- Проверка: показать все политики для expenses
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'expenses';
