# Применение миграции для файловой системы

## Шаг 1: Создание таблицы в Supabase

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите проект `pfxzckysajoeuafisfym`
3. Перейдите в **SQL Editor** (левое меню)
4. Нажмите **New Query**
5. Скопируйте содержимое файла `supabase/migrations/20251016120000_create_files_table.sql`
6. Вставьте в редактор и нажмите **Run**

## Шаг 2: Создание Storage Bucket

1. В Supabase Dashboard перейдите в **Storage** (левое меню)
2. Нажмите **Create a new bucket**
3. Введите имя: `files`
4. Выберите **Public bucket** (чтобы файлы можно было скачивать)
5. Нажмите **Create bucket**

## Шаг 3: Настройка политик Storage

1. Выберите созданный bucket `files`
2. Перейдите на вкладку **Policies**
3. Нажмите **New Policy**
4. Выберите **For full customization**
5. Создайте следующие политики:

### Политика SELECT (чтение):
```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'files');
```

### Политика INSERT (загрузка):
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'files');
```

### Политика DELETE (удаление):
```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'files');
```

## Шаг 4: Проверка

1. Откройте приложение: http://localhost:3003
2. Перейдите в **Файлы** (левое меню)
3. Попробуйте загрузить файл
4. Проверьте, что файл появился в списке
5. Включите "Показывать на дашборде"
6. Перейдите на **Дашборд** и проверьте виджет "Файлы для работы"

## Возможные проблемы

### Ошибка "relation files does not exist"
- Убедитесь, что миграция применена в SQL Editor
- Проверьте в **Table Editor**, что таблица `files` создана

### Ошибка при загрузке файла
- Убедитесь, что bucket `files` создан
- Проверьте политики Storage
- Убедитесь, что bucket публичный

### Файлы не скачиваются
- Проверьте политику SELECT для Storage
- Убедитесь, что bucket публичный

## Структура таблицы files

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Уникальный идентификатор |
| name | TEXT | Название файла (пользовательское) |
| original_name | TEXT | Оригинальное имя файла |
| file_path | TEXT | Путь к файлу в Storage |
| file_size | BIGINT | Размер файла в байтах |
| mime_type | TEXT | MIME тип файла |
| category | TEXT | Категория файла |
| show_on_dashboard | BOOLEAN | Показывать на дашборде |
| uploaded_at | TIMESTAMP | Дата загрузки |
| updated_at | TIMESTAMP | Дата обновления |

## Категории файлов

- карточка предприятия
- шаблон
- договор
- документация
- прочее
