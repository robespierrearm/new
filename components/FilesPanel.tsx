'use client';

import { useEffect, useState } from 'react';
import { supabase, File, FileInsert, FILE_CATEGORIES, DOCUMENT_TYPES, DOCUMENT_TYPE_ICONS, DOCUMENT_TYPE_COLORS, DocumentType } from '@/lib/supabase';
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
import { Upload, Download, Trash2, FileText, Eye, EyeOff, Plus } from 'lucide-react';
import { FilePreviewModal } from '@/components/FilePreviewModal';
import { FileIconComponent } from '@/lib/fileIcons';

const STORAGE_BUCKET = 'files';

type TenderListItem = { id: number; name: string };

interface FilesPanelProps {
  isActive?: boolean;
}

export function FilesPanel({ isActive = true }: FilesPanelProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [tenders, setTenders] = useState<TenderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [filterDocType, setFilterDocType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Форма загрузки
  const [uploadFile, setUploadFile] = useState<globalThis.File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileCategory, setFileCategory] = useState<string>('прочее');
  const [selectedTenderId, setSelectedTenderId] = useState<number | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('прочее');
  const [showOnDashboard, setShowOnDashboard] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Предпросмотр файлов
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Загрузка файлов и тендеров
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

  const loadTenders = async () => {
    const { data } = await supabase
      .from('tenders')
      .select('id, name')
      .order('created_at', { ascending: false });
    
    if (data) {
      setTenders(data);
    }
  };

  useEffect(() => {
    if (isActive) {
      loadFiles();
      loadTenders();
    }
  }, [isActive]);

  // Загрузка файла
  const handleUpload = async () => {
    if (!uploadFile || !fileName.trim()) {
      alert('Выберите файл и укажите название');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = uploadFile.name.split('.').pop();
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, uploadFile);

      if (uploadError) {
        console.error('Ошибка загрузки файла:', uploadError);
        alert('Ошибка загрузки файла');
        setIsUploading(false);
        return;
      }

      const currentUser = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('currentUser') || '{}')
        : {};
      
      const fileData: FileInsert = {
        name: fileName.trim(),
        original_name: uploadFile.name,
        file_path: filePath,
        file_size: uploadFile.size,
        mime_type: uploadFile.type,
        category: fileCategory,
        tender_id: selectedTenderId,
        document_type: selectedDocType,
        uploaded_by: currentUser.username || 'Пользователь',
        show_on_dashboard: showOnDashboard,
      };

      const { error: dbError } = await supabase.from('files').insert([fileData]);

      if (dbError) {
        console.error('Ошибка сохранения метаданных:', dbError);
        alert('Ошибка сохранения метаданных');
        setIsUploading(false);
        return;
      }

      await loadFiles();

      setUploadFile(null);
      setFileName('');
      setFileCategory('прочее');
      setSelectedTenderId(null);
      setSelectedDocType('прочее');
      setShowOnDashboard(false);
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при загрузке файла');
    }

    setIsUploading(false);
  };

  const handlePreview = async (file: File) => {
    const { data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(file.file_path, 3600);

    if (data?.signedUrl) {
      setPreviewFile(file);
      setPreviewUrl(data.signedUrl);
    }
  };

  const handleDownload = async (file: File) => {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(file.file_path);

    if (error) {
      console.error('Ошибка скачивания:', error);
      alert('Ошибка скачивания файла');
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.original_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (file: File) => {
    if (!confirm(`Удалить файл "${file.name}"?`)) return;

    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([file.file_path]);

    if (storageError) {
      console.error('Ошибка удаления из Storage:', storageError);
    }

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

  const filteredFiles = files.filter((file) => {
    if (filterDocType !== 'all' && file.document_type !== filterDocType) return false;
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getTenderName = (tenderId: number | null) => {
    if (!tenderId) return '—';
    const tender = tenders.find(t => t.id === tenderId);
    return tender?.name || `Тендер #${tenderId}`;
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
    <div className="h-full flex flex-col">
      {/* Заголовок с кнопкой */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="🔍 Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 h-8 text-xs"
          />
        </div>
        <Button
          onClick={() => setIsUploadDialogOpen(true)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Загрузить
        </Button>
      </div>

      {/* Фильтры типов документов */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilterDocType('all')}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
              filterDocType === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Все
          </button>
          {DOCUMENT_TYPES.map((docType) => {
            const icon = DOCUMENT_TYPE_ICONS[docType];
            const isActive = filterDocType === docType;
            
            return (
              <button
                key={docType}
                onClick={() => setFilterDocType(docType)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-1">
                  <span className="text-sm">{icon}</span>
                  <span className="capitalize">{docType}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Таблица файлов */}
      <div className="flex-1 overflow-auto border rounded-lg bg-white">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Файлов пока нет</p>
            <Button onClick={() => setIsUploadDialogOpen(true)} className="mt-4" variant="outline">
              Загрузить первый файл
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Тендер</TableHead>
                <TableHead>Размер</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileIconComponent 
                        fileName={file.original_name} 
                        mimeType={file.mime_type || undefined}
                        size="sm"
                      />
                      <div>
                        <div className="text-sm">{file.name}</div>
                        <div className="text-xs text-gray-500">{file.original_name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${DOCUMENT_TYPE_COLORS[file.document_type]}`}>
                      {file.document_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {getTenderName(file.tender_id)}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {formatSize(file.file_size)}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    <div>{formatDate(file.uploaded_at)}</div>
                    {file.uploaded_by && (
                      <div className="text-xs text-gray-400">{file.uploaded_by}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(file)}
                        title="Предпросмотр"
                        className="h-7 w-7 p-0"
                      >
                        <Eye className="h-3 w-3 text-purple-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDashboard(file)}
                        title={file.show_on_dashboard ? "Скрыть с дашборда" : "Показать на дашборде"}
                        className="h-7 w-7 p-0"
                      >
                        {file.show_on_dashboard ? (
                          <EyeOff className="h-3 w-3 text-orange-600" />
                        ) : (
                          <Eye className="h-3 w-3 text-green-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        title="Скачать"
                        className="h-7 w-7 p-0"
                      >
                        <Download className="h-3 w-3 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(file)}
                        title="Удалить"
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

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
              <Label htmlFor="tender">Тендер (необязательно)</Label>
              <Select 
                value={selectedTenderId?.toString() || 'none'} 
                onValueChange={(val) => setSelectedTenderId(val === 'none' ? null : parseInt(val))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Выберите тендер" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без тендера</SelectItem>
                  {tenders.map((tender) => (
                    <SelectItem key={tender.id} value={tender.id.toString()}>
                      {tender.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="docType">Тип документа</Label>
              <Select value={selectedDocType} onValueChange={(val) => setSelectedDocType(val as DocumentType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {DOCUMENT_TYPE_ICONS[type]} {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Модальное окно предпросмотра */}
      {previewFile && (
        <FilePreviewModal
          isOpen={!!previewFile}
          onClose={() => {
            setPreviewFile(null);
            setPreviewUrl('');
          }}
          fileUrl={previewUrl}
          fileName={previewFile.original_name}
          fileSize={previewFile.file_size || 0}
          mimeType={previewFile.mime_type || ''}
        />
      )}
    </div>
  );
}
