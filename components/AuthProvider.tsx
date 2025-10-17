'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Публичные пути
    const publicPaths = ['/login'];
    const isPublicPath = publicPaths.includes(pathname);

    // Проверяем наличие пользователя
    const currentUser = localStorage.getItem('currentUser');

    // Если на приватной странице и нет пользователя - редирект на логин
    if (!isPublicPath && !currentUser) {
      router.push('/login');
      return;
    }

    // Если на публичной странице и есть пользователь - редирект на дашборд
    if (isPublicPath && currentUser) {
      router.push('/dashboard');
      return;
    }
  }, [pathname, router]);

  return <>{children}</>;
}
