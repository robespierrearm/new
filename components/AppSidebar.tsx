'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { supabase } from '@/lib/supabase';
import { logActivity, ACTION_TYPES } from '@/lib/activityLogger';
import {
  Home,
  FileText,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const menuItems = [
  {
    title: 'Дашборд',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Тендеры',
    href: '/tenders',
    icon: FileText,
  },
  {
    title: 'Поставщики',
    href: '/suppliers',
    icon: Users,
  },
  {
    title: 'Бухгалтерия',
    href: '/accounting',
    icon: DollarSign,
  },
  {
    title: 'Файлы',
    href: '/files',
    icon: FolderOpen,
  },
  {
    title: 'Чат',
    href: '/chat',
    icon: MessageSquare,
  },
  {
    title: 'Админка',
    href: '/admin',
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTendersOpen, setIsTendersOpen] = useState(true); // Выпадающее меню тендеров
  const [currentUser, setCurrentUser] = useState<{ username?: string; email?: string }>({});

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Загружаем данные пользователя только на клиенте
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setCurrentUser(user);
    }
  }, []);

  // Функция выхода
  const handleLogout = async () => {
    try {
      // Логируем выход
      await logActivity('Выход из системы', ACTION_TYPES.LOGOUT);

      // Обновляем статус пользователя
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.id) {
        await supabase
          .from('users')
          .update({ is_online: false })
          .eq('id', currentUser.id);
      }

      // Очищаем localStorage
      localStorage.removeItem('currentUser');

      // Удаляем cookie
      document.cookie = 'auth-token=; path=/; max-age=0';

      // Перенаправляем на страницу входа
      router.push('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleTenders = () => setIsTendersOpen(!isTendersOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white border shadow-lg"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 flex h-screen flex-col border-r bg-white shadow-lg transition-all duration-300 md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "md:w-20" : "md:w-64",
          "w-64"
        )}
      >
      {/* Logo */}
      <div className="flex h-20 items-center border-b bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden shadow-lg">
        {/* Декоративный фон */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnpNNiAzNGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <Link
          href="/dashboard"
          className="flex-1 flex items-center px-5 py-4 hover:bg-white/10 transition-all duration-300 relative z-10 group"
          onClick={closeMobileMenu}
        >
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="group-hover:scale-110 transition-transform duration-300">
                <Logo size={40} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white drop-shadow-lg tracking-tight">
                  TenderCRM
                </h1>
                <p className="text-xs text-white/70">Управление тендерами</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto group-hover:scale-110 transition-transform duration-300">
              <Logo size={40} />
            </div>
          )}
        </Link>
        
        <button
          onClick={toggleCollapse}
          className="hidden md:flex items-center justify-center w-14 h-full hover:bg-white/10 transition-all duration-300 border-l border-white/20 relative z-10 group"
          title={isCollapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
          ) : (
            <PanelLeftClose className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/tenders' && pathname.startsWith('/tenders'));
          const isTendersItem = item.href === '/tenders';

          // Если это пункт "Тендеры" - делаем выпадающее меню
          if (isTendersItem) {
            const tabParam = searchParams.get('tab');
            const isAllTenders = pathname === '/tenders' && !tabParam;
            const hasActiveSubtab = pathname === '/tenders' && tabParam;
            
            return (
              <div key={item.href} className="space-y-1">
                {/* Основная кнопка Тендеры - кликабельна и открывает все тендеры */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      closeMobileMenu();
                      router.push('/tenders');
                    }}
                    className={cn(
                        'w-full gap-3 transition-all flex items-center rounded-md text-sm font-medium h-9 px-4',
                        isAllTenders
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 hover:from-blue-100 hover:to-purple-100 border-l-4 border-blue-600'
                          : hasActiveSubtab
                          ? 'bg-gray-100 text-gray-700'
                          : 'hover:bg-secondary/80 text-gray-700',
                        isCollapsed && 'justify-center px-2'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && (
                        <span className="truncate flex-1 text-left">{item.title}</span>
                      )}
                  </button>
                  {!isCollapsed && (
                    <button
                      onClick={toggleTenders}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                    >
                      {isTendersOpen ? (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  )}
                </div>

                {/* Подменю тендеров */}
                {isTendersOpen && !isCollapsed && (
                  <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        closeMobileMenu();
                        router.push('/tenders?tab=new');
                      }}
                      className={cn(
                          'w-full text-left px-3 py-2 rounded-md text-sm transition-all',
                          tabParam === 'new'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        Новые
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        closeMobileMenu();
                        router.push('/tenders?tab=review');
                      }}
                      className={cn(
                          'w-full text-left px-3 py-2 rounded-md text-sm transition-all',
                          tabParam === 'review'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        На рассмотрении
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        closeMobileMenu();
                        router.push('/tenders?tab=inwork');
                      }}
                      className={cn(
                          'w-full text-left px-3 py-2 rounded-md text-sm transition-all',
                          tabParam === 'inwork'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        В работе
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        closeMobileMenu();
                        router.push('/tenders?tab=archive');
                      }}
                      className={cn(
                          'w-full text-left px-3 py-2 rounded-md text-sm transition-all',
                          tabParam === 'archive'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        Архив
                    </button>
                  </div>
                )}
              </div>
            );
          }

          // Обычные пункты меню
          return (
            <button
              key={item.href}
              onClick={(e) => {
                e.preventDefault();
                closeMobileMenu();
                router.push(item.href);
              }}
              className={cn(
                'flex items-center gap-3 w-full rounded-md text-sm font-medium h-9 px-4 transition-all',
                isCollapsed ? 'justify-center px-2' : 'justify-start',
                isActive 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 hover:from-blue-100 hover:to-purple-100 border-l-4 border-blue-600'
                  : 'hover:bg-secondary/80 text-gray-700'
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </button>
          );
        })}
      </nav>

      {/* User info and Logout */}
      <div className="border-t p-4 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* Имя пользователя */}
            <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                {currentUser.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentUser.username || 'Пользователь'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser.email || ''}
                </p>
              </div>
            </div>
            
            {/* Кнопка выхода */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all justify-start px-4 border border-red-200 hover:border-red-300"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Выход</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Аватар в свернутом виде */}
            <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
              {currentUser.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            {/* Кнопка выхода в свернутом виде */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-center px-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
              title="Выход"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
