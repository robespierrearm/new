'use client';

import { useState, useEffect } from 'react';
import { supabase, File, DocumentType, DOCUMENT_TYPE_ICONS, DOCUMENT_TYPE_COLORS, TenderLink, TenderLinkInsert } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUploadDialog } from '@/components/FileUploadDialog';
import { Download, Trash2, Plus, FileText, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TenderFilesListProps {
  tenderId: number;
  tenderStatus: string;
}

export function TenderFilesList({ tenderId, tenderStatus }: TenderFilesListProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<TenderLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState<DocumentType>('тендерная документация');
  const [linkDocType, setLinkDocType] = useState<DocumentType>('тендерная документация');
  const [linkForm, setLinkForm] = useState({
    name: '',
    url: '',
    description: '',
  });

  // Загрузка файлов
  const loadFiles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('tender_id', tenderId)
      .order('uploaded_at', { ascending: false });

    if (!error && data) {
      setFiles(data);
    }
    setIsLoading(false);
  };

  // Загрузка ссылок
  const loadLinks = async () => {
    const { data, error } = await supabase
      .from('tender_links')
      .select('*')
      .eq('tender_id', tenderId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLinks(data);
    }
  };

  useEffect(() => {
    loadFiles();
    loadLinks();
  }, [tenderId]);

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
        document_type: linkDocType,
        description: linkForm.description || null,
      };

      const { error } = await supabase
        .from('tender_links')
        .insert([linkData]);

      if (error) throw error;

      setLinkForm({ name: '', url: '', description: '' });
      setIsAddLinkDialogOpen(false);
      loadLinks();
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

  // Фильтрация файлов по типу
  const tenderDocs = files.filter(f => f.document_type === 'тендерная документация');
  const closingDocs = files.filter(f => f.document_type === 'закрывающие документы');
  const otherDocs = files.filter(f => f.document_type === 'прочее');

  // Фильтрация ссылок по типу
  const tenderLinks = links.filter(l => l.document_type === 'тендерная документация');
  const closingLinks = links.filter(l => l.document_type === 'закрывающие документы');
  const otherLinks = links.filter(l => l.document_type === 'прочее');

  // Проверка, можно ли загружать закрывающие документы
  const canUploadClosingDocs = tenderStatus === 'победа' || tenderStatus === 'в работе' || tenderStatus === 'завершён';

  const FileCard = ({ file }: { file: File }) => (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${DOCUMENT_TYPE_COLORS[file.document_type]}`}>
          <span className="text-2xl">{DOCUMENT_TYPE_ICONS[file.document_type]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">{file.name}</h4>
          <p className="text-xs text-gray-500 mt-1">{file.original_name}</p>
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
            onClick={() => handleDownload(file)}
            className="h-8 w-8 p-0"
            title="Скачать"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(file)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Удалить"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-8 text-gray-500">
      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
      <p className="text-sm">{message}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="tender" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tender">
            Документы ({tenderDocs.length})
          </TabsTrigger>
          <TabsTrigger value="closing" disabled={!canUploadClosingDocs}>
            Закрывающие ({closingDocs.length})
          </TabsTrigger>
          <TabsTrigger value="other">
            Прочее ({otherDocs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tender" className="space-y-3 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Тендерная документация</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setUploadDocType('тендерная документация');
                  setIsUploadDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Файл
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setLinkDocType('тендерная документация');
                  setIsAddLinkDialogOpen(true);
                }}
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                Ссылка
              </Button>
            </div>
          </div>

          {/* Ссылки */}
          {tenderLinks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                Ссылки ({tenderLinks.length})
              </h4>
              {tenderLinks.map((link) => (
                <Card key={link.id} className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
                      <LinkIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm text-gray-900">{link.name}</h5>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline block truncate mt-1"
                      >
                        {link.url}
                      </a>
                      {link.description && (
                        <p className="text-xs text-gray-500 mt-1">{link.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(link.url, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLink(link)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Файлы */}
          {tenderDocs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Файлы ({tenderDocs.length})
              </h4>
              {tenderDocs.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          )}

          {tenderDocs.length === 0 && tenderLinks.length === 0 && (
            <EmptyState message="Нет тендерной документации" />
          )}
        </TabsContent>

        <TabsContent value="closing" className="space-y-3 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Закрывающие документы</h3>
            {canUploadClosingDocs && (
              <Button
                size="sm"
                onClick={() => {
                  setUploadDocType('закрывающие документы');
                  setIsUploadDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Добавить
              </Button>
            )}
          </div>
          {closingDocs.length > 0 ? (
            <div className="space-y-2">
              {closingDocs.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <EmptyState 
              message={
                canUploadClosingDocs 
                  ? "Нет закрывающих документов" 
                  : "Закрывающие документы доступны после победы в тендере"
              } 
            />
          )}
        </TabsContent>

        <TabsContent value="other" className="space-y-3 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Прочие файлы</h3>
            <Button
              size="sm"
              onClick={() => {
                setUploadDocType('прочее');
                setIsUploadDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Добавить
            </Button>
          </div>
          {otherDocs.length > 0 ? (
            <div className="space-y-2">
              {otherDocs.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <EmptyState message="Нет прочих файлов" />
          )}
        </TabsContent>
      </Tabs>

      <FileUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        tenderId={tenderId}
        documentType={uploadDocType}
        onUploadComplete={loadFiles}
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
    </div>
  );
}
