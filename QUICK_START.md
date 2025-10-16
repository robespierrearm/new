# ⚡ Быстрый старт TenderCRM

## 🎯 Что нужно сделать (5 минут)

### 1️⃣ Установить зависимости
```bash
npm install
```

### 2️⃣ Настроить Supabase

1. Зарегистрируйтесь на https://supabase.com
2. Создайте новый проект
3. Скопируйте URL и Anon Key из Settings → API

### 3️⃣ Создать .env.local

```bash
cp .env.example .env.local
```

Вставьте ваши ключи:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4️⃣ Создать таблицу

1. Откройте SQL Editor в Supabase
2. Скопируйте содержимое `supabase/create_tenders_table.sql`
3. Выполните скрипт (Run)

### 5️⃣ Запустить

```bash
npm run dev
```

Откройте http://localhost:3000

## ✅ Готово!

Теперь вы можете:
- ✅ Добавлять тендеры
- ✅ Редактировать тендеры
- ✅ Удалять тендеры
- ✅ Отслеживать статусы
- ✅ Работать с разных устройств

---

## 🚀 Деплой на GitHub + Vercel

### Загрузить на GitHub

```bash
# Создайте репозиторий на GitHub
# Затем выполните:

git remote add origin https://github.com/your-username/tender-crm.git
git push -u origin main
```

### Задеплоить на Vercel

1. Перейдите на https://vercel.com
2. Импортируйте ваш GitHub репозиторий
3. Добавьте переменные окружения:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Нажмите Deploy

Готово! Ваше приложение доступно онлайн 🎉

---

## 📖 Подробная инструкция

Смотрите `SETUP_GUIDE.md` для детальных инструкций и решения проблем.
