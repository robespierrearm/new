'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Building2, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Проверяем пользователя в базе
      const { data: user, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (dbError || !user) {
        setError('Неверный email или пароль');
        setIsLoading(false);
        return;
      }

      // Проверяем, активен ли пользователь (кроме главного администратора)
      const isMainAdmin = user.email.toLowerCase() === 'armen@gmail.com';
      if (!isMainAdmin && !user.is_active) {
        setError('Ваш аккаунт деактивирован. Обратитесь к администратору.');
        setIsLoading(false);
        return;
      }

      // Обновляем статус онлайн
      await supabase
        .from('users')
        .update({ 
          is_online: true, 
          last_activity: new Date().toISOString() 
        })
        .eq('id', user.id);

      // Добавляем лог входа
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          username: user.username,
          action: 'Вход в систему',
          action_type: 'login',
          details: { email: user.email }
        });

      // Сохраняем пользователя в localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));

      // Устанавливаем cookie для middleware
      document.cookie = `auth-token=${user.id}; path=/; max-age=86400`; // 24 часа

      // Перенаправляем на дашборд
      router.push('/dashboard');
    } catch (err) {
      console.error('Ошибка входа:', err);
      setError('Произошла ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Анимированные декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Анимированные строительные элементы */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-10 right-20 text-orange-600 animate-bounce" style={{ animationDuration: '3s' }}>
          <Building2 className="h-16 w-16" />
        </div>
        <div className="absolute bottom-32 left-20 text-amber-600 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
          <Building2 className="h-12 w-12" />
        </div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-orange-200/50 backdrop-blur-sm bg-white/95 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="p-8">
          {/* Логотип и название */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-500">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mb-4 shadow-lg hover:scale-110 transition-transform duration-300 animate-in zoom-in duration-700">
              <Building2 className="h-10 w-10 text-white animate-pulse" style={{ animationDuration: '3s' }} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-in fade-in slide-in-from-top duration-700" style={{ animationDelay: '200ms' }}>
              ИП Чолахян
            </h1>
            <p className="text-gray-600 animate-in fade-in duration-700" style={{ animationDelay: '400ms' }}>Строительная компания</p>
          </div>

          {/* Форма входа */}
          <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in duration-700" style={{ animationDelay: '600ms' }}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 animate-in shake duration-500">
                <AlertCircle className="h-5 w-5 flex-shrink-0 animate-pulse" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2 animate-in slide-in-from-left duration-500" style={{ animationDelay: '800ms' }}>
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введите email"
                  className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 animate-in slide-in-from-left duration-500" style={{ animationDelay: '1000ms' }}>
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Пароль
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: '1200ms' }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Вход...
                </span>
              ) : (
                'Войти в систему'
              )}
            </Button>
          </form>

          {/* Информация */}
          <div className="mt-6 text-center animate-in fade-in duration-700" style={{ animationDelay: '1400ms' }}>
            <p className="text-sm text-gray-500">
              Система управления тендерами
            </p>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Защищенное соединение</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
