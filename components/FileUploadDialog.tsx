'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase, DocumentType, DOCUMENT_TYPES, FileInsert } from '@/lib/supabase';
import { Upload, X, FileText } from 'lucide-react';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenderId?: number;
  documentType?: DocumentType;
  onUploadComplete?: () => void;
}

export function FileUploadDialog({
  open,
  onOpenChange,
  tenderId,
  documentType = 'прочее',
  onUploadComplete,
}: FileUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>(documentType);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Пожалуйста, выберите файл');
      return;
    }

    if (!fileName.trim()) {
      alert('Пожалуйста, введите название файла');
      return;
    }

    setIsUploading(true);

    try {
      // Генерируем уникальное имя файла
      const fileExt = selectedFile.name.split('.').pop();
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${tenderId || 'general'}/${uniqueFileName}`;

      // Загружаем файл в Storage
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        
        // Более понятные сообщения об ошибках
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Storage bucket "files" не существует. Создайте его в Supabase Dashboard → Storage.');
        } else if (uploadError.message.includes('not allowed')) {
          throw new Error('Нет прав на загрузку файлов. Проверьте Storage Policies в Supabase.');
        } else {
          throw new Error(`Ошибка загрузки в Storage: ${uploadError.message}`);
        }
      }

      // Получаем имя текущего пользователя
      const currentUser = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('currentUser') || '{}')
        : {};
      
      // Сохраняем метаданные в таблицу files
      const fileData: FileInsert = {
        name: fileName,
        original_name: selectedFile.name,
        file_path: filePath,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        tender_id: tenderId || null,
        document_type: selectedDocType,
        category: 'документация',
        uploaded_by: currentUser.username || 'Пользователь',
      };

      const { error: dbError } = await supabase
        .from('files')
        .insert([fileData]);

      if (dbError) {
        console.error('Database insert error:', dbError);
        
        // Удаляем файл из Storage, если не удалось сохранить в БД
        await supabase.storage.from('files').remove([filePath]);
        
        // Более понятные сообщения об ошибках
        if (dbError.message.includes('column') && dbError.message.includes('does not exist')) {
          throw new Error('Таблица files не обновлена. Примените SQL миграцию из файла FILES_SYSTEM_SETUP.md');
        } else if (dbError.message.includes('violates foreign key')) {
          throw new Error('Указанный тендер не существует. Выберите другой тендер или загрузите без тендера.');
        } else {
          throw new Error(`Ошибка сохранения в БД: ${dbError.message}`);
        }
      }

      // Успешно загружено
      alert('Файл успешно загружен!');
      setSelectedFile(null);
      setFileName('');
      onOpenChange(false);
      onUploadComplete?.();
    } catch (error: any) {
      console.error('Ошибка загрузки файла:', error);
      alert(error.message || 'Произошла неизвестная ошибка при загрузке файла');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Загрузить файл</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Выбор файла */}
          <div className="space-y-2">
            <Label>Выберите файл</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                onChange={handleFileSelect}
                className="flex-1"
                disabled={isUploading}
              />
              {selectedFile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setFileName('');
                  }}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{selectedFile.name}</span>
                <span className="text-xs text-gray-500 ml-auto">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}
          </div>

          {/* Название файла */}
          <div className="space-y-2">
            <Label htmlFor="fileName">Название файла</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Введите название файла"
              disabled={isUploading}
            />
          </div>

          {/* Тип документа */}
          <div className="space-y-2">
            <Label>Тип документа</Label>
            <Select
              value={selectedDocType}
              onValueChange={(value) => setSelectedDocType(value as DocumentType)}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Отмена
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Загрузка...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Загрузить
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
