'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase, File, DocumentType, DOCUMENT_TYPE_ICONS, DOCUMENT_TYPE_COLORS, TenderLink, TenderLinkInsert } from '@/lib/supabase';
import { FileUploadDialog } from '@/components/FileUploadDialog';
import { Download, Trash2, Plus, Search, FileText, Link as LinkIcon, ExternalLink, Eye } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FilePreviewModal } from '@/components/FilePreviewModal';
import { FileIconComponent } from '@/lib/fileIcons';

interface TenderDocumentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenderId: number;
  tenderName: string;
  documentType: DocumentType;
  onMaterialsChange?: () => void;
}

export function TenderDocumentsModal({
  open,
  onOpenChange,
  tenderId,
  tenderName,
  documentType,
  onMaterialsChange,
}: TenderDocumentsModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<TenderLink[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<TenderLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkForm, setLinkForm] = useState({
    name: '',
    url: '',
    description: '',
  });

  // Предпросмотр файлов
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Загрузка файлов
  const loadFiles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('tender_id', tenderId)
      .eq('document_type', documentType)
      .order('uploaded_at', { ascending: false });

    if (!error && data) {
      setFiles(data);
      setFilteredFiles(data);
    }
    setIsLoading(false);
  };

  // Загрузка ссылок
  const loadLinks = async () => {
    const { data, error } = await supabase
      .from('tender_links')
      .select('*')
      .eq('tender_id', tenderId)
      .eq('document_type', documentType)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLinks(data);
      setFilteredLinks(data);
    }
  };

  useEffect(() => {
    if (open) {
      loadFiles();
      loadLinks();
      setSearchQuery('');
    }
  }, [open, tenderId, documentType]);

  // Поиск по файлам и ссылкам
  useEffect(() => {
    if (searchQuery) {
      const filteredF = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.original_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFiles(filteredF);

      const filteredL = links.filter(link =>
        link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (link.description && link.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredLinks(filteredL);
    } else {
      setFilteredFiles(files);
      setFilteredLinks(links);
    }
  }, [searchQuery, files, links]);

  // Предпросмотр файла
  const handlePreview = async (file: File) => {
    const { data } = await supabase.storage
      .from('files')
      .createSignedUrl(file.file_path, 3600);

    if (data?.signedUrl) {
      setPreviewFile(file);
      setPreviewUrl(data.signedUrl);
    }
  };

  // Скачивание файла
  const handleDownload = async (file: File) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Ошибка скачивания:', error);
      alert(`Ошибка скачивания: ${error.message}`);
    }
  };

  // Удаление файла
  const handleDelete = async (file: File) => {
    if (!confirm(`Удалить файл "${file.name}"?`)) return;

    try {
      // Удаляем из Storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Удаляем из БД
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      loadFiles();
      onMaterialsChange?.();
    } catch (error: any) {
      console.error('Ошибка удаления:', error);
      alert(`Ошибка удаления: ${error.message}`);
    }
  };

  // Добавление ссылки
  const handleAddLink = async () => {
    if (!linkForm.name || !linkForm.url) {
      alert('Заполните название и URL ссылки');
      return;
    }

    try {
      const linkData: TenderLinkInsert = {
        tender_id: tenderId,
        name: linkForm.name,
        url: linkForm.url,
        document_type: documentType,
        description: linkForm.description || null,
      };

      const { error } = await supabase
        .from('tender_links')
        .insert([linkData]);

      if (error) throw error;

      setLinkForm({ name: '', url: '', description: '' });
      setIsAddLinkDialogOpen(false);
      loadLinks();
      onMaterialsChange?.();
    } catch (error: any) {
      console.error('Ошибка добавления ссылки:', error);
      alert(`Ошибка добавления ссылки: ${error.message}`);
    }
  };

  // Удаление ссылки
  const handleDeleteLink = async (link: TenderLink) => {
    if (!confirm(`Удалить ссылку "${link.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('tender_links')
        .delete()
        .eq('id', link.id);

      if (error) throw error;

      loadLinks();
      onMaterialsChange?.();
    } catch (error: any) {
      console.error('Ошибка удаления ссылки:', error);
      alert(`Ошибка удаления ссылки: ${error.message}`);
    }
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

  // Форматирование размера файла
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTitle = () => {
    if (documentType === 'тендерная документация') return 'Тендерная документация';
    if (documentType === 'закрывающие документы') return 'Закрывающие документы';
    return 'Документы';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{DOCUMENT_TYPE_ICONS[documentType]}</span>
              <div>
                <div>{getTitle()}</div>
                <div className="text-sm font-normal text-gray-500 mt-1">{tenderName}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Поиск и кнопка добавления */}
            <div className="flex gap-3 mb-4 sticky top-0 bg-white z-10 pb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по названию файла..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setIsUploadDialogOpen(true)} variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Добавить файл
              </Button>
              <Button onClick={() => setIsAddLinkDialogOpen(true)} variant="outline">
                <LinkIcon className="h-4 w-4 mr-2" />
                Добавить ссылку
              </Button>
            </div>

            {/* Список ссылок */}
            {filteredLinks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Ссылки ({filteredLinks.length})
                </h3>
                <div className="space-y-2">
                  {filteredLinks.map((link) => (
                    <Card key={link.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
                          <LinkIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900">{link.name}</h4>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1 block truncate"
                          >
                            {link.url}
                          </a>
                          {link.description && (
                            <p className="text-xs text-gray-500 mt-1">{link.description}</p>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            {formatDate(link.created_at)}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(link.url, '_blank')}
                            className="h-9 w-9 p-0"
                            title="Открыть"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLink(link)}
                            className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Список файлов */}
            {filteredFiles.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Файлы ({filteredFiles.length})
                </h3>
              </div>
            )}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchQuery ? 'Файлы не найдены' : 'Нет файлов'}
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первый файл'}
                </p>
                {!searchQuery && (
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить файл
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map((file) => (
                  <Card key={file.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <FileIconComponent 
                        fileName={file.original_name} 
                        mimeType={file.mime_type || undefined}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{file.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 truncate">{file.original_name}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{formatFileSize(file.file_size)}</span>
                          <span>•</span>
                          <span>{formatDate(file.uploaded_at)}</span>
                          {file.uploaded_by && (
                            <>
                              <span>•</span>
                              <span>{file.uploaded_by}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(file)}
                          className="h-9 w-9 p-0"
                          title="Предпросмотр"
                        >
                          <Eye className="h-4 w-4 text-purple-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                          className="h-9 w-9 p-0"
                          title="Скачать"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file)}
                          className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Счетчик файлов */}
          <div className="pt-3 border-t text-sm text-gray-500">
            Всего файлов: {filteredFiles.length}
            {searchQuery && files.length !== filteredFiles.length && ` из ${files.length}`}
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог загрузки файла */}
      <FileUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        tenderId={tenderId}
        documentType={documentType}
        onUploadComplete={() => {
          loadFiles();
          onMaterialsChange?.();
        }}
      />

      {/* Диалог добавления ссылки */}
      <Dialog open={isAddLinkDialogOpen} onOpenChange={setIsAddLinkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Добавить ссылку
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="link-name">Название ссылки *</Label>
              <Input
                id="link-name"
                value={linkForm.name}
                onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                placeholder="Техническое задание"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="link-url">URL *</Label>
              <Input
                id="link-url"
                type="url"
                value={linkForm.url}
                onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                placeholder="https://example.com/document.pdf"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="link-description">Описание (необязательно)</Label>
              <Textarea
                id="link-description"
                value={linkForm.description}
                onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
                placeholder="Краткое описание документа..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddLinkDialogOpen(false);
                  setLinkForm({ name: '', url: '', description: '' });
                }}
              >
                Отмена
              </Button>
              <Button onClick={handleAddLink}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </div>
          </div>
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
    </>
  );
}
