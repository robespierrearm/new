'use client';

import { useState, useEffect } from 'react';
import { Supplier } from '@/lib/supabase';
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
import { PhoneInput } from '@/components/PhoneInput';
import { normalizePhoneForStorage } from '@/lib/phoneUtils';

interface EditSupplierDialogProps {
  supplier: Supplier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: number, updates: Partial<Supplier>) => void;
}

export function EditSupplierDialog({
  supplier,
  open,
  onOpenChange,
  onUpdate,
}: EditSupplierDialogProps) {
  const [formData, setFormData] = useState<Partial<Supplier>>(supplier);

  useEffect(() => {
    setFormData(supplier);
  }, [supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      alert('Введите название компании');
      return;
    }

    // Нормализуем телефон перед сохранением
    const updatedData = {
      ...formData,
      phone: formData.phone ? normalizePhoneForStorage(formData.phone) : '',
    };

    onUpdate(supplier.id, updatedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Редактировать поставщика</DialogTitle>
            <DialogDescription>
              Измените информацию о поставщике
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Название компании *</Label>
              <Input
                id="edit-name"
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="ООО 'Поставщик'"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-contact_person">Контактное лицо</Label>
              <Input
                id="edit-contact_person"
                value={formData.contact_person || ''}
                onChange={(e) =>
                  setFormData({ ...formData, contact_person: e.target.value })
                }
                placeholder="Иванов Иван Иванович"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Телефон</Label>
                <PhoneInput
                  value={formData.phone || ''}
                  onChange={(value) =>
                    setFormData({ ...formData, phone: value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="info@company.ru"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-category">Категория</Label>
              <Input
                id="edit-category"
                value={formData.category || ''}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Мебель, Техника, Услуги..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Примечания</Label>
              <textarea
                id="edit-notes"
                value={formData.notes || ''}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Дополнительная информация..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
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
