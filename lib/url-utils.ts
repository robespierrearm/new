/**
 * Извлекает домен из URL
 * @param url - полный URL
 * @returns домен без www и протокола
 * @example
 * extractDomain('https://zakupki.gov.ru/epz/order/...') // 'zakupki.gov.ru'
 * extractDomain('https://www.example.com/path') // 'example.com'
 */
export function extractDomain(url: string | null): string | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname;
    
    // Убираем www. если есть
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    return domain;
  } catch (error) {
    // Если URL невалидный, пытаемся извлечь домен вручную
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    return match ? match[1] : null;
  }
}

/**
 * Проверяет, является ли строка валидным URL
 * @param url - строка для проверки
 * @returns true если валидный URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Добавляет протокол к URL если его нет
 * @param url - URL
 * @returns URL с протоколом
 */
export function ensureProtocol(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}
