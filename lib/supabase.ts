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
  start_price: number | null;
  win_price: number | null;
  status: 'черновик' | 'подано' | 'победа';
  created_at?: string;
}

export type TenderInsert = Omit<Tender, 'id' | 'created_at'>;
export type TenderUpdate = Partial<TenderInsert>;

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
