# 🚀 Инструкция по настройке TenderCRM

## ✅ Что уже сделано:

### **1. Система смены статусов тендеров**
- 7 статусов: Новый → Подано → На рассмотрении → Победа/Проигрыш → В работе → Завершён
- Автоматические действия при смене статуса
- Валидация перед переходом
- Кнопки смены статуса в таблице

### **2. Система бухгалтерии**
- Accordion-карточки для каждого тендера
- Автоматическое появление выигранных тендеров
- Добавление/удаление расходов
- Автоматический расчёт прибыли и налогов (7%)
- Общая статистика

---

## 🔧 Настройка БД в Supabase (ОБЯЗАТЕЛЬНО):

### **Шаг 1: Обновите таблицу tenders**

Откройте SQL Editor в Supabase:
https://supabase.com/dashboard/project/dauikktsjknklmyonjik/sql/new

Выполните:

```sql
-- 1. Удаляем старое ограничение
ALTER TABLE public.tenders DROP CONSTRAINT IF EXISTS tenders_status_check;

-- 2. Обновляем старые статусы
UPDATE public.tenders SET status = 'новый' WHERE status = 'черновик';
UPDATE public.tenders SET status = 'завершён' WHERE status = 'победа';

-- 3. Добавляем новые колонки
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS submission_deadline DATE;
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Добавляем новое ограничение
ALTER TABLE public.tenders ADD CONSTRAINT tenders_status_check 
  CHECK (status IN ('новый', 'подано', 'на рассмотрении', 'победа', 'в работе', 'завершён', 'проигрыш'));

-- 5. Устанавливаем статус по умолчанию
ALTER TABLE public.tenders ALTER COLUMN status SET DEFAULT 'новый';

-- 6. Индекс
CREATE INDEX IF NOT EXISTS idx_tenders_submission_deadline ON public.tenders(submission_deadline);

-- 7. Триггер для updated_at
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
```

---

### **Шаг 2: Создайте таблицу expenses**

В том же SQL Editor выполните:

```sql
-- Создание таблицы expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id BIGSERIAL PRIMARY KEY,
  tender_id BIGINT NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_expenses_tender_id ON public.expenses(tender_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at);

-- Триггер для updated_at
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
```

---

## 🎯 Запуск локально:

```bash
# 1. Установите зависимости (если ещё не установлены)
npm install

# 2. Проверьте .env.local (должен содержать Supabase credentials)
cat .env.local

# 3. Запустите dev сервер
npm run dev

# 4. Откройте в браузере
# http://localhost:3000 (или 3001 если 3000 занят)
```

---

## 📱 Основные страницы:

- **Дашборд:** http://localhost:3000/dashboard
- **Тендеры:** http://localhost:3000/tenders
- **Бухгалтерия:** http://localhost:3000/accounting
- **Поставщики:** http://localhost:3000/suppliers
- **Настройки:** http://localhost:3000/settings

---

## 🔄 Деплой на GitHub Pages:

```bash
# 1. Соберите проект
npm run build

# 2. Проверьте что сборка успешна
# Должно быть: "✓ Compiled successfully"

# 3. Загрузите в Git
git add -A
git commit -m "Update"
git push origin main

# 4. GitHub Pages обновится автоматически
# Подождите 2-3 минуты
```

---

## ❗ Частые проблемы:

### **1. Ошибка "tenders_status_check violated"**
**Решение:** Выполните Шаг 1 (обновление таблицы tenders)

### **2. Ошибка "relation expenses does not exist"**
**Решение:** Выполните Шаг 2 (создание таблицы expenses)

### **3. Порт 3000 занят**
**Решение:** Next.js автоматически использует 3001. Или остановите процесс на 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

### **4. Белый экран после деплоя**
**Решение:** 
- Очистите кэш браузера (Ctrl+Shift+R)
- Откройте в режиме инкогнито
- Подождите 5-10 минут (GitHub Pages кэширует)

---

## 📝 Тестирование функционала:

### **Тендеры:**
1. Добавьте новый тендер (статус "Новый")
2. Переведите в "Подано" (автоматически заполнится дата подачи)
3. Переведите в "На рассмотрении"
4. Выберите "Победа" (введите цену победы)
5. Переведите в "В работе"
6. Переведите в "Завершён"

### **Бухгалтерия:**
1. Откройте /accounting
2. Тендер со статусом "Победа" появится автоматически
3. Раскройте карточку тендера
4. Добавьте расходы (категория вводится вручную)
5. Проверьте расчёты (прибыль, налог 7%)

---

## 🔗 Полезные ссылки:

- **GitHub:** https://github.com/robespierrearm/new
- **Supabase Dashboard:** https://supabase.com/dashboard/project/dauikktsjknklmyonjik
- **SQL Editor:** https://supabase.com/dashboard/project/dauikktsjknklmyonjik/sql/new

---

## ✅ Checklist настройки:

- [ ] Выполнен Шаг 1: обновлена таблица tenders
- [ ] Выполнен Шаг 2: создана таблица expenses
- [ ] Проверен .env.local
- [ ] Запущен npm run dev
- [ ] Открыт http://localhost:3000
- [ ] Протестированы тендеры
- [ ] Протестирована бухгалтерия
- [ ] Выполнен npm run build (без ошибок)
- [ ] Загружено в Git

---

**После выполнения всех шагов система полностью готова к работе! 🚀**
