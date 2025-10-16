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

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
          "fixed md:static inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r bg-background transition-transform duration-300 md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex h-16 items-center border-b px-6 hover:bg-gray-50 transition-colors"
        onClick={closeMobileMenu}
      >
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          TenderCRM
        </h1>
      </Link>

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
                  'w-full justify-start gap-3',
                  isActive && 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-5 w-5" />
          <span>Выход</span>
        </Button>
      </div>
    </div>
    </>
  );
}
