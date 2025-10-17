'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Clock, Download, FolderOpen, Briefcase, Eye, Bell, ChevronRight } from 'lucide-react';
import { supabase, File, Tender } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const getStatusColor = (status: Tender['status']) => {
  switch (status) {
    case 'новый':
      return 'bg-blue-100 text-blue-800';
    case 'подано':
      return 'bg-indigo-100 text-indigo-800';
    case 'на рассмотрении':
      return 'bg-purple-100 text-purple-800';
    case 'победа':
      return 'bg-green-100 text-green-800';
    case 'в работе':
      return 'bg-orange-100 text-orange-800';
    case 'завершён':
      return 'bg-green-50 text-green-700';
    case 'проигрыш':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: Tender['status']) => {
  const labels: Record<Tender['status'], string> = {
    'новый': 'Новый',
    'подано': 'Подано',
    'на рассмотрении': 'На рассмотрении',
    'победа': 'Победа',
    'в работе': 'В работе',
    'завершён': 'Завершён',
    'проигрыш': 'Проигрыш',
  };
  return labels[status] || status;
};

const formatPrice = (price: number | null) => {
  if (!price) return '—';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
};

const formatTenderDate = (dateString: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('ru-RU');
};

export default function DashboardPage() {
  const router = useRouter();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [dashboardFiles, setDashboardFiles] = useState<File[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [stats, setStats] = useState({
    inWork: 0,
    underReview: 0,
    reminders: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Загрузка тендеров
  useEffect(() => {
    const loadTenders = async () => {
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setTenders(data);
        
        // Подсчёт статистики
        const inWorkCount = data.filter(t => t.status === 'в работе').length;
        const underReviewCount = data.filter(t => t.status === 'на рассмотрении').length;
        
        // Напоминания: тендеры с дедлайном в ближайшие 3 дня
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        const remindersCount = data.filter(t => {
          if (!t.submission_deadline) return false;
          const deadline = new Date(t.submission_deadline);
          const now = new Date();
          return deadline > now && deadline <= threeDaysFromNow;
        }).length;

        setStats({
          inWork: inWorkCount,
          underReview: underReviewCount,
          reminders: remindersCount,
        });
      }
    };

    loadTenders();
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Функция перехода на страницу тендеров с фильтром
  const navigateToTenders = (status?: string) => {
    if (status) {
      router.push(`/tenders?status=${encodeURIComponent(status)}`);
    } else {
      router.push('/tenders');
    }
  };

  // Функция перехода на конкретный тендер
  const navigateToTender = (tenderId: number) => {
    router.push(`/tenders?edit=${tenderId}`);
  };

  // Динамические данные для трёх основных блоков
  const mainCards = [
    {
      title: 'В работе',
      value: stats.inWork.toString(),
      description: 'Активных тендеров',
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      status: 'в работе',
    },
    {
      title: 'На рассмотрении',
      value: stats.underReview.toString(),
      description: 'Ожидают решения',
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      status: 'на рассмотрении',
    },
    {
      title: 'Напоминания',
      value: stats.reminders.toString(),
      description: 'Требуют внимания',
      icon: Bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      status: undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Верхняя строка: Заголовок слева, Время справа */}
        <div className="flex items-center justify-between mb-5">
          {/* Заголовок */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-0.5">Общая информация</h1>
            <p className="text-xs text-gray-600">Обзор ключевых показателей вашего бизнеса</p>
          </div>

          {/* Время */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-700 tabular-nums">
              {formatTime(currentDateTime)}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{formatDate(currentDateTime)}</span>
          </div>
        </div>

        {/* Три основных блока */}
        <div className="grid gap-3 md:grid-cols-3 mb-5 max-w-4xl">
          {mainCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className={`transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border ${card.borderColor} bg-white`}
                onClick={() => card.status && navigateToTenders(card.status)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-medium text-gray-600">{card.title}</h3>
                    <p className="text-xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500">{card.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Нижние два блока: Последние тендеры (70%) + Файлы (30%) */}
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          {/* Последние тендеры */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b px-4 py-2.5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900">Последние тендеры</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 h-7 text-xs" onClick={() => router.push('/tenders')}>
                  Все тендеры
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {tenders.length > 0 ? (
                <div className="divide-y">
                  {tenders.map((tender) => (
                    <div 
                      key={tender.id} 
                      className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigateToTender(tender.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate mb-1">{tender.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{formatTenderDate(tender.publication_date)}</span>
                            <span>•</span>
                            <span className="font-medium text-gray-700">{formatPrice(tender.start_price)}</span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                            tender.status
                          )}`}
                        >
                          {getStatusLabel(tender.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Нет тендеров для отображения</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Файлы */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b px-4 py-2.5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <FolderOpen className="h-3.5 w-3.5 text-blue-600" />
                  Файлы
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 h-7 text-xs" onClick={() => router.push('/files')}>
                  Все
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              {dashboardFiles.length > 0 ? (
                <div className="space-y-2">
                  {dashboardFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {file.category}
                          </span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-xs">
                  <FolderOpen className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p>Нет файлов для отображения</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
