/**
 * Утилиты для форматирования телефонных номеров
 */

export type PhoneType = 'mobile' | 'city' | 'custom';

/**
 * Определяет тип телефонного номера по первым цифрам
 */
export function detectPhoneType(phone: string): PhoneType {
  // Удаляем все нецифровые символы для анализа
  const digits = phone.replace(/\D/g, '');
  
  if (!digits) return 'custom';
  
  // Мобильный: начинается с 8 или +7
  if (digits.startsWith('8') || digits.startsWith('7')) {
    return 'mobile';
  }
  
  // Городской: начинается с 3, 4, 5 или 6
  if (/^[3-6]/.test(digits)) {
    return 'city';
  }
  
  // Нестандартный формат
  return 'custom';
}

/**
 * Возвращает маску для телефонного номера в зависимости от типа
 */
export function getPhoneMask(phoneType: PhoneType): string {
  switch (phoneType) {
    case 'mobile':
      return '+7 (999) 999-99-99';
    case 'city':
      return '(999) 99-99-99';
    case 'custom':
      return ''; // Без маски
  }
}

/**
 * Форматирует телефонный номер для отображения
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';
  
  const phoneType = detectPhoneType(phone);
  const digits = phone.replace(/\D/g, '');
  
  if (phoneType === 'mobile') {
    // Мобильный формат: +7 (XXX) XXX-XX-XX
    if (digits.length >= 11) {
      const number = digits.startsWith('8') ? '7' + digits.slice(1) : digits;
      return `+7 (${number.slice(1, 4)}) ${number.slice(4, 7)}-${number.slice(7, 9)}-${number.slice(9, 11)}`;
    }
  } else if (phoneType === 'city') {
    // Городской формат: (XXX) XX-XX-XX
    if (digits.length >= 7) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`;
    }
  }
  
  // Если формат не распознан или недостаточно цифр - возвращаем как есть
  return phone;
}

/**
 * Валидирует телефонный номер
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  
  const phoneType = detectPhoneType(phone);
  
  if (phoneType === 'mobile') {
    // Мобильный: +7 (XXX) XXX-XX-XX
    return /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/.test(phone);
  } else if (phoneType === 'city') {
    // Городской: (XXX) XX-XX-XX
    return /^\(\d{3}\)\s\d{2}-\d{2}-\d{2}$/.test(phone);
  }
  
  // Нестандартный формат - считаем валидным если есть хотя бы одна цифра
  return /\d/.test(phone);
}

/**
 * Нормализует телефонный номер для сохранения в БД
 * Сохраняет оригинальный формат для нестандартных номеров
 */
export function normalizePhoneForStorage(phone: string): string {
  if (!phone) return '';
  
  const phoneType = detectPhoneType(phone);
  
  if (phoneType === 'custom') {
    // Для нестандартных номеров сохраняем как есть
    return phone.trim();
  }
  
  // Для стандартных форматов возвращаем отформатированную версию
  return formatPhoneForDisplay(phone);
}

/**
 * Получает placeholder для поля ввода в зависимости от типа
 */
export function getPhonePlaceholder(phoneType: PhoneType): string {
  switch (phoneType) {
    case 'mobile':
      return '+7 (___) ___-__-__';
    case 'city':
      return '(___) __-__-__';
    case 'custom':
      return 'Введите номер телефона';
  }
}
