import { 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileSpreadsheet, 
  FileCode,
  File,
  FileArchive,
  Presentation,
  LucideIcon
} from 'lucide-react';

export type FileIconType = {
  icon: LucideIcon;
  color: string;
  bgColor: string;
};

export const getFileIcon = (fileName: string, mimeType?: string): FileIconType => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // PDF
  if (extension === 'pdf' || mimeType?.includes('pdf')) {
    return {
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    };
  }
  
  // Изображения
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(extension) || 
      mimeType?.includes('image')) {
    return {
      icon: FileImage,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    };
  }
  
  // Видео
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension) || 
      mimeType?.includes('video')) {
    return {
      icon: FileVideo,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    };
  }
  
  // Аудио
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(extension) || 
      mimeType?.includes('audio')) {
    return {
      icon: FileAudio,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    };
  }
  
  // Excel
  if (['xls', 'xlsx', 'csv'].includes(extension) || 
      mimeType?.includes('spreadsheet') || 
      mimeType?.includes('excel')) {
    return {
      icon: FileSpreadsheet,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    };
  }
  
  // Word
  if (['doc', 'docx'].includes(extension) || 
      mimeType?.includes('word') || 
      mimeType?.includes('document')) {
    return {
      icon: FileText,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50'
    };
  }
  
  // PowerPoint
  if (['ppt', 'pptx'].includes(extension) || 
      mimeType?.includes('presentation')) {
    return {
      icon: Presentation,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    };
  }
  
  // Код
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'].includes(extension)) {
    return {
      icon: FileCode,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    };
  }
  
  // Текстовые файлы
  if (['txt', 'md', 'log', 'rtf'].includes(extension) || 
      mimeType?.includes('text')) {
    return {
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    };
  }
  
  // Архивы
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension) || 
      mimeType?.includes('zip') || 
      mimeType?.includes('compressed')) {
    return {
      icon: FileArchive,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    };
  }
  
  // По умолчанию
  return {
    icon: File,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50'
  };
};

export const FileIconComponent = ({ 
  fileName, 
  mimeType, 
  size = 'md' 
}: { 
  fileName: string; 
  mimeType?: string; 
  size?: 'sm' | 'md' | 'lg' 
}) => {
  const { icon: Icon, color, bgColor } = getFileIcon(fileName, mimeType);
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  
  const paddingClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };
  
  return (
    <div className={`${bgColor} ${paddingClasses[size]} rounded`}>
      <Icon className={`${sizeClasses[size]} ${color}`} />
    </div>
  );
};
