-- Настройка Row Level Security (RLS) для всех таблиц CRM

-- ============================================
-- ТАБЛИЦА: tenders
-- ============================================

-- Включаем RLS
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tenders;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.tenders;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.tenders;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.tenders;

-- Создаём новые политики (доступ для всех)
CREATE POLICY "Enable read access for all users" ON public.tenders
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.tenders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.tenders
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON public.tenders
  FOR DELETE USING (true);

-- ============================================
-- ТАБЛИЦА: expenses
-- ============================================

-- Включаем RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Enable read access for all users" ON public.expenses;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.expenses;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.expenses;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.expenses;

-- Создаём новые политики (доступ для всех)
CREATE POLICY "Enable read access for all users" ON public.expenses
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.expenses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.expenses
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON public.expenses
  FOR DELETE USING (true);

-- ============================================
-- ТАБЛИЦА: suppliers
-- ============================================

-- Включаем RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Enable read access for all users" ON public.suppliers;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.suppliers;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.suppliers;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.suppliers;

-- Создаём новые политики (доступ для всех)
CREATE POLICY "Enable read access for all users" ON public.suppliers
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.suppliers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.suppliers
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON public.suppliers
  FOR DELETE USING (true);

-- ============================================
-- ПРОВЕРКА: Показать все политики
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN ('tenders', 'expenses', 'suppliers')
ORDER BY tablename, cmd;
