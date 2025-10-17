import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useActivityTracker() {
  useEffect(() => {
    const updateActivity = async () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (currentUser.id) {
        await supabase
          .from('users')
          .update({ 
            last_activity: new Date().toISOString(),
            is_online: true
          })
          .eq('id', currentUser.id);
      }
    };

    // Обновляем активность сразу при монтировании
    updateActivity();

    // Обновляем каждые 30 секунд
    const interval = setInterval(updateActivity, 30000);

    // Обновляем при любой активности пользователя
    const handleActivity = () => {
      updateActivity();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, []);
}
