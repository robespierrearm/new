'use client';

import { useState } from 'react';
import { TenderInsert } from '@/lib/supabase';
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

interface AddTenderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (tender: TenderInsert) => void;
}

export function AddTenderDialog({
  open,
  onOpenChange,
  onAdd,
}: AddTenderDialogProps) {
  const [formData, setFormData] = useState<TenderInsert>({
    name: '',
    purchase_number: '',
    link: '',
    region: '',
    publication_date: '',
    submission_date: '',
    submission_deadline: '',
    start_price: null,
    submitted_price: null,
    win_price: null,
    status: 'новый',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Введите название тендера');
      return;
    }

    onAdd(formData);

    // Сброс формы
    setFormData({
      name: '',
      purchase_number: '',
      link: '',
      region: '',
      publication_date: new Date().toISOString().split('T')[0],
      submission_date: '',
      submission_deadline: '',
      start_price: null,
      submitted_price: null,
      win_price: null,
      status: 'новый',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Добавить тендер</DialogTitle>
            <DialogDescription>
              Заполните информацию о новом тендере
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название тендера *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Введите название тендера"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="purchase_number">Номер гос закупки</Label>
              <Input
                id="purchase_number"
                value={formData.purchase_number || ''}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_number: e.target.value })
                }
                placeholder="№ 0123456789012345678901"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="link">Ссылка на тендер</Label>
              <Input
                id="link"
                type="url"
                value={formData.link || ''}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="region">Регион / Адрес</Label>
              <Input
                id="region"
                type="text"
                value={formData.region || ''}
                onChange={(e) =>
                  setFormData({ ...formData, region: e.target.value })
                }
                placeholder="Москва, Россия"
              />
              <p className="text-xs text-gray-500">
                Укажите регион или адрес доставки
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="publication_date">Дата публикации</Label>
                <Input
                  id="publication_date"
                  type="date"
                  value={formData.publication_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      publication_date: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="submission_date">Дата подачи заявки</Label>
                <Input
                  id="submission_date"
                  type="date"
                  value={formData.submission_date || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      submission_date: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_price">Начальная цена (₽)</Label>
                <Input
                  id="start_price"
                  type="number"
                  value={formData.start_price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      start_price: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="submission_deadline">Дедлайн подачи *</Label>
                <Input
                  id="submission_deadline"
                  type="date"
                  value={formData.submission_deadline || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, submission_deadline: e.target.value })
                  }
                />
              </div>
            </div>

            {formData.status === 'победа' && (
              <div className="grid gap-2">
                <Label htmlFor="win_price">Цена победы (₽)</Label>
                <Input
                  id="win_price"
                  type="number"
                  value={formData.win_price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      win_price: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit">Добавить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
