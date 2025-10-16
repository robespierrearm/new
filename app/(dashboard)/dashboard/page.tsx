'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Users, TrendingUp } from 'lucide-react';

// Статичные данные для демонстрации
const stats = [
  {
    title: 'Количество тендеров',
    value: '24',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Количество поставщиков',
    value: '12',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Маржинальность',
    value: '18.5%',
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

const recentTenders = [
  {
    id: 1,
    name: 'Поставка офисной мебели',
    date: '2025-10-15',
    amount: '1 250 000 ₽',
    status: 'Подано',
  },
  {
    id: 2,
    name: 'Ремонт помещений',
    date: '2025-10-14',
    amount: '850 000 ₽',
    status: 'Черновик',
  },
  {
    id: 3,
    name: 'Закупка компьютерной техники',
    date: '2025-10-13',
    amount: '2 100 000 ₽',
    status: 'Победа',
  },
  {
    id: 4,
    name: 'Услуги по уборке',
    date: '2025-10-12',
    amount: '450 000 ₽',
    status: 'Подано',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Победа':
      return 'bg-green-100 text-green-800';
    case 'Подано':
      return 'bg-blue-100 text-blue-800';
    case 'Черновик':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Общая информация</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          Обзор ключевых показателей вашего бизнеса
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Tenders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Последние тендеры</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTenders.map((tender) => (
                <TableRow key={tender.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{tender.name}</TableCell>
                  <TableCell>{tender.date}</TableCell>
                  <TableCell>{tender.amount}</TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        tender.status
                      )}`}
                    >
                      {tender.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
