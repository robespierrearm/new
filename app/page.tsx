'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Проверяем авторизацию
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const currentUser = localStorage.getItem('currentUser');
        
        if (currentUser) {
          // Пользователь авторизован - перенаправляем на dashboard
          router.push('/dashboard');
        } else {
          // Пользователь не авторизован - перенаправляем на login
          router.push('/login');
        }
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm">Загрузка...</p>
      </div>
    </div>
  );
}
