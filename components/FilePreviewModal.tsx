'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

const MAX_PREVIEW_SIZE = 20 * 1024 * 1024; // 20 MB

export function FilePreviewModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileSize,
  mimeType,
}: FilePreviewModalProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Определяем тип файла
  const getFileType = () => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (mimeType.includes('pdf') || extension === 'pdf') return 'pdf';
    if (mimeType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) return 'image';
    if (['txt', 'json', 'csv', 'md'].includes(extension || '')) return 'text';
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension || '')) return 'office';
    
    return 'unknown';
  };

  const fileType = getFileType();
  const canPreview = fileSize <= MAX_PREVIEW_SIZE;

  // Загружаем текстовый контент
  useEffect(() => {
    if (!isOpen || fileType !== 'text' || !canPreview) return;

    const loadTextContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error('Ошибка загрузки файла');
        const text = await response.text();
        setFileContent(text);
      } catch (err) {
        setError('Не удалось загрузить файл');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTextContent();
  }, [isOpen, fileUrl, fileType, canPreview]);

  // Очищаем контент при закрытии
  useEffect(() => {
    if (!isOpen) {
      setFileContent(null);
      setError(null);
    }
  }, [isOpen]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const renderPreview = () => {
    if (!canPreview) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Файл слишком большой
          </h3>
          <p className="text-gray-600 mb-1">
            Размер файла: <span className="font-semibold">{formatFileSize(fileSize)}</span>
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Предпросмотр доступен только для файлов до 20 МБ
          </p>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Скачать файл
          </Button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleDownload} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Скачать файл
          </Button>
        </div>
      );
    }

    switch (fileType) {
      case 'pdf':
        return (
          <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            title={fileName}
          />
        );

      case 'image':
        return (
          <div className="flex items-center justify-center h-full p-4 bg-gray-50">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        );

      case 'text':
        return (
          <div className="h-full overflow-auto p-6 bg-gray-50">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-white p-4 rounded-lg border">
              {fileContent}
            </pre>
          </div>
        );

      case 'office':
        return (
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
            className="w-full h-full border-0"
            title={fileName}
          />
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Предпросмотр недоступен
            </h3>
            <p className="text-gray-600 mb-6">
              Этот тип файла не поддерживает предпросмотр
            </p>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Скачать файл
            </Button>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-[100] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex-1 min-w-0 mr-4">
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {fileName}
                </h2>
                <p className="text-sm text-gray-500">
                  {formatFileSize(fileSize)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex-shrink-0 h-9 w-9 p-0 rounded-full hover:bg-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {renderPreview()}
            </div>

            {/* Footer */}
            {canPreview && !error && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Скачать
                </Button>
                <Button onClick={onClose} variant="default">
                  Закрыть
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
