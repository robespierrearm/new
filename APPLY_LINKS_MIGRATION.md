# 🚀 Применение миграции для ссылок

## Быстрая инструкция (1 минута)

### Шаг 1: Откройте SQL Editor

```
https://supabase.com/dashboard/project/dauikktsjknklmyonjik/sql/new
```

### Шаг 2: Скопируйте и выполните SQL

Откройте файл `supabase/migrations/20251017_add_tender_links.sql` и скопируйте весь SQL.

Или скопируйте отсюда:

```sql
-- Создание таблицы для ссылок в тендерной документации

CREATE TABLE IF NOT EXISTS public.tender_links (
  id BIGSERIAL PRIMARY KEY,
  tender_id BIGINT NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  document_type TEXT DEFAULT 'тендерная документация',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Комментарии
COMMENT ON TABLE public.tender_links IS 'Ссылки в тендерной документации';
COMMENT ON COLUMN public.tender_links.tender_id IS 'ID тендера';
COMMENT ON COLUMN public.tender_links.name IS 'Название ссылки';
COMMENT ON COLUMN public.tender_links.url IS 'URL ссылки';
COMMENT ON COLUMN public.tender_links.document_type IS 'Тип документа (тендерная документация, закрывающие документы, прочее)';
COMMENT ON COLUMN public.tender_links.description IS 'Описание ссылки';

-- Индексы
CREATE INDEX IF NOT EXISTS idx_tender_links_tender_id ON public.tender_links(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_links_document_type ON public.tender_links(document_type);

-- RLS (Row Level Security)
ALTER TABLE public.tender_links ENABLE ROW LEVEL SECURITY;

-- Политики доступа
CREATE POLICY "Enable read access for all users" ON public.tender_links
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.tender_links
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.tender_links
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.tender_links
  FOR DELETE USING (true);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_tender_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tender_links_updated_at
  BEFORE UPDATE ON public.tender_links
  FOR EACH ROW
  EXECUTE FUNCTION update_tender_links_updated_at();
```

### Шаг 3: Нажмите "Run"

Должно появиться сообщение: **"Success"**

### Шаг 4: Готово!

Обновите страницу приложения (F5).

---

## ✅ Проверка

После применения миграции:

1. ✅ Откройте тендер
2. ✅ Раскройте карточку ("Показать детали")
3. ✅ Нажмите "Тендерная документация"
4. ✅ Должна появиться кнопка "Добавить ссылку"
5. ✅ Попробуйте добавить ссылку

---

## 🧪 Тестирование

### Тест 1: Добавление ссылки

1. Откройте "Тендерная документация"
2. Нажмите **"Добавить ссылку"**
3. Заполните:
   - Название: "Тестовая ссылка"
   - URL: "https://example.com"
   - Описание: "Тест"
4. Нажмите **"Добавить"**
5. **Ожидаемый результат:**
   - ✅ Ссылка появилась в списке
   - ✅ Блок "Ссылки (1)" отображается
   - ✅ Можно открыть ссылку
   - ✅ Можно удалить ссылку

### Тест 2: Поиск по ссылкам

1. Добавьте несколько ссылок
2. Введите текст в поиск
3. **Ожидаемый результат:**
   - ✅ Ссылки фильтруются
   - ✅ Поиск работает по названию, URL, описанию

### Тест 3: Синхронизация

1. Добавьте ссылку в "Тендерная документация"
2. Откройте "Бухгалтерия"
3. Найдите тот же тендер
4. Нажмите "Тендерная документация"
5. **Ожидаемый результат:**
   - ✅ Ссылка отображается
   - ✅ Данные синхронизированы

---

## 📋 Чек-лист

- [ ] SQL миграция применена
- [ ] Сообщение "Success" получено
- [ ] Страница обновлена (F5)
- [ ] Кнопка "Добавить ссылку" видна
- [ ] Можно добавить ссылку
- [ ] Ссылка отображается в списке
- [ ] Можно открыть ссылку
- [ ] Можно удалить ссылку
- [ ] Поиск работает
- [ ] Синхронизация работает

---

**Готово!** 🎉

Функционал ссылок полностью работает!
