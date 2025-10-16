'use client';

import { useState, useEffect } from 'react';
import { Tender } from '@/lib/supabase';
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

interface EditTenderDialogProps {
  tender: Tender;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: number, updates: Partial<Tender>) => void;
}

export function EditTenderDialog({
  tender,
  open,
  onOpenChange,
  onUpdate,
}: EditTenderDialogProps) {
  const [formData, setFormData] = useState<Partial<Tender>>(tender);

  useEffect(() => {
    setFormData(tender);
  }, [tender]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      alert('Введите название тендера');
      return;
    }

    onUpdate(tender.id, formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Редактировать тендер</DialogTitle>
            <DialogDescription>
              Измените информацию о тендере
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Название тендера *</Label>
              <Input
                id="edit-name"
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Введите название тендера"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-link">Ссылка на тендер</Label>
              <Input
                id="edit-link"
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
                <Label htmlFor="edit-publication_date">Дата публикации</Label>
                <Input
                  id="edit-publication_date"
                  type="date"
                  value={formData.publication_date || ''}
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
                <Label htmlFor="edit-submission_date">Дата подачи заявки</Label>
                <Input
                  id="edit-submission_date"
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
                <Label htmlFor="edit-start_price">Начальная цена (₽)</Label>
                <Input
                  id="edit-start_price"
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
                <Label htmlFor="edit-status">Статус</Label>
                <select
                  id="edit-status"
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
                <Label htmlFor="edit-win_price">Цена победы (₽)</Label>
                <Input
                  id="edit-win_price"
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
            <Button type="submit">Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
