'use client';

import { ExternalLink } from 'lucide-react';
import { extractDomain, ensureProtocol } from '@/lib/url-utils';
import Image from 'next/image';
import { useState } from 'react';

interface PlatformButtonProps {
  link: string | null; // Используем существующее поле link
  className?: string;
}

export function PlatformButton({ link, className = '' }: PlatformButtonProps) {
  const [imageError, setImageError] = useState(false);
  
  if (!link) return null;

  const domain = extractDomain(link);
  const fullUrl = ensureProtocol(link);

  if (!domain) return null;

  // URL для получения favicon через Google
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow ${className}`}
      title={`Открыть ${domain} в новой вкладке`}
    >
      {/* Favicon или иконка по умолчанию */}
      {!imageError ? (
        <img
          src={faviconUrl}
          alt=""
          className="w-4 h-4 flex-shrink-0"
          onError={() => setImageError(true)}
        />
      ) : (
        <ExternalLink className="h-4 w-4 flex-shrink-0" />
      )}
      <span className="truncate max-w-[150px]">{domain}</span>
    </a>
  );
}
