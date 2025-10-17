import { useState, useEffect, useCallback } from 'react';
import { supabase, Tender } from '@/lib/supabase';

export function useTenders() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTenders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('tenders')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setTenders(data || []);
    } catch (err) {
      console.error('Ошибка загрузки тендеров:', err);
      setError('Не удалось загрузить тендеры');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenders();
  }, [loadTenders]);

  return { tenders, loading, error, reload: loadTenders };
}
