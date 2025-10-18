# Intelligence.io Integration

## Что добавлено

Интегрирован AI провайдер **Intelligence.io** в TenderCRM с поддержкой множественных AI провайдеров.

### Новые возможности:

1. **Множественные AI провайдеры**:
   - Intelligence.io (новый)
   - Google AI (Gemini)
   - OpenAI

2. **Выбор провайдера** - переключение между провайдерами в UI
3. **Универсальный API** - единый интерфейс для всех провайдеров
4. **Автоматическое определение** - показываются только настроенные провайдеры

## Файлы

### Новые:
- `lib/ai-providers.ts` - универсальная библиотека для работы с AI провайдерами

### Изменённые:
- `app/api/ai-chat/route.ts` - обновлён для поддержки множественных провайдеров
- `app/(dashboard)/ai/page.tsx` - добавлен селектор провайдера
- `.env.local` - добавлен `INTELLIGENCE_API_KEY`

## Настройка

### 1. API ключ уже добавлен

Ключ Intelligence.io уже добавлен в `.env.local`:

```env
INTELLIGENCE_API_KEY=io-v2-eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Использование

1. Откройте страницу **ИИ-помощник** в TenderCRM
2. В правом верхнем углу выберите провайдера из выпадающего списка:
   - **Intelligence.io** (рекомендуется)
   - **Google AI** (Gemini)
   - **OpenAI** (если настроен)
3. Задайте вопрос и получите ответ

## API Intelligence.io

### Endpoint:
```
https://api.intelligence.io.solutions/api/v1
```

### Поддерживаемые модели:
- `gpt-4o-mini` (по умолчанию)
- `gpt-4o`
- Другие OpenAI-совместимые модели

### Формат запроса:

```typescript
POST /chat/completions
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

## Преимущества Intelligence.io

✅ **OpenAI-совместимый API** - легкая интеграция
✅ **Поддержка изображений** - `supports_images_input: true`
✅ **Кэширование промптов** - `supports_prompt_cache: true`
✅ **Гибкие цены** - разные цены на input/output/cache токены
✅ **Большой контекст** - поддержка длинных диалогов

## Использование в коде

### Вызов AI:

```typescript
import { callAI } from '@/lib/ai-providers';

const response = await callAI('intelligence', messages, 'gpt-4o-mini');
```

### Получение доступных провайдеров:

```typescript
import { getAvailableProviders } from '@/lib/ai-providers';

const providers = getAvailableProviders(); // ['intelligence', 'google', 'openai']
```

## Тестирование

1. Перейдите на страницу `/ai`
2. Выберите **Intelligence.io** в селекторе
3. Отправьте тестовое сообщение: "Привет, как дела?"
4. Проверьте, что ответ приходит от Intelligence.io

## Мониторинг

Все запросы логируются в консоль:
- Выбранный провайдер
- Отправленные сообщения
- Полученные ответы
- Ошибки (если есть)

## Дальнейшее развитие

Можно добавить:
- [ ] Выбор конкретной модели (не только провайдера)
- [ ] Отображение стоимости запроса
- [ ] Статистику использования токенов
- [ ] Поддержку изображений
- [ ] Кэширование промптов
- [ ] Стриминг ответов (real-time)
