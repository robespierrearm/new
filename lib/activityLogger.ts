import { supabase } from './supabase';

export async function logActivity(
  action: string,
  actionType: string,
  details?: any
) {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.id) {
      console.warn('Нет текущего пользователя для логирования');
      return;
    }

    await supabase
      .from('activity_logs')
      .insert({
        user_id: currentUser.id,
        username: currentUser.username || 'Неизвестный',
        action,
        action_type: actionType,
        details: details || {}
      });

    // Обновляем время последней активности
    await supabase
      .from('users')
      .update({ 
        last_activity: new Date().toISOString(),
        is_online: true
      })
      .eq('id', currentUser.id);
  } catch (error) {
    console.error('Ошибка логирования:', error);
  }
}

// Типы действий
export const ACTION_TYPES = {
  // Авторизация
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Тендеры
  TENDER_ADD: 'tender_add',
  TENDER_EDIT: 'tender_edit',
  TENDER_DELETE: 'tender_delete',
  TENDER_STATUS_CHANGE: 'tender_status_change',
  
  // Документы
  DOCUMENT_ADD: 'document_add',
  DOCUMENT_DELETE: 'document_delete',
  LINK_ADD: 'link_add',
  LINK_DELETE: 'link_delete',
  
  // Пользователи
  USER_ADD: 'user_add',
  USER_EDIT: 'user_edit',
  USER_DELETE: 'user_delete',
  
  // Бухгалтерия
  EXPENSE_ADD: 'expense_add',
  EXPENSE_EDIT: 'expense_edit',
  EXPENSE_DELETE: 'expense_delete',
};
