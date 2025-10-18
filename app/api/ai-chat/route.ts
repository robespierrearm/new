import { NextRequest, NextResponse } from 'next/server';
import { callAI, AIProvider, getAvailableProviders } from '@/lib/ai-providers';

export async function POST(request: NextRequest) {
  try {
    const { messages, provider, model } = await request.json();

    // Определяем провайдера (по умолчанию первый доступный)
    const availableProviders = getAvailableProviders();
    
    if (availableProviders.length === 0) {
      return NextResponse.json(
        { error: 'Ни один AI провайдер не настроен. Добавьте API ключи в .env.local' },
        { status: 500 }
      );
    }

    const selectedProvider: AIProvider = provider || availableProviders[0];

    // Вызываем AI
    const aiMessage = await callAI(selectedProvider, messages, model);

    return NextResponse.json({ 
      message: aiMessage,
      provider: selectedProvider 
    });
  } catch (error: any) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// GET endpoint для получения списка доступных провайдеров
export async function GET() {
  try {
    const providers = getAvailableProviders();
    return NextResponse.json({ providers });
  } catch (error) {
    console.error('Error getting providers:', error);
    return NextResponse.json(
      { error: 'Ошибка получения провайдеров' },
      { status: 500 }
    );
  }
}
