'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Users, TrendingUp, Calendar, Clock, Download, FolderOpen } from 'lucide-react';
import { supabase, File } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

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
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [dashboardFiles, setDashboardFiles] = useState<File[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Загрузка файлов для дашборда
  useEffect(() => {
    const loadDashboardFiles = async () => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('show_on_dashboard', true)
        .order('uploaded_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setDashboardFiles(data);
      }
    };

    loadDashboardFiles();
  }, []);

  // Скачивание файла
  const handleDownload = async (file: File) => {
    const { data, error } = await supabase.storage
      .from('files')
      .download(file.file_path);

    if (error) {
      console.error('Ошибка скачивания:', error);
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.original_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Общая информация</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
              Обзор ключевых показателей вашего бизнеса
            </p>
          </div>
          
          {/* Дата и время */}
          <div className="flex flex-col gap-2 bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-3 rounded-lg border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{formatDate(currentDateTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-lg font-bold tabular-nums">{formatTime(currentDateTime)}</span>
            </div>
          </div>
        </div>
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

      {/* Файлы для работы */}
      {dashboardFiles.length > 0 && (
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              Файлы для работы
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/files'}>
              Все файлы
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{file.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                          {file.category}
                        </span>
                        <span>•</span>
                        <span>{new Date(file.uploaded_at).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Скачать
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
