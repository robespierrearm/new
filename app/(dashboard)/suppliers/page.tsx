'use client';

import { useEffect, useState } from 'react';
import { supabase, Supplier, SupplierInsert } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddSupplierDialog } from '@/components/AddSupplierDialog';
import { EditSupplierDialog } from '@/components/EditSupplierDialog';
import { Pencil, Trash2, Search, Phone, Mail, FileText } from 'lucide-react';
import { formatPhoneForDisplay } from '@/lib/phoneUtils';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка поставщиков
  const loadSuppliers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка загрузки поставщиков:', error);
    } else {
      setSuppliers(data || []);
      setFilteredSuppliers(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // Поиск
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(query) ||
        supplier.phone?.toLowerCase().includes(query) ||
        supplier.contact_person?.toLowerCase().includes(query) ||
        supplier.email?.toLowerCase().includes(query)
    );
    setFilteredSuppliers(filtered);
  }, [searchQuery, suppliers]);

  // Добавление поставщика
  const handleAddSupplier = async (supplier: SupplierInsert) => {
    const { error } = await supabase.from('suppliers').insert([supplier]);

    if (error) {
      console.error('Ошибка добавления поставщика:', error);
      alert('Ошибка при добавлении поставщика');
    } else {
      loadSuppliers();
      setIsAddDialogOpen(false);
    }
  };

  // Обновление поставщика
  const handleUpdateSupplier = async (id: number, updates: Partial<Supplier>) => {
    const { error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Ошибка обновления поставщика:', error);
      alert('Ошибка при обновлении поставщика');
    } else {
      loadSuppliers();
      setEditingSupplier(null);
    }
  };

  // Удаление поставщика
  const handleDeleteSupplier = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого поставщика?')) {
      return;
    }

    const { error } = await supabase.from('suppliers').delete().eq('id', id);

    if (error) {
      console.error('Ошибка удаления поставщика:', error);
      alert('Ошибка при удалении поставщика');
    } else {
      loadSuppliers();
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-0.5">Поставщики</h1>
          <p className="text-xs text-gray-600">
            Управление базой поставщиков
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="w-full md:w-auto">
          Добавить поставщика
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Поиск по названию, телефону, контакту..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border">
          <p className="text-gray-500 text-lg">
            {searchQuery ? 'Поставщики не найдены' : 'Поставщиков пока нет'}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="mt-4"
              variant="outline"
            >
              Добавить первого поставщика
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
          {/* Заголовок таблицы */}
          <div className="grid grid-cols-[2.5fr_1.5fr_2fr_2fr_2.5fr_110px] gap-6 px-6 py-3 bg-gray-50 border-b font-medium text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span>🏢</span>
              <span>Компания</span>
            </div>
            <div className="flex items-center gap-2">
              <span>👤</span>
              <span>Контакт</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>Телефон</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>Email</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span>Примечания</span>
            </div>
            <div className="text-right">Действия</div>
          </div>

          {/* Строки данных */}
          <div className="divide-y">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="grid grid-cols-[2.5fr_1.5fr_2fr_2fr_2.5fr_110px] gap-6 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
              >
                {/* Компания */}
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-base truncate mb-1">
                    {supplier.name}
                  </div>
                  {supplier.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {supplier.category}
                    </span>
                  )}
                </div>

                {/* Контактное лицо */}
                <div className="text-sm text-gray-700 truncate">
                  {supplier.contact_person || <span className="text-gray-400 italic">Не указан</span>}
                </div>

                {/* Телефон */}
                <div className="text-sm">
                  {supplier.phone ? (
                    <a
                      href={`tel:${supplier.phone.replace(/\D/g, '')}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium border border-green-200 whitespace-nowrap"
                      title="Нажмите для звонка"
                    >
                      <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="font-mono text-xs">{formatPhoneForDisplay(supplier.phone)}</span>
                    </a>
                  ) : (
                    <span className="text-gray-400 italic text-xs">—</span>
                  )}
                </div>

                {/* Email */}
                <div className="text-sm min-w-0">
                  {supplier.email ? (
                    <a
                      href={`mailto:${supplier.email}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium border border-blue-200 max-w-full whitespace-nowrap"
                      title="Нажмите для отправки письма"
                    >
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate text-xs">{supplier.email}</span>
                    </a>
                  ) : (
                    <span className="text-gray-400 italic text-xs">—</span>
                  )}
                </div>

                {/* Примечания */}
                <div className="text-sm text-gray-600 min-w-0">
                  {supplier.notes ? (
                    <div 
                      className="flex items-start gap-1.5 text-xs text-gray-600" 
                      title={supplier.notes}
                    >
                      <FileText className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
                      <span className="line-clamp-2 leading-relaxed">{supplier.notes}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-xs">—</span>
                  )}
                </div>

                {/* Действия */}
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSupplier(supplier)}
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                    title="Редактировать"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSupplier(supplier.id)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddSupplierDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddSupplier}
      />

      {editingSupplier && (
        <EditSupplierDialog
          supplier={editingSupplier}
          open={!!editingSupplier}
          onOpenChange={(open) => !open && setEditingSupplier(null)}
          onUpdate={handleUpdateSupplier}
        />
      )}
    </div>
  );
}
