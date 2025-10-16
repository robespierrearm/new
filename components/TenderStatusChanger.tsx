'use client';

import { useState } from 'react';
import { Tender, STATUS_TRANSITIONS, STATUS_LABELS } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TenderStatusChangerProps {
  tender: Tender;
  onStatusChange: (tenderId: number, newStatus: Tender['status'], additionalData?: Partial<Tender>) => Promise<void>;
}

export function TenderStatusChanger({ tender, onStatusChange }: TenderStatusChangerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Tender['status'] | null>(null);
  const [submittedPrice, setSubmittedPrice] = useState<string>(''); // Цена подачи
  const [winPrice, setWinPrice] = useState<string>(''); // Цена победы
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const availableTransitions = STATUS_TRANSITIONS[tender.status];
  const isFinished = availableTransitions.length === 0;

  // Валидация перед сменой статуса
  const validateTransition = (newStatus: Tender['status']): string | null => {
    // Новый → Подано: проверка обязательных полей
    if (tender.status === 'новый' && newStatus === 'подано') {
      if (!tender.name || !tender.start_price || !tender.submission_deadline) {
        return 'Заполните обязательные поля: название, начальная цена, дедлайн';
      }
    }

    // Победа → В работе: проверка цены победы
    if (tender.status === 'победа' && newStatus === 'в работе') {
      if (!tender.win_price) {
        return 'Заполните поле "Цена победы" перед переходом в работу';
      }
    }

    return null;
  };

  // Обработка клика на кнопку смены статуса
  const handleStatusClick = (newStatus: Tender['status']) => {
    const error = validateTransition(newStatus);
    if (error) {
      setValidationError(error);
      setIsDialogOpen(true);
      setSelectedStatus(null);
      return;
    }

    // Если переход в "Подано" - запросить цену подачи
    if (newStatus === 'подано') {
      setSelectedStatus(newStatus);
      setValidationError('');
      setIsDialogOpen(true);
      return;
    }

    // Если переход в "Победа" - запросить цену победы
    if (newStatus === 'победа') {
      setSelectedStatus(newStatus);
      setValidationError('');
      setIsDialogOpen(true);
      return;
    }

    // Для остальных переходов - подтверждение
    setSelectedStatus(newStatus);
    setValidationError('');
    setIsDialogOpen(true);
  };

  // Подтверждение смены статуса
  const handleConfirm = async () => {
    if (!selectedStatus) return;

    setIsProcessing(true);

    try {
      const additionalData: Partial<Tender> = {};

      // Автоматические действия при смене статуса
      switch (selectedStatus) {
        case 'подано':
          // Автозаполнение даты подачи и сохранение цены подачи
          additionalData.submission_date = new Date().toISOString().split('T')[0];
          if (submittedPrice) {
            additionalData.submitted_price = parseFloat(submittedPrice);
          }
          // Сначала переводим в "Подано"
          await onStatusChange(tender.id, selectedStatus, additionalData);
          
          // Затем автоматически переводим в "На рассмотрении"
          await onStatusChange(tender.id, 'на рассмотрении', {});
          
          setIsDialogOpen(false);
          setSelectedStatus(null);
          setSubmittedPrice('');
          showNotification('на рассмотрении');
          setIsProcessing(false);
          return; // Выходим, чтобы не выполнять код ниже

        case 'победа':
          // Сохранение цены победы
          if (winPrice) {
            additionalData.win_price = parseFloat(winPrice);
          }
          break;

        case 'в работе':
          // Проверка цены победы
          if (!tender.win_price) {
            setValidationError('Цена победы не заполнена');
            setIsProcessing(false);
            return;
          }
          break;
      }

      await onStatusChange(tender.id, selectedStatus, additionalData);
      
      setIsDialogOpen(false);
      setSelectedStatus(null);
      setWinPrice('');
      setSubmittedPrice('');
      
      // Показать уведомление
      showNotification(selectedStatus);
    } catch (error) {
      console.error('Ошибка смены статуса:', error);
      setValidationError('Ошибка при смене статуса');
    } finally {
      setIsProcessing(false);
    }
  };

  // Уведомления
  const showNotification = (status: Tender['status']) => {
    const messages: Record<Tender['status'], string> = {
      'новый': '',
      'подано': '✅ Заявка подана',
      'на рассмотрении': '👀 Тендер на рассмотрении',
      'победа': '🎉 Тендер выигран!',
      'в работе': '🔧 Тендер в работе',
      'завершён': '✅ Тендер завершён',
      'проигрыш': '❌ Тендер проигран',
    };

    const message = messages[status];
    if (message) {
      // Можно использовать toast или alert
      alert(message);
    }
  };

  // Получить цвет кнопки для статуса
  const getStatusColor = (status: Tender['status']) => {
    switch (status) {
      case 'подано':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'на рассмотрении':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'победа':
        return 'bg-green-600 hover:bg-green-700';
      case 'в работе':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'завершён':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'проигрыш':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  // Получить иконку для статуса
  const getStatusIcon = (status: Tender['status']) => {
    switch (status) {
      case 'победа':
      case 'завершён':
        return <CheckCircle className="h-4 w-4" />;
      case 'проигрыш':
        return <XCircle className="h-4 w-4" />;
      default:
        return <ArrowRight className="h-4 w-4" />;
    }
  };

  if (isFinished) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <CheckCircle className="h-4 w-4" />
        <span>Финальный статус</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {availableTransitions.map((nextStatus) => (
          <Button
            key={nextStatus}
            onClick={() => handleStatusClick(nextStatus)}
            size="sm"
            className={cn(
              'gap-2',
              getStatusColor(nextStatus)
            )}
          >
            {getStatusIcon(nextStatus)}
            {STATUS_LABELS[nextStatus]}
          </Button>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {validationError ? (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Ошибка валидации
                </div>
              ) : (
                `Изменить статус на "${selectedStatus ? STATUS_LABELS[selectedStatus] : ''}"`
              )}
            </DialogTitle>
            <DialogDescription>
              {validationError || 'Подтвердите изменение статуса тендера'}
            </DialogDescription>
          </DialogHeader>

          {!validationError && selectedStatus === 'подано' && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="submitted_price">Цена подачи (₽) *</Label>
                <Input
                  id="submitted_price"
                  type="number"
                  value={submittedPrice}
                  onChange={(e) => setSubmittedPrice(e.target.value)}
                  placeholder="Введите цену по которой подали"
                  required
                />
                <p className="text-sm text-gray-500">
                  Укажите стоимость по которой вы подали заявку на тендер
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  ℹ️ После подачи статус автоматически изменится на "На рассмотрении"
                </p>
              </div>
            </div>
          )}

          {!validationError && selectedStatus === 'победа' && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="win_price">Цена победы (₽) *</Label>
                <Input
                  id="win_price"
                  type="number"
                  value={winPrice}
                  onChange={(e) => setWinPrice(e.target.value)}
                  placeholder="Введите цену победы"
                  required
                />
                <p className="text-sm text-gray-500">
                  Это обязательное поле для перехода в статус "Победа"
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedStatus(null);
                setWinPrice('');
                setSubmittedPrice('');
                setValidationError('');
              }}
            >
              {validationError ? 'Закрыть' : 'Отмена'}
            </Button>
            {!validationError && (
              <Button
                onClick={handleConfirm}
                disabled={
                  isProcessing || 
                  (selectedStatus === 'подано' && !submittedPrice) ||
                  (selectedStatus === 'победа' && !winPrice)
                }
              >
                {isProcessing ? 'Обработка...' : 'Подтвердить'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
