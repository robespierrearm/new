import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для базы данных
export interface Tender {
  id: number;
  name: string;
  link: string | null;
  region: string | null; // Регион / Адрес
  publication_date: string;
  submission_date: string | null;
  submission_deadline: string | null;
  start_price: number | null;
  submitted_price: number | null; // Цена по которой подали
  win_price: number | null;
  status: 'новый' | 'подано' | 'на рассмотрении' | 'победа' | 'в работе' | 'завершён' | 'проигрыш';
  created_at?: string;
  updated_at?: string;
}

export type TenderInsert = Omit<Tender, 'id' | 'created_at' | 'updated_at'>;
export type TenderUpdate = Partial<TenderInsert>;

// Логика переходов между статусами
export const STATUS_TRANSITIONS: Record<Tender['status'], Tender['status'][]> = {
  'новый': ['подано'],
  'подано': ['новый'], // Возврат назад если нужно
  'на рассмотрении': ['победа', 'проигрыш'],
  'победа': ['в работе'],
  'в работе': ['завершён'],
  'завершён': [], // финальный статус
  'проигрыш': [], // финальный статус
};

// Названия статусов для отображения
export const STATUS_LABELS: Record<Tender['status'], string> = {
  'новый': 'Новый',
  'подано': 'Подано',
  'на рассмотрении': 'На рассмотрении',
  'победа': 'Победа',
  'в работе': 'В работе',
  'завершён': 'Завершён',
  'проигрыш': 'Проигрыш',
};

export interface Supplier {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  category: string | null;
  notes: string | null;
  created_at?: string;
}

export type SupplierInsert = Omit<Supplier, 'id' | 'created_at'>;
export type SupplierUpdate = Partial<SupplierInsert>;

// Files types
export type DocumentType = 'тендерная документация' | 'закрывающие документы' | 'прочее';

export interface File {
  id: string;
  name: string;
  original_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  category: string;
  tender_id: number | null;
  document_type: DocumentType;
  uploaded_by: string | null;
  show_on_dashboard: boolean;
  uploaded_at: string;
  updated_at: string;
}

export interface FileInsert {
  name: string;
  original_name: string;
  file_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  category?: string;
  tender_id?: number | null;
  document_type?: DocumentType;
  uploaded_by?: string | null;
  show_on_dashboard?: boolean;
}

// Tender Links (ссылки в тендерной документации)
export interface TenderLink {
  id: number;
  tender_id: number;
  name: string;
  url: string;
  document_type: DocumentType;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenderLinkInsert {
  tender_id: number;
  name: string;
  url: string;
  document_type?: DocumentType;
  description?: string | null;
}

export interface FileUpdate {
  name?: string;
  category?: string;
  document_type?: DocumentType;
  show_on_dashboard?: boolean;
}

export const FILE_CATEGORIES = [
  'карточка предприятия',
  'шаблон',
  'договор',
  'документация',
  'прочее',
] as const;

export const DOCUMENT_TYPES: DocumentType[] = [
  'тендерная документация',
  'закрывающие документы',
  'прочее',
];

// Иконки для типов документов
export const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  'тендерная документация': '📄',
  'закрывающие документы': '🧾',
  'прочее': '📁',
};

// Цвета для типов документов
export const DOCUMENT_TYPE_COLORS: Record<DocumentType, string> = {
  'тендерная документация': 'bg-blue-100 text-blue-700',
  'закрывающие документы': 'bg-green-100 text-green-700',
  'прочее': 'bg-gray-100 text-gray-700',
};

// Типы для расходов (бухгалтерия)
export interface Expense {
  id: number;
  tender_id: number;
  category: string;
  amount: number;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ExpenseInsert = Omit<Expense, 'id' | 'created_at' | 'updated_at'>;
export type ExpenseUpdate = Partial<ExpenseInsert>;

// Категории расходов
export const EXPENSE_CATEGORIES = [
  'Материалы',
  'Работа',
  'Транспорт',
  'Оборудование',
  'Субподряд',
  'Налоги',
  'Прочее',
] as const;
