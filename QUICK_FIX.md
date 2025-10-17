# 🔧 Быстрое исправление ошибки загрузки файлов

## Проблема
При попытке загрузить файл появляется ошибка, потому что **не применена SQL миграция**.

## ✅ Решение (2 минуты)

### Шаг 1: Откройте SQL Editor в Supabase

Перейдите по ссылке:
```
https://supabase.com/dashboard/project/dauikktsjknklmyonjik/sql/new
```

### Шаг 2: Скопируйте и выполните этот SQL

```sql
-- Добавляем новые колонки
ALTER TABLE public.files 
ADD COLUMN IF NOT EXISTS tender_id BIGINT REFERENCES public.tenders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'прочее' CHECK (document_type IN ('тендерная документация', 'закрывающие документы', 'прочее')),
ADD COLUMN IF NOT EXISTS uploaded_by TEXT;

-- Обновляем индексы
CREATE INDEX IF NOT EXISTS idx_files_tender_id ON public.files(tender_id);
CREATE INDEX IF NOT EXISTS idx_files_document_type ON public.files(document_type);

-- Комментарии
COMMENT ON COLUMN public.files.tender_id IS 'ID тендера, к которому привязан файл';
COMMENT ON COLUMN public.files.document_type IS 'Тип документа: тендерная документация, закрывающие документы, прочее';
COMMENT ON COLUMN public.files.uploaded_by IS 'Пользователь, загрузивший файл';
```

### Шаг 3: Нажмите "Run" (или Ctrl+Enter)

Должно появиться сообщение "Success. No rows returned"

### Шаг 4: Готово!

Обновите страницу в браузере (F5) и попробуйте загрузить файл снова.

## 🎉 Теперь все должно работать!

Система файлов полностью настроена и готова к использованию.

---

## Дополнительно: Проверка настройки

Если хотите убедиться, что все настроено правильно, выполните:

```bash
export $(cat .env.local | xargs) && node check-files-setup.js
```

Должно показать:
- ✅ Таблица files существует
- ✅ Колонка tender_id существует
- ✅ Колонка document_type существует
- ✅ Bucket "files" существует
- ✅ Тестовый файл успешно загружен
