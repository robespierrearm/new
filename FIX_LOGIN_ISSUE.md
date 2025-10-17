# 🔧 Исправление проблемы входа

## ⚠️ Проблема

Не можете войти в систему - пишет "Неверный логин или пароль".

## 🔍 Причина

В таблице `users` отсутствует поле `is_active` или администратор деактивирован.

## ✅ Решение

### Вариант 1: Пересоздать таблицу (РЕКОМЕНДУЕТСЯ)

Если в таблице нет важных данных:

1. **Откройте SQL Editor в Supabase:**
   ```
   https://supabase.com/dashboard/project/dauikktsjknklmyonjik/sql/new
   ```

2. **Удалите старые таблицы:**
   ```sql
   DROP TABLE IF EXISTS public.activity_logs CASCADE;
   DROP TABLE IF EXISTS public.users CASCADE;
   ```

3. **Выполните обновленную миграцию:**
   
   Скопируйте весь код из файла:
   ```
   supabase/migrations/20251017_create_admin_tables.sql
   ```
   
   И выполните в SQL Editor.

4. **Проверьте:**
   ```sql
   SELECT * FROM users WHERE email = 'Armen@gmail.com';
   ```
   
   Должен быть пользователь с `is_active = true`.

### Вариант 2: Обновить существующую таблицу

Если в таблице есть важные данные:

1. **Добавьте поле is_active:**
   ```sql
   ALTER TABLE public.users 
   ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
   ```

2. **Обновите администратора:**
   ```sql
   UPDATE public.users 
   SET is_active = true 
   WHERE email = 'Armen@gmail.com';
   ```

3. **Проверьте:**
   ```sql
   SELECT username, email, is_active 
   FROM users 
   WHERE email = 'Armen@gmail.com';
   ```

### Вариант 3: Создать администратора вручную

Если администратора нет:

```sql
INSERT INTO public.users (username, email, password, is_online, is_active, last_activity)
VALUES ('Armen', 'Armen@gmail.com', 'Armen@gmail.com', false, true, NOW())
ON CONFLICT (email) 
DO UPDATE SET is_active = true;
```

## 🧪 Проверка

После выполнения любого варианта:

1. Откройте `/login`
2. Введите:
   - Email: `Armen@gmail.com`
   - Пароль: `Armen@gmail.com`
3. Нажмите "Войти"

**Ожидаемый результат:**
- ✅ Успешный вход
- ✅ Редирект на `/dashboard`

## 📊 Проверка в базе данных

Выполните запрос:

```sql
SELECT 
  id,
  username,
  email,
  is_online,
  is_active,
  last_activity
FROM public.users
WHERE email = 'Armen@gmail.com';
```

**Должно быть:**
- `username`: Armen
- `email`: Armen@gmail.com
- `password`: Armen@gmail.com
- `is_online`: false
- `is_active`: **true** ← важно!
- `last_activity`: текущая дата

## ⚠️ Важно

**Поле `is_active` должно быть `true`!**

Если `is_active = false`, то при входе будет ошибка:
```
Ваш аккаунт деактивирован. Обратитесь к администратору.
```

## 🔑 Данные для входа

**Email:** `Armen@gmail.com`  
**Пароль:** `Armen@gmail.com`

---

**После исправления вход должен работать!** 🎉
