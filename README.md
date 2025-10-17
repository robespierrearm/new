# TenderCRM

CRM-система для управления тендерами строительной компании ИП Чолахян.

## Технологии

- **Next.js 15** - React фреймворк
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **Supabase** - база данных и аутентификация
- **Radix UI** - UI компоненты
- **Lucide React** - иконки

## Запуск локально

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## Сборка для production

```bash
npm run build
```

Статические файлы будут в папке `out/`

## Деплой на GitHub Pages

Проект автоматически деплоится через GitHub Actions при push в `main`.

URL: [https://robespierrearm.github.io/new/](https://robespierrearm.github.io/new/)

## Структура проекта

```
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Защищённые страницы
│   │   ├── dashboard/     # Главная панель
│   │   ├── tenders/       # Управление тендерами
│   │   ├── suppliers/     # Поставщики
│   │   ├── accounting/    # Бухгалтерия
│   │   ├── files/         # Файлы
│   │   ├── admin/         # Админ панель
│   │   └── settings/      # Настройки
│   ├── login/             # Страница входа
│   └── layout.tsx         # Корневой layout
├── components/            # React компоненты
├── lib/                   # Утилиты и конфигурация
└── public/               # Статические файлы
```

## Функционал

- ✅ Управление тендерами (создание, редактирование, статусы)
- ✅ Управление поставщиками
- ✅ Бухгалтерия и учёт расходов
- ✅ Система файлов и документов
- ✅ Админ панель для управления пользователями
- ✅ Аутентификация и защита маршрутов
- ✅ Адаптивный дизайн
- ✅ Экспорт в PDF

## Переменные окружения

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
