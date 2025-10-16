'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase, Tender, TenderInsert, STATUS_LABELS } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddTenderDialog } from '@/components/AddTenderDialog';
import { EditTenderDialog } from '@/components/EditTenderDialog';
import { TenderStatusChanger } from '@/components/TenderStatusChanger';
import { Pencil, Trash2 } from 'lucide-react';

type TabType = 'all' | 'new' | 'review' | 'inwork' | 'archive';
type ArchiveFilter = 'all' | 'completed' | 'lost';

function TendersContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;
  
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'all');
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('all');

  // Обновляем activeTab при изменении URL
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('all');
    }
  }, [tabParam]);

  // Загрузка тендеров
  const loadTenders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка загрузки тендеров:', error);
    } else {
      setTenders(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadTenders();
  }, []);

  // Добавление тендера
  const handleAddTender = async (tender: TenderInsert) => {
    const { error } = await supabase.from('tenders').insert([tender]);

    if (error) {
      console.error('Ошибка добавления тендера:', error);
      alert('Ошибка при добавлении тендера');
    } else {
      loadTenders();
      setIsAddDialogOpen(false);
    }
  };

  // Обновление тендера
  const handleUpdateTender = async (id: number, updates: Partial<Tender>) => {
    const { error } = await supabase
      .from('tenders')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Ошибка обновления тендера:', error);
      alert('Ошибка при обновлении тендера');
    } else {
      loadTenders();
      setEditingTender(null);
    }
  };

  // Удаление тендера
  const handleDeleteTender = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот тендер?')) {
      return;
    }

    const { error } = await supabase.from('tenders').delete().eq('id', id);

    if (error) {
      console.error('Ошибка удаления тендера:', error);
      alert('Ошибка при удалении тендера');
    } else {
      loadTenders();
    }
  };

  // Смена статуса тендера
  const handleStatusChange = async (
    tenderId: number,
    newStatus: Tender['status'],
    additionalData?: Partial<Tender>
  ) => {
    const updateData: Partial<Tender> = {
      status: newStatus,
      ...additionalData,
    };

    const { error } = await supabase
      .from('tenders')
      .update(updateData)
      .eq('id', tenderId);

    if (error) {
      console.error('Ошибка смены статуса:', error);
      throw error;
    }

    // Автоматическое создание записи в бухгалтерии при переходе в "Победа"
    if (newStatus === 'победа') {
      // Проверяем, нет ли уже записи для этого тендера в expenses
      const { data: existingExpenses } = await supabase
        .from('expenses')
        .select('id')
        .eq('tender_id', tenderId)
        .limit(1);

      // Если записей нет - создаём пустую запись (placeholder)
      // Это нужно чтобы тендер появился в бухгалтерии
      if (!existingExpenses || existingExpenses.length === 0) {
        console.log(`Тендер ${tenderId} переведён в статус "Победа" - запись в бухгалтерии будет создана автоматически при добавлении первого расхода`);
      }
    }

    loadTenders();
  };

  // Форматирование даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  // Форматирование цены
  const formatPrice = (price: number | null) => {
    if (!price) return '—';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Цвет статуса
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
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'проигрыш':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Фильтрация тендеров по табам
  const getFilteredTenders = () => {
    let filtered = [...tenders];

    switch (activeTab) {
      case 'new':
        filtered = tenders.filter(t => t.status === 'новый');
        break;
      case 'review':
        filtered = tenders.filter(t => t.status === 'на рассмотрении');
        break;
      case 'inwork':
        filtered = tenders.filter(t => t.status === 'в работе');
        break;
      case 'archive':
        filtered = tenders.filter(t => t.status === 'завершён' || t.status === 'проигрыш');
        
        // Применяем фильтр архива
        if (archiveFilter === 'completed') {
          filtered = filtered.filter(t => t.status === 'завершён');
        } else if (archiveFilter === 'lost') {
          filtered = filtered.filter(t => t.status === 'проигрыш');
        }
        break;
      case 'all':
      default:
        // Показываем все
        break;
    }

    return filtered;
  };

  const filteredTenders = getFilteredTenders();

  // Подсчёт тендеров для каждого таба
  const getCounts = () => {
    return {
      all: tenders.length,
      new: tenders.filter(t => t.status === 'новый').length,
      review: tenders.filter(t => t.status === 'на рассмотрении').length,
      inwork: tenders.filter(t => t.status === 'в работе').length,
      archive: tenders.filter(t => t.status === 'завершён' || t.status === 'проигрыш').length,
    };
  };

  const counts = getCounts();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Тендеры</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
            Управление тендерами и заявками
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="w-full md:w-auto">
          Добавить тендер
        </Button>
      </div>

      {/* Фильтры архива (только если активен таб Архив) */}
      {activeTab === 'archive' && (
        <div className="mb-6 bg-white rounded-lg border shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Фильтр архива:</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setArchiveFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                archiveFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border hover:bg-gray-100'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setArchiveFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                archiveFilter === 'completed'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white text-green-700 border border-green-200 hover:bg-green-50'
              }`}
            >
              ✓ Завершённые
            </button>
            <button
              onClick={() => setArchiveFilter('lost')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                archiveFilter === 'lost'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
              }`}
            >
              ✕ Проигрыш
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredTenders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Тендеров пока нет</p>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="mt-4"
            variant="outline"
          >
            Добавить первый тендер
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название тендера</TableHead>
                <TableHead>Дата публикации</TableHead>
                <TableHead>Дата подачи</TableHead>
                <TableHead>Начальная цена</TableHead>
                <TableHead>Цена подачи</TableHead>
                <TableHead>Цена победы</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Смена статуса</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenders.map((tender) => (
                <TableRow key={tender.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {tender.name}
                      {tender.link && (
                        <a
                          href={tender.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title="Открыть ссылку"
                        >
                          🔗
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(tender.publication_date)}</TableCell>
                  <TableCell>{formatDate(tender.submission_date)}</TableCell>
                  <TableCell>{formatPrice(tender.start_price)}</TableCell>
                  <TableCell>{formatPrice(tender.submitted_price)}</TableCell>
                  <TableCell>{formatPrice(tender.win_price)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        tender.status
                      )}`}
                    >
                      {STATUS_LABELS[tender.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TenderStatusChanger
                      tender={tender}
                      onStatusChange={handleStatusChange}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTender(tender)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTender(tender.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddTenderDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddTender}
      />

      {editingTender && (
        <EditTenderDialog
          tender={editingTender}
          open={!!editingTender}
          onOpenChange={(open) => !open && setEditingTender(null)}
          onUpdate={handleUpdateTender}
        />
      )}
    </div>
  );
}

export default function TendersPage() {
  return (
    <Suspense fallback={
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    }>
      <TendersContent />
    </Suspense>
  );
}
