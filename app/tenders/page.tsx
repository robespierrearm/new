'use client';

import { useEffect, useState } from 'react';
import { supabase, Tender, TenderInsert } from '@/lib/supabase';
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
import { Pencil, Trash2 } from 'lucide-react';

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'черновик':
        return 'bg-gray-100 text-gray-800';
      case 'подано':
        return 'bg-blue-100 text-blue-800';
      case 'победа':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Тендеры</h1>
          <p className="text-gray-600 mt-2">
            Управление тендерами и заявками
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
          Добавить тендер
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : tenders.length === 0 ? (
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
                <TableHead>Ссылка</TableHead>
                <TableHead>Дата публикации</TableHead>
                <TableHead>Дата подачи</TableHead>
                <TableHead>Начальная цена</TableHead>
                <TableHead>Цена победы</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenders.map((tender) => (
                <TableRow key={tender.id}>
                  <TableCell className="font-medium">{tender.name}</TableCell>
                  <TableCell>
                    {tender.link ? (
                      <a
                        href={tender.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Открыть
                      </a>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{formatDate(tender.publication_date)}</TableCell>
                  <TableCell>{formatDate(tender.submission_date)}</TableCell>
                  <TableCell>{formatPrice(tender.start_price)}</TableCell>
                  <TableCell>
                    {tender.status === 'победа'
                      ? formatPrice(tender.win_price)
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        tender.status
                      )}`}
                    >
                      {tender.status}
                    </span>
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
