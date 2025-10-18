'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase, MessageInsert } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Trash2, Share2, Sparkles, Loader2, Bot } from 'lucide-react';
import { logActivity, ACTION_TYPES } from '@/lib/activityLogger';
import { AIProvider } from '@/lib/ai-providers';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action?: {
    type: 'ADD_TENDER' | 'ADD_EXPENSE' | 'ADD_SUPPLIER';
    data: any;
  };
}

export default function AIPage() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('intelligence');
  const [selectedModel, setSelectedModel] = useState<string>('meta-llama/Llama-3.3-70B-Instruct');
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Модели для Intelligence.io
  const intelligenceModels = [
    { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B (рекомендуется)' },
    { id: 'mistralai/Mistral-Nemo-Instruct-2407', name: 'Mistral Nemo (быстрая)' },
    { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B' },
    { id: 'Intel/Qwen3-Coder-480B-A35B-Instruct-int4-mixed-ar', name: 'Qwen3 Coder (для кода)' },
    { id: 'mistralai/Devstral-Small-2505', name: 'Devstral (для разработки)' },
    { id: 'swiss-ai/Apertus-70B-Instruct-2509', name: 'Apertus 70B' },
  ];

  // Загрузка истории из LocalStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai_chat_history');
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
    }
  }, []);

  // Загрузка доступных провайдеров
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await fetch('/api/ai-chat');
        if (response.ok) {
          const data = await response.json();
          setAvailableProviders(data.providers || []);
          if (data.providers?.length > 0 && !data.providers.includes(selectedProvider)) {
            setSelectedProvider(data.providers[0]);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки провайдеров:', error);
      }
    };
    loadProviders();
  }, []);

  // Сохранение истории в LocalStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Автоскролл вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Отправка сообщения ИИ
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Проверяем, доступен ли API роут (работает только локально)
      const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      let aiResponseText = '';

      if (isLocalhost) {
        // Загружаем контекст из базы данных
        let contextMessage = '';
        try {
          const contextResponse = await fetch('/api/ai-context');
          if (contextResponse.ok) {
            const { stats } = await contextResponse.json();
            contextMessage = `\n\nКОНТЕКСТ ИЗ БАЗЫ ДАННЫХ (используй эти данные для ответа на вопросы пользователя):
Тендеры:
- Всего тендеров: ${stats.tenders.total}
- По статусам: Новых - ${stats.tenders.byStatus['новый']}, Подано - ${stats.tenders.byStatus['подано']}, На рассмотрении - ${stats.tenders.byStatus['на рассмотрении']}, Победа - ${stats.tenders.byStatus['победа']}, В работе - ${stats.tenders.byStatus['в работе']}, Завершено - ${stats.tenders.byStatus['завершён']}, Проигрыш - ${stats.tenders.byStatus['проигрыш']}
- Общая начальная цена всех тендеров: ${stats.tenders.totalStartPrice.toLocaleString('ru-RU')} ₽
- Общая цена побед: ${stats.tenders.totalWinPrice.toLocaleString('ru-RU')} ₽

Последние тендеры:
${stats.tenders.recentTenders.map((t: any, i: number) => `${i + 1}. ${t.name} (${t.status}) - ${t.start_price?.toLocaleString('ru-RU') || 0} ₽`).join('\n')}

Поставщики:
- Всего поставщиков: ${stats.suppliers.total}
- По категориям: ${Object.entries(stats.suppliers.byCategory).map(([cat, count]) => `${cat}: ${count}`).join(', ')}

Расходы:
- Всего записей расходов: ${stats.expenses.total}
- Общая сумма расходов: ${stats.expenses.totalAmount.toLocaleString('ru-RU')} ₽
- По категориям: ${Object.entries(stats.expenses.byCategory).map(([cat, amount]: any) => `${cat}: ${amount.toLocaleString('ru-RU')} ₽`).join(', ')}

Финансы:
- Общий доход (завершённые тендеры): ${stats.financial.totalIncome.toLocaleString('ru-RU')} ₽
- Общие расходы: ${stats.financial.totalExpenses.toLocaleString('ru-RU')} ₽
- Валовая прибыль: ${stats.financial.grossProfit.toLocaleString('ru-RU')} ₽
- Налог УСН (7%): ${stats.financial.tax.toLocaleString('ru-RU')} ₽
- Чистая прибыль: ${stats.financial.netProfit.toLocaleString('ru-RU')} ₽`;
          }
        } catch (error) {
          console.error('Ошибка загрузки контекста:', error);
        }

        // Добавляем контекст к первому сообщению пользователя
        const messagesWithContext = [...messages, userMessage].map((m, index) => {
          if (index === messages.length && contextMessage) {
            return { role: m.role, content: m.content + contextMessage };
          }
          return { role: m.role, content: m.content };
        });

        // Локально - используем API роут с выбранным провайдером
        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: messagesWithContext,
            provider: selectedProvider,
            model: selectedProvider === 'intelligence' ? selectedModel : undefined
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          throw new Error(errorData.error || 'Ошибка при получении ответа от ИИ');
        }

        const data = await response.json();
        aiResponseText = data.message;

        // Парсим команды из ответа AI
        const actionMatch = aiResponseText.match(/\[ACTION:(ADD_TENDER|ADD_EXPENSE|ADD_SUPPLIER)\]([\s\S]*?)\[\/ACTION\]/);
        let parsedAction = undefined;
        
        if (actionMatch) {
          try {
            const actionType = actionMatch[1] as 'ADD_TENDER' | 'ADD_EXPENSE' | 'ADD_SUPPLIER';
            const actionData = JSON.parse(actionMatch[2].trim());
            parsedAction = { type: actionType, data: actionData };
            
            // Убираем команду из текста ответа
            aiResponseText = aiResponseText.replace(actionMatch[0], '').trim();
          } catch (e) {
            console.error('Ошибка парсинга команды:', e);
          }
        }

        const aiMessage: AIMessage = {
          role: 'assistant',
          content: aiResponseText,
          timestamp: new Date().toISOString(),
          action: parsedAction,
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        // На GitHub Pages - вызываем Google Gemini напрямую
        const apiKey = 'AIzaSyB4q--whZbW0GpezMXfJncEQibZayhRbaA';
        const systemPrompt = 'Ты полезный ИИ-помощник в CRM-системе для управления тендерами. Отвечай кратко, по делу и на русском языке. Помогай с вопросами о работе, тендерах, документах и организации процессов.';
        
        // Преобразуем сообщения в формат Gemini
        const contents = [...messages, userMessage].map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        // Добавляем системный промпт в первое сообщение
        if (contents.length > 0 && contents[0].role === 'user') {
          contents[0].parts[0].text = `${systemPrompt}\n\n${contents[0].parts[0].text}`;
        }

        // Используем CORS прокси для обхода региональных ограничений
        const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
        
        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
          console.error('Google AI error:', error);
          throw new Error(`Ошибка Google AI: ${error.error?.message || 'Неизвестная ошибка'}`);
        }

        const data = await response.json();
        aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Извините, не удалось получить ответ.';
        
        const aiMessage: AIMessage = {
          role: 'assistant',
          content: aiResponseText,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);
      }
      
      await logActivity('Получен ответ от ИИ-помощника', ACTION_TYPES.LOGIN);
    } catch (error: any) {
      console.error('Ошибка:', error);
      
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: 'Извините, произошла ошибка при получении ответа. Пожалуйста, попробуйте позже.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Выполнение действия AI
  const handleExecuteAction = async (action: { type: string; data: any }) => {
    try {
      const response = await fetch('/api/ai-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action.type, data: action.data }),
      });

      const result = await response.json();

      if (response.ok) {
        // Добавляем сообщение об успехе
        const successMessage: AIMessage = {
          role: 'assistant',
          content: `✅ ${result.message}`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, successMessage]);
        
        await logActivity(`AI выполнил действие: ${action.type}`, ACTION_TYPES.TENDER_ADD);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: `❌ Ошибка выполнения: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Отправка ответа в общий чат
  const handleShareToChat = async (content: string) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const messageData: MessageInsert = {
      user_id: currentUser.id,
      username: currentUser.username || 'Аноним',
      message_type: 'message',
      content: `💡 ИИ-помощник:\n\n${content}`,
    };

    const { error } = await supabase
      .from('messages')
      .insert([messageData]);

    if (error) {
      console.error('Ошибка отправки в чат:', error);
      alert('Ошибка при отправке в чат');
      return;
    }

    await logActivity('Отправлен ответ ИИ в общий чат', ACTION_TYPES.LOGIN);
    alert('✅ Сообщение отправлено в общий чат!');
  };

  // Очистка истории
  const handleClearHistory = () => {
    if (confirm('Вы уверены, что хотите очистить всю историю диалога?')) {
      setMessages([]);
      localStorage.removeItem('ai_chat_history');
      logActivity('Очищена история ИИ-помощника', ACTION_TYPES.TENDER_DELETE);
    }
  };

  // Форматирование времени
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ИИ-помощник
            </h1>
            <p className="text-sm text-gray-600 mt-1">Задайте любой вопрос и получите ответ</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          {/* Вкладки провайдеров */}
          <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-lg border">
            <button
              onClick={() => setSelectedProvider('google')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedProvider === 'google'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Google AI
            </button>
            <button
              onClick={() => setSelectedProvider('intelligence')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedProvider === 'intelligence'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Intelligence.io
            </button>
          </div>

          {/* Выбор модели для Intelligence.io */}
          {selectedProvider === 'intelligence' && (
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-sm px-3 py-2 border rounded-lg bg-white min-w-[200px]"
            >
              {intelligenceModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            disabled={messages.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Очистить
          </Button>
        </div>
      </div>

      {/* Окно чата */}
      <Card className="flex-1 overflow-hidden flex flex-col shadow-lg">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-4">
                <Sparkles className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Начните диалог с ИИ</h3>
              <p className="text-sm text-gray-600 max-w-md">
                Задайте вопрос, попросите совет или помощь в работе. ИИ-помощник всегда готов помочь!
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[80%] ${message.role === 'user' ? '' : 'flex flex-col items-end'}`}>
                <div
                  className={`rounded-2xl p-4 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-white border border-gray-200'
                      : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-gray-500' : 'text-purple-100'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                
                {/* Кнопка подтверждения действия */}
                {message.role === 'assistant' && message.action && (
                  <Button
                    onClick={() => handleExecuteAction(message.action!)}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    ✓ Подтвердить и выполнить
                  </Button>
                )}
                
                {/* Кнопка "Отправить в чат" только для ответов ИИ */}
                {message.role === 'assistant' && !message.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShareToChat(message.content)}
                    className="mt-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Отправить в общий чат
                  </Button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-end animate-in fade-in duration-300">
              <div className="max-w-[80%] bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">ИИ думает...</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Поле ввода */}
        <div className="border-t p-4 bg-gradient-to-br from-gray-50 to-purple-50/20">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder="Спросите у ИИ..."
              className="flex-1 bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              disabled={isLoading || !newMessage.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
