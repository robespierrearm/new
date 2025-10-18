// AI провайдеры для TenderCRM

export type AIProvider = 'google' | 'intelligence';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProviderConfig {
  name: string;
  baseURL?: string;
  models: string[];
  defaultModel: string;
}

// Конфигурация провайдеров (без API ключей - они только на сервере)
export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  google: {
    name: 'Google AI (Gemini)',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-2.5-flash', 'gemini-pro'],
    defaultModel: 'gemini-2.5-flash',
  },
  intelligence: {
    name: 'Intelligence.io',
    baseURL: 'https://api.intelligence.io.solutions/api/v1',
    models: [
      'meta-llama/Llama-3.3-70B-Instruct',
      'mistralai/Mistral-Nemo-Instruct-2407',
      'openai/gpt-oss-20b',
      'Intel/Qwen3-Coder-480B-A35B-Instruct-int4-mixed-ar',
      'mistralai/Devstral-Small-2505',
      'swiss-ai/Apertus-70B-Instruct-2509',
    ],
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct',
  },
};

// Получение API ключей (только на сервере!)
function getApiKey(provider: AIProvider): string | undefined {
  if (typeof window !== 'undefined') {
    throw new Error('API ключи не должны использоваться на клиенте!');
  }
  
  switch (provider) {
    case 'google':
      return process.env.GOOGLE_AI_KEY;
    case 'intelligence':
      return process.env.INTELLIGENCE_API_KEY;
    default:
      return undefined;
  }
}

// Системный промпт для всех провайдеров
export const SYSTEM_PROMPT = `Ты полезный ИИ-помощник в CRM-системе для управления тендерами. Отвечай кратко, по делу и на русском языке. Помогай с вопросами о работе, тендерах, документах и организации процессов.

ВАЖНО: Ты можешь выполнять действия в системе! Когда пользователь просит добавить тендер, расход или поставщика, ты должен вернуть специальный JSON с командой.

Формат ответа для выполнения действий:
Если пользователь просит добавить тендер, верни JSON в формате:
[ACTION:ADD_TENDER]
{
  "name": "Название тендера",
  "start_price": 1000000,
  "publication_date": "2025-01-18",
  "status": "новый"
}
[/ACTION]

Для добавления расхода:
[ACTION:ADD_EXPENSE]
{
  "category": "Категория",
  "amount": 50000,
  "description": "Описание расхода"
}
[/ACTION]

Для добавления поставщика:
[ACTION:ADD_SUPPLIER]
{
  "name": "Название поставщика",
  "phone": "+7...",
  "email": "email@example.com",
  "category": "Категория"
}
[/ACTION]

После JSON добавь обычный текст с объяснением, что ты подготовил для добавления.

Примеры:
Пользователь: "Добавь тендер на поставку оборудования на 500000 рублей"
Ты: [ACTION:ADD_TENDER]{"name":"Поставка оборудования","start_price":500000,"publication_date":"2025-01-18","status":"новый"}[/ACTION]

Я подготовил тендер "Поставка оборудования" с начальной ценой 500,000 ₽. Подтвердите добавление.`;

// Функция для вызова Google AI (Gemini)
export async function callGoogleAI(messages: AIMessage[], model: string = 'gemini-2.5-flash'): Promise<string> {
  const apiKey = getApiKey('google');
  
  if (!apiKey) {
    throw new Error('Google AI API key не настроен');
  }

  // Преобразуем сообщения в формат Gemini
  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // Добавляем системный промпт в первое сообщение
  if (contents.length > 0 && contents[0].role === 'user') {
    contents[0].parts[0].text = `${SYSTEM_PROMPT}\n\n${contents[0].parts[0].text}`;
  }

  // Используем CORS прокси для обхода региональных ограничений
  const targetUrl = `${AI_PROVIDERS.google.baseURL}/models/${model}:generateContent?key=${apiKey}`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
  
  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Google AI error: ${error.error?.message || 'Неизвестная ошибка'}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Извините, не удалось получить ответ.';
}

// Функция для вызова Intelligence.io (OpenAI-совместимый API)
export async function callIntelligenceIO(messages: AIMessage[], model: string = 'meta-llama/Llama-3.3-70B-Instruct'): Promise<string> {
  const apiKey = getApiKey('intelligence');
  
  if (!apiKey) {
    throw new Error('Intelligence.io API key не настроен');
  }

  // Добавляем системный промпт
  const messagesWithSystem = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...messages
  ];

  const response = await fetch(`${AI_PROVIDERS.intelligence.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Intelligence.io error response:', response.status, errorText);
    try {
      const error = JSON.parse(errorText);
      throw new Error(`Intelligence.io error: ${error.error?.message || error.message || 'Неизвестная ошибка'}`);
    } catch (e) {
      throw new Error(`Intelligence.io error (${response.status}): ${errorText}`);
    }
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Извините, не удалось получить ответ.';
}

// Универсальная функция для вызова любого провайдера
export async function callAI(
  provider: AIProvider,
  messages: AIMessage[],
  model?: string
): Promise<string> {
  switch (provider) {
    case 'google':
      return callGoogleAI(messages, model || AI_PROVIDERS.google.defaultModel);
    case 'intelligence':
      return callIntelligenceIO(messages, model || AI_PROVIDERS.intelligence.defaultModel);
    default:
      throw new Error(`Неизвестный провайдер: ${provider}`);
  }
}

// Получить список доступных провайдеров
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = ['google', 'intelligence'];
  return providers.filter(provider => {
    const apiKey = getApiKey(provider);
    return !!apiKey;
  });
}
