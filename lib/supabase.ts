import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для базы данных
export interface Tender {
  id: number;
  name: string;
  link: string | null;
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
