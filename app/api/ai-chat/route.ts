import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const apiKey = process.env.GOOGLE_AI_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google AI API key не настроен' },
        { status: 500 }
      );
    }

    // Преобразуем сообщения в формат Gemini
    const systemPrompt = 'Ты полезный ИИ-помощник в CRM-системе для управления тендерами. Отвечай кратко, по делу и на русском языке. Помогай с вопросами о работе, тендерах, документах и организации процессов.';
    
    // Gemini использует формат contents с parts
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.role === 'user' ? msg.content : msg.content }]
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
      console.error('Google AI error:', error);
      return NextResponse.json(
        { error: `Ошибка Google AI: ${error.error?.message || 'Неизвестная ошибка'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Извините, не удалось получить ответ.';

    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
