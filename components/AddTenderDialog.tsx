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
    link: '',
    publication_date: new Date().toISOString().split('T')[0],
    submission_date: '',
    start_price: null,
    win_price: null,
    status: 'черновик',
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
      link: '',
      publication_date: new Date().toISOString().split('T')[0],
      submission_date: '',
      start_price: null,
      win_price: null,
      status: 'черновик',
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
                <Label htmlFor="status">Статус</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'черновик' | 'подано' | 'победа',
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="черновик">Черновик</option>
                  <option value="подано">Подано</option>
                  <option value="победа">Победа</option>
                </select>
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
