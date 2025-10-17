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
import { Pencil, Trash2, Search } from 'lucide-react';

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
        <div className="border rounded-lg bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название компании</TableHead>
                <TableHead>Контактное лицо</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contact_person || '—'}</TableCell>
                  <TableCell>{supplier.phone || '—'}</TableCell>
                  <TableCell>{supplier.email || '—'}</TableCell>
                  <TableCell>
                    {supplier.category ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {supplier.category}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSupplier(supplier)}
                        className="hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        className="hover:bg-red-50"
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
