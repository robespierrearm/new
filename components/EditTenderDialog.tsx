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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TenderFilesList } from '@/components/TenderFilesList';

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать тендер</DialogTitle>
          <DialogDescription>
            Измените информацию о тендере и управляйте файлами
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="files">Файлы</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <form onSubmit={handleSubmit}>
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

            <div className="grid gap-2">
              <Label htmlFor="edit-region">Регион / Адрес</Label>
              <Input
                id="edit-region"
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
                <Label htmlFor="edit-submission_deadline">Дедлайн подачи</Label>
                <Input
                  id="edit-submission_deadline"
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
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            <TenderFilesList tenderId={tender.id} tenderStatus={tender.status} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
