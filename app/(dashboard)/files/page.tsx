'use client';

import { useEffect, useState } from 'react';
import { supabase, File, FileInsert, FILE_CATEGORIES } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, Download, Trash2, FileText, Filter, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_BUCKET = 'files';

export default function FilesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDashboard, setFilterDashboard] = useState<string>('all');

  // Форма загрузки
  const [uploadFile, setUploadFile] = useState<globalThis.File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileCategory, setFileCategory] = useState<string>('прочее');
  const [showOnDashboard, setShowOnDashboard] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Загрузка файлов
  const loadFiles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Ошибка загрузки файлов:', error);
    } else {
      setFiles(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // Загрузка файла
  const handleUpload = async () => {
    if (!uploadFile || !fileName.trim()) {
      alert('Выберите файл и укажите название');
      return;
    }

    setIsUploading(true);

    try {
      // Генерируем уникальное имя файла
      const fileExt = uploadFile.name.split('.').pop();
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${uniqueFileName}`;

      // Загружаем файл в Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, uploadFile);

      if (uploadError) {
        console.error('Ошибка загрузки файла:', uploadError);
        alert('Ошибка загрузки файла');
        setIsUploading(false);
        return;
      }

      // Сохраняем метаданные в базу
      const fileData: FileInsert = {
        name: fileName.trim(),
        original_name: uploadFile.name,
        file_path: filePath,
        file_size: uploadFile.size,
        mime_type: uploadFile.type,
        category: fileCategory,
        show_on_dashboard: showOnDashboard,
      };

      const { error: dbError } = await supabase.from('files').insert([fileData]);

      if (dbError) {
        console.error('Ошибка сохранения метаданных:', dbError);
        alert('Ошибка сохранения метаданных');
        setIsUploading(false);
        return;
      }

      // Обновляем список
      await loadFiles();

      // Сбрасываем форму
      setUploadFile(null);
      setFileName('');
      setFileCategory('прочее');
      setShowOnDashboard(false);
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при загрузке файла');
    }

    setIsUploading(false);
  };

  // Скачивание файла
  const handleDownload = async (file: File) => {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(file.file_path);

    if (error) {
      console.error('Ошибка скачивания:', error);
      alert('Ошибка скачивания файла');
      return;
    }

    // Создаём ссылку для скачивания
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.original_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Удаление файла
  const handleDelete = async (file: File) => {
    if (!confirm(`Удалить файл "${file.name}"?`)) return;

    // Удаляем из Storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([file.file_path]);

    if (storageError) {
      console.error('Ошибка удаления из Storage:', storageError);
    }

    // Удаляем из базы
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', file.id);

    if (dbError) {
      console.error('Ошибка удаления из базы:', dbError);
      alert('Ошибка удаления файла');
      return;
    }

    await loadFiles();
  };

  // Переключение показа на дашборде
  const toggleDashboard = async (file: File) => {
    const { error } = await supabase
      .from('files')
      .update({ show_on_dashboard: !file.show_on_dashboard })
      .eq('id', file.id);

    if (error) {
      console.error('Ошибка обновления:', error);
      return;
    }

    await loadFiles();
  };

  // Фильтрация
  const filteredFiles = files.filter((file) => {
    if (filterCategory !== 'all' && file.category !== filterCategory) return false;
    if (filterDashboard === 'yes' && !file.show_on_dashboard) return false;
    if (filterDashboard === 'no' && file.show_on_dashboard) return false;
    return true;
  });

  // Форматирование размера
  const formatSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Файловая система</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
            Управление документами и файлами
          </p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)} size="lg" className="w-full md:w-auto">
          <Upload className="h-4 w-4 mr-2" />
          Загрузить файл
        </Button>
      </div>

      {/* Фильтры */}
      <div className="mb-6 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Фильтры</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Категория</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {FILE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Показ на дашборде</Label>
            <Select value={filterDashboard} onValueChange={setFilterDashboard}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все файлы</SelectItem>
                <SelectItem value="yes">Только на дашборде</SelectItem>
                <SelectItem value="no">Не на дашборде</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Таблица файлов */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Файлов пока нет</p>
          <Button onClick={() => setIsUploadDialogOpen(true)} className="mt-4" variant="outline">
            Загрузить первый файл
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Размер</TableHead>
                <TableHead>Дата загрузки</TableHead>
                <TableHead>Дашборд</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div>
                        <div>{file.name}</div>
                        <div className="text-xs text-gray-500">{file.original_name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {file.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatSize(file.file_size)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(file.uploaded_at)}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleDashboard(file)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
                        file.show_on_dashboard
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {file.show_on_dashboard ? (
                        <>
                          <Eye className="h-3 w-3" />
                          Да
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Нет
                        </>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        title="Скачать"
                      >
                        <Download className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(file)}
                        title="Удалить"
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

      {/* Диалог загрузки */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Загрузить файл</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Выберите файл *</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setUploadFile(file || null);
                  if (file && !fileName) {
                    setFileName(file.name.split('.')[0]);
                  }
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fileName">Название файла *</Label>
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Введите название"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category">Категория</Label>
              <Select value={fileCategory} onValueChange={setFileCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dashboard"
                checked={showOnDashboard}
                onChange={(e) => setShowOnDashboard(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="dashboard" className="cursor-pointer">
                Отображать на дашборде
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Загрузка...' : 'Загрузить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
