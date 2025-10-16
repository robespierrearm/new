'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    title: 'Настройки',
    href: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

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
      <div className="flex h-16 items-center border-b bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <Link
          href="/dashboard"
          className="flex-1 flex items-center px-4 py-3 hover:bg-white/10 transition-all duration-200"
          onClick={closeMobileMenu}
        >
          {!isCollapsed ? (
            <h1 className="text-xl font-bold text-white drop-shadow-sm">
              TenderCRM
            </h1>
          ) : (
            <div className="text-2xl font-bold text-white drop-shadow-sm">
              TC
            </div>
          )}
        </Link>
        <button
          onClick={toggleCollapse}
          className="hidden md:flex items-center justify-center w-12 h-full hover:bg-white/10 transition-all duration-200 border-l border-white/20"
          title={isCollapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5 text-white" />
          ) : (
            <PanelLeftClose className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} onClick={closeMobileMenu}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full gap-3 transition-all',
                  isCollapsed ? 'justify-center px-2' : 'justify-start px-4',
                  isActive && 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 hover:from-blue-100 hover:to-purple-100 border-l-4 border-blue-600'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t p-4 bg-gray-50">
        <Button
          variant="ghost"
          className={cn(
            'w-full gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all',
            isCollapsed ? 'justify-center px-2' : 'justify-start px-4'
          )}
          title={isCollapsed ? 'Выход' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Выход</span>}
        </Button>
      </div>
    </div>
    </>
  );
}
