'use client';

import { useEffect, useState } from 'react';
import { supabase, User, UserInsert, ActivityLog } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  FileText,
  Clock,
  Filter,
  Ban,
  CheckCircle
} from 'lucide-react';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchUser, setSearchUser] = useState('');
  const [filterActionType, setFilterActionType] = useState('all');
  
  const [newUser, setNewUser] = useState<UserInsert>({
    username: '',
    email: '',
    password: '',
  });

  // Загрузка пользователей
  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка загрузки пользователей:', error);
      return;
    }

    setUsers(data || []);
  };

  // Загрузка логов
  const loadLogs = async () => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Ошибка загрузки логов:', error);
      return;
    }

    setLogs(data || []);
  };

  // Обновление статуса онлайн
  const updateOnlineStatus = async () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    await supabase
      .from('users')
      .update({ is_online: false })
      .lt('last_activity', twoMinutesAgo);

    loadUsers();
  };

  useEffect(() => {
    loadUsers();
    loadLogs();

    // Обновление статуса каждые 30 секунд
    const interval = setInterval(() => {
      updateOnlineStatus();
      loadLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Добавление пользователя
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert('Заполните все поля');
      return;
    }

    const { error } = await supabase
      .from('users')
      .insert([newUser]);

    if (error) {
      console.error('Ошибка добавления пользователя:', error);
      alert('Ошибка добавления пользователя');
      return;
    }

    // Добавляем лог
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    await supabase
      .from('activity_logs')
      .insert({
        user_id: currentUser.id,
        username: currentUser.username || 'Система',
        action: `Добавлен новый пользователь: ${newUser.username}`,
        action_type: 'user_add',
        details: { email: newUser.email }
      });

    setNewUser({ username: '', email: '', password: '' });
    setIsAddUserDialogOpen(false);
    loadUsers();
    loadLogs();
  };

  // Редактирование пользователя
  const handleEditUser = async () => {
    if (!editingUser) return;

    const { error } = await supabase
      .from('users')
      .update({
        username: editingUser.username,
        email: editingUser.email,
        password: editingUser.password,
      })
      .eq('id', editingUser.id);

    if (error) {
      console.error('Ошибка редактирования пользователя:', error);
      alert('Ошибка редактирования пользователя');
      return;
    }

    // Добавляем лог
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    await supabase
      .from('activity_logs')
      .insert({
        user_id: currentUser.id,
        username: currentUser.username || 'Система',
        action: `Изменен пользователь: ${editingUser.username}`,
        action_type: 'user_edit',
        details: { email: editingUser.email }
      });

    setEditingUser(null);
    setIsEditUserDialogOpen(false);
    loadUsers();
    loadLogs();
  };

  // Деактивация/активация пользователя
  const handleToggleUserActive = async (user: User) => {
    const newStatus = !user.is_active;
    const action = newStatus ? 'активирован' : 'деактивирован';

    if (!confirm(`${newStatus ? 'Активировать' : 'Деактивировать'} пользователя ${user.username}?`)) return;

    const { error } = await supabase
      .from('users')
      .update({ is_active: newStatus })
      .eq('id', user.id);

    if (error) {
      console.error('Ошибка изменения статуса пользователя:', error);
      alert('Ошибка изменения статуса пользователя');
      return;
    }

    // Добавляем лог
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    await supabase
      .from('activity_logs')
      .insert({
        user_id: currentUser.id,
        username: currentUser.username || 'Система',
        action: `Пользователь ${user.username} ${action}`,
        action_type: newStatus ? 'user_activate' : 'user_deactivate',
        details: { email: user.email, is_active: newStatus }
      });

    loadUsers();
    loadLogs();
  };

  // Удаление пользователя
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Удалить пользователя ${user.username}?`)) return;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (error) {
      console.error('Ошибка удаления пользователя:', error);
      alert('Ошибка удаления пользователя');
      return;
    }

    // Добавляем лог
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    await supabase
      .from('activity_logs')
      .insert({
        user_id: currentUser.id,
        username: currentUser.username || 'Система',
        action: `Удален пользователь: ${user.username}`,
        action_type: 'user_delete',
        details: { email: user.email }
      });

    loadUsers();
    loadLogs();
  };

  // Фильтрация пользователей
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  // Фильтрация логов
  const filteredLogs = logs.filter(log =>
    filterActionType === 'all' || log.action_type === filterActionType
  );

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Админка</h1>
        <p className="text-gray-600 mt-1">Управление пользователями и журнал действий</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Пользователи */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Пользователи</h2>
            </div>
            <Button
              onClick={() => setIsAddUserDialogOpen(true)}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Добавить
            </Button>
          </div>

          {/* Поиск */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по имени или email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Таблица пользователей */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Онлайн</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Активен</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Имя</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Email</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Последняя активность</th>
                  <th className="text-right py-2 px-2 text-sm font-medium text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`border-b hover:bg-gray-50 ${!user.is_active ? 'opacity-50' : ''}`}>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-xs text-gray-600">
                          {user.is_online ? 'Онлайн' : 'Оффлайн'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        {user.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Ban className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-xs ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {user.is_active ? 'Активен' : 'Деактивирован'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-gray-900">{user.username}</td>
                    <td className="py-3 px-2 text-sm text-gray-600">{user.email}</td>
                    <td className="py-3 px-2 text-xs text-gray-500">
                      {formatDate(user.last_activity)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUserActive(user)}
                          className={`h-8 w-8 p-0 ${user.is_active ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
                          title={user.is_active ? 'Деактивировать' : 'Активировать'}
                        >
                          {user.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setIsEditUserDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Журнал действий */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Журнал действий</h2>
            </div>
          </div>

          {/* Фильтр */}
          <div className="mb-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterActionType}
                onChange={(e) => setFilterActionType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Все действия</option>
                <option value="login">Вход</option>
                <option value="logout">Выход</option>
                <option value="tender_add">Добавление тендера</option>
                <option value="tender_edit">Изменение тендера</option>
                <option value="tender_delete">Удаление тендера</option>
                <option value="user_add">Добавление пользователя</option>
                <option value="user_edit">Изменение пользователя</option>
                <option value="user_delete">Удаление пользователя</option>
              </select>
            </div>
          </div>

          {/* Список логов */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Пользователь: <span className="font-medium">{log.username}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    {formatDate(log.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Диалог добавления пользователя */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="Иван Иванов"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="ivan@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddUser} className="bg-indigo-600 hover:bg-indigo-700">
                Добавить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования пользователя */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-username">Имя пользователя</Label>
                <Input
                  id="edit-username"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-password">Пароль</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleEditUser} className="bg-indigo-600 hover:bg-indigo-700">
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
