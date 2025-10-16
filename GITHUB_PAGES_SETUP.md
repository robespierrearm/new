# 🚀 Настройка GitHub Pages для TenderCRM

Я открыл 2 страницы в браузере. Следуйте инструкциям ниже:

---

## 📋 Шаг 1: Настройка GitHub Pages (1 минута)

### В открывшейся странице Settings → Pages:

1. **Source:** Выберите `GitHub Actions`
2. Сохраните настройки

---

## 📋 Шаг 2: Добавление секретов (2 минуты)

### В открывшейся странице Settings → Secrets → Actions:

Нажмите **"New repository secret"** и добавьте 2 секрета:

### Секрет 1:
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://dauikktsjknklmyonjik.supabase.co
```

### Секрет 2:
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdWlra3Rzamtua2xteW9uamlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTU2MjYsImV4cCI6MjA3NjEzMTYyNn0.k8JaOJPPbzRPeGGOcPzM17GiAxB93F4yTx-f5iAUXAU
```

---

## 📋 Шаг 3: Запуск деплоя (30 секунд)

После добавления секретов:

1. Перейдите на вкладку **Actions**: https://github.com/robespierrearm/new/actions
2. Нажмите на workflow **"Deploy to GitHub Pages"**
3. Нажмите **"Run workflow"** → **"Run workflow"**

---

## ⏱️ Ожидание (2-3 минуты)

GitHub Actions автоматически:
- ✅ Установит зависимости
- ✅ Соберёт проект
- ✅ Задеплоит на GitHub Pages

Следите за прогрессом на странице Actions.

---

## 🎉 После завершения

Ваше приложение будет доступно по адресу:

```
https://robespierrearm.github.io/new
```

---

## ✅ Готово!

Теперь ваш TenderCRM:
- 🌐 Доступен онлайн
- 🔄 Автоматически обновляется при каждом push
- 📱 Работает на всех устройствах
- ⚡ Быстро загружается
- 💾 Данные синхронизируются через Supabase

---

## 🔗 Полезные ссылки:

- **Приложение:** https://robespierrearm.github.io/new
- **Репозиторий:** https://github.com/robespierrearm/new
- **Actions:** https://github.com/robespierrearm/new/actions
- **Settings:** https://github.com/robespierrearm/new/settings

---

## 💡 Как обновить приложение:

Просто сделайте изменения и push:

```bash
git add .
git commit -m "Обновление"
git push origin main
```

GitHub Pages автоматически обновится через 2-3 минуты!

---

## ✨ Готово!

Настройте GitHub Pages и секреты, запустите workflow - и ваше приложение будет онлайн! 🚀
