'use client';

import { useState, useEffect } from 'react';
import { IMaskInput } from 'react-imask';
import { Input } from '@/components/ui/input';
import { detectPhoneType, PhoneType } from '@/lib/phoneUtils';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PhoneInput({ value, onChange, placeholder, className, disabled }: PhoneInputProps) {
  const [phoneType, setPhoneType] = useState<PhoneType>('custom');
  const [localValue, setLocalValue] = useState(value);

  // Определяем тип телефона при изменении значения
  useEffect(() => {
    const type = detectPhoneType(value);
    setPhoneType(type);
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    
    // Определяем новый тип на основе введенного значения
    const newType = detectPhoneType(newValue);
    setPhoneType(newType);
    
    onChange(newValue);
  };

  // Получаем маску в зависимости от типа
  const getMaskOptions = () => {
    if (phoneType === 'mobile') {
      return {
        mask: '+7 (000) 000-00-00',
        lazy: false,
      };
    } else if (phoneType === 'city') {
      return {
        mask: '(000) 00-00-00',
        lazy: false,
      };
    }
    return null;
  };

  const maskOptions = getMaskOptions();
  const phonePlaceholder = placeholder || (
    phoneType === 'mobile' ? '+7 (___) ___-__-__' :
    phoneType === 'city' ? '(___) __-__-__' :
    'Введите номер телефона'
  );

  // Если это нестандартный формат - используем обычный Input
  if (phoneType === 'custom' || !maskOptions) {
    return (
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="tel"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={phonePlaceholder}
          className={`pl-10 ${className || ''}`}
          disabled={disabled}
        />
      </div>
    );
  }

  // Для стандартных форматов используем IMask
  return (
    <div className="relative">
      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
      <IMaskInput
        {...maskOptions}
        value={localValue}
        unmask={false}
        onAccept={(value: string) => handleChange(value)}
        disabled={disabled}
        placeholder={phonePlaceholder}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 ${className || ''}`}
      />
    </div>
  );
}
