'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase, Tender, TenderInsert, STATUS_LABELS } from '@/lib/supabase';
import { logActivity, ACTION_TYPES } from '@/lib/activityLogger';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AddTenderDialog } from '@/components/AddTenderDialog';
import { EditTenderDialog } from '@/components/EditTenderDialog';
import { TenderStatusChanger } from '@/components/TenderStatusChanger';
import { PlatformButton } from '@/components/PlatformButton';
import { TenderCardExpanded } from '@/components/TenderCardExpanded';
import { Pencil, Trash2, Calendar, DollarSign, FileText } from 'lucide-react';

type TabType = 'all' | 'new' | 'review' | 'inwork' | 'archive';
type ArchiveFilter = 'all' | 'completed' | 'lost';

function TendersContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;
  const statusParam = searchParams.get('status');
  const editParam = searchParams.get('edit');
  
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'all');
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('all');
  const [expandedTenderId, setExpandedTenderId] = useState<number | null>(null);

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

  // Обработка параметра edit из URL
  useEffect(() => {
    if (editParam && tenders.length > 0) {
      const tenderId = parseInt(editParam, 10);
      const tender = tenders.find(t => t.id === tenderId);
      if (tender) {
        setEditingTender(tender);
      }
    }
  }, [editParam, tenders]);

  // Добавление тендера
  const handleAddTender = async (tender: TenderInsert) => {
    const payload = {
      ...tender,
      link: tender.link || null,
      submission_date: tender.submission_date || null,
      submission_deadline: tender.submission_deadline || null,
      start_price: tender.start_price ?? null,
      submitted_price: tender.submitted_price ?? null,
      win_price: tender.win_price ?? null,
    };

    const { error } = await supabase.from('tenders').insert([payload]);

    if (error) {
      console.error('Ошибка добавления тендера:', error?.message || error, error);
      alert(error?.message || 'Ошибка при добавлении тендера');
    } else {
      // Логируем добавление тендера
      await logActivity(
        `Добавлен тендер: ${tender.name}`,
        ACTION_TYPES.TENDER_ADD,
        { 
          tender_name: tender.name,
          region: tender.region,
          status: tender.status,
          start_price: tender.start_price
        }
      );
      
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
      // Логируем редактирование тендера
      await logActivity(
        `Отредактирован тендер: ${updates.name || editingTender?.name || 'ID ' + id}`,
        ACTION_TYPES.TENDER_EDIT,
        { 
          tender_id: id,
          tender_name: updates.name || editingTender?.name,
          changes: updates
        }
      );
      
      loadTenders();
      setEditingTender(null);
    }
  };

  // Удаление тендера
  const handleDeleteTender = async (id: number) => {
    const tenderToDelete = tenders.find(t => t.id === id);
    
    if (!confirm('Вы уверены, что хотите удалить этот тендер?')) {
      return;
    }

    const { error } = await supabase.from('tenders').delete().eq('id', id);

    if (error) {
      console.error('Ошибка удаления тендера:', error);
      alert('Ошибка при удалении тендера');
    } else {
      // Логируем удаление тендера
      await logActivity(
        `Удален тендер: ${tenderToDelete?.name || 'ID ' + id}`,
        ACTION_TYPES.TENDER_DELETE,
        { 
          tender_id: id,
          tender_name: tenderToDelete?.name,
          region: tenderToDelete?.region,
          status: tenderToDelete?.status
        }
      );
      
      loadTenders();
    }
  };

  // Смена статуса тендера
  const handleStatusChange = async (
    tenderId: number,
    newStatus: Tender['status'],
    additionalData?: Partial<Tender>
  ) => {
    const tender = tenders.find(t => t.id === tenderId);
    const oldStatus = tender?.status;
    
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

    // Логируем смену статуса
    await logActivity(
      `Изменен статус тендера "${tender?.name || 'ID ' + tenderId}": ${oldStatus} → ${newStatus}`,
      ACTION_TYPES.TENDER_STATUS_CHANGE,
      { 
        tender_id: tenderId,
        tender_name: tender?.name,
        old_status: oldStatus,
        new_status: newStatus,
        additional_data: additionalData
      }
    );

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

    // Если есть параметр status из URL, фильтруем по нему
    if (statusParam) {
      filtered = tenders.filter(t => t.status === statusParam);
      return filtered;
    }

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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-0.5">Тендеры</h1>
          <p className="text-xs text-gray-600">
            Управление тендерами и заявками
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="w-full md:w-auto">
          Добавить тендер
        </Button>
      </div>

      {/* Фильтры архива (только если активен таб Архив) */}
      {activeTab === 'archive' && (
        <div className="mb-4 inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setArchiveFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              archiveFilter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setArchiveFilter('completed')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              archiveFilter === 'completed'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-1">
              <span>✓</span>
              <span>Завершённые</span>
            </span>
          </button>
          <button
            onClick={() => setArchiveFilter('lost')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              archiveFilter === 'lost'
                ? 'bg-white text-red-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-1">
              <span>✕</span>
              <span>Проигрыш</span>
            </span>
          </button>
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
        <div className="grid gap-4">
          {filteredTenders.map((tender) => (
            <Card 
              key={tender.id} 
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setExpandedTenderId(expandedTenderId === tender.id ? null : tender.id)}
            >
              <div className="flex flex-col gap-3">
                {/* Заголовок и действия */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <h3 className="font-semibold text-base text-gray-900 truncate">{tender.name}</h3>
                      <PlatformButton link={tender.link} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          tender.status
                        )}`}
                      >
                        {STATUS_LABELS[tender.status]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Смена статуса */}
                    <div className="hidden sm:block">
                      <TenderStatusChanger
                        tender={tender}
                        onStatusChange={handleStatusChange}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTender(tender)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTender(tender.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Информация */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Публикация</p>
                      <p className="font-medium text-gray-900">{formatDate(tender.publication_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Подача</p>
                      <p className="font-medium text-gray-900">{formatDate(tender.submission_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Начальная</p>
                      <p className="font-medium text-gray-900">{formatPrice(tender.start_price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Подачи</p>
                      <p className="font-medium text-gray-900">{formatPrice(tender.submitted_price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Победы</p>
                      <p className="font-medium text-green-600">{formatPrice(tender.win_price)}</p>
                    </div>
                  </div>
                </div>

                {/* Смена статуса на мобильных */}
                <div className="sm:hidden">
                  <TenderStatusChanger
                    tender={tender}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>

              {/* Раскрывающееся меню */}
              <TenderCardExpanded
                tender={tender}
                isExpanded={expandedTenderId === tender.id}
                onToggle={() => setExpandedTenderId(expandedTenderId === tender.id ? null : tender.id)}
              />
            </Card>
          ))}
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
