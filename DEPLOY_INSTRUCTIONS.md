# 🚀 Инструкция по деплою TenderCRM на Vercel

## Открыта страница деплоя

Я открыл страницу Vercel для автоматического деплоя вашего проекта.

---

## 📋 Что нужно сделать (2 минуты):

### 1. Войдите в Vercel
- Если у вас нет аккаунта - зарегистрируйтесь через GitHub
- Если есть - войдите

### 2. Импортируйте проект
Vercel автоматически обнаружит ваш репозиторий `robespierrearm/new`

### 3. Настройте переменные окружения

**ВАЖНО!** Добавьте эти переменные в разделе "Environment Variables":

```
NEXT_PUBLIC_SUPABASE_URL=https://dauikktsjknklmyonjik.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdWlra3Rzamtua2xteW9uamlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTU2MjYsImV4cCI6MjA3NjEzMTYyNn0.k8JaOJPPbzRPeGGOcPzM17GiAxB93F4yTx-f5iAUXAU
```

### 4. Нажмите "Deploy"

Vercel автоматически:
- ✅ Установит зависимости
- ✅ Соберёт проект
- ✅ Задеплоит приложение
- ✅ Даст вам URL (например: `tender-crm.vercel.app`)

---

## ⏱️ Время деплоя: ~2 минуты

После деплоя вы получите:
- 🌐 Публичный URL для доступа к приложению
- 🔄 Автоматический деплой при каждом push в GitHub
- 📊 Аналитику и логи
- ⚡ Быструю загрузку по всему миру

---

## 🎉 После деплоя

Ваше приложение будет доступно по адресу типа:
```
https://new-xxxxx.vercel.app
```

Вы сможете:
- Открыть его с любого устройства
- Поделиться ссылкой с коллегами
- Работать с тендерами онлайн
- Все данные синхронизируются через Supabase

---

## 💡 Альтернатива: Ручной деплой через CLI

Если хотите задеплоить через терминал:

```bash
npx vercel login
npx vercel --prod
```

Следуйте инструкциям в терминале.

---

## ✅ Готово!

После деплоя ваш TenderCRM будет доступен онлайн! 🚀
