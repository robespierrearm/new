'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase, Message, MessageInsert, NOTE_COLORS } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, StickyNote, Link as LinkIcon, X, Trash2 } from 'lucide-react';
import { logActivity, ACTION_TYPES } from '@/lib/activityLogger';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('yellow');
  const [linkContent, setLinkContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загрузка сообщений
  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Ошибка загрузки сообщений:', error);
      return;
    }

    setMessages(data || []);
  };

  useEffect(() => {
    loadMessages();

    // Подписка на новые сообщения
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Отправка обычного сообщения
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const messageData: MessageInsert = {
      user_id: currentUser.id,
      username: currentUser.username || 'Аноним',
      message_type: 'message',
      content: newMessage,
    };

    const { error } = await supabase
      .from('messages')
      .insert([messageData]);

    if (error) {
      console.error('Ошибка отправки сообщения:', error);
      return;
    }

    await logActivity('Отправлено сообщение в чат', ACTION_TYPES.LOGIN);
    setNewMessage('');
  };

  // Добавление заметки
  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const noteData: MessageInsert = {
      user_id: currentUser.id,
      username: currentUser.username || 'Аноним',
      message_type: 'note',
      content: noteContent,
      note_color: noteColor,
    };

    const { error } = await supabase
      .from('messages')
      .insert([noteData]);

    if (error) {
      console.error('Ошибка добавления заметки:', error);
      return;
    }

    await logActivity('Добавлена заметка в чат', ACTION_TYPES.LOGIN);
    setNoteContent('');
    setShowNoteDialog(false);
  };

  // Добавление ссылки
  const handleAddLink = async () => {
    if (!linkContent.trim() || !linkUrl.trim()) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const linkData: MessageInsert = {
      user_id: currentUser.id,
      username: currentUser.username || 'Аноним',
      message_type: 'link',
      content: linkContent,
      link_url: linkUrl,
    };

    const { error } = await supabase
      .from('messages')
      .insert([linkData]);

    if (error) {
      console.error('Ошибка добавления ссылки:', error);
      return;
    }

    await logActivity('Добавлена ссылка в чат', ACTION_TYPES.LOGIN);
    setLinkContent('');
    setLinkUrl('');
    setShowLinkDialog(false);
  };

  // Форматирование времени
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Получить цвет заметки
  const getNoteColorClass = (color: string | null) => {
    const noteColor = NOTE_COLORS.find(c => c.value === color);
    return noteColor?.class || 'bg-yellow-100 border-yellow-300';
  };

  // Очистка чата
  const handleClearChat = async () => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .neq('id', 0); // Удаляем все сообщения

    if (error) {
      console.error('Ошибка очистки чата:', error);
      return;
    }

    await logActivity('Очищен чат', ACTION_TYPES.TENDER_DELETE);
    setMessages([]);
    setShowClearDialog(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Общий чат
          </h1>
          <p className="text-sm text-gray-600 mt-1">Обсуждение и заметки для всей команды</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowClearDialog(true)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Очистить чат
        </Button>
      </div>

      {/* Окно сообщений */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {message.message_type === 'message' && (
                <div className="flex flex-col group">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {message.username}
                    </span>
                    <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 max-w-2xl shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              )}

              {message.message_type === 'note' && (
                <div className={`border-l-4 rounded-r-xl p-3 shadow-sm hover:shadow-md transition-shadow ${getNoteColorClass(message.note_color)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <StickyNote className="h-4 w-4" />
                    <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {message.username}
                    </span>
                    <span className="text-xs text-gray-600">{formatTime(message.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              )}

              {message.message_type === 'link' && (
                <div className="flex flex-col group">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {message.username}
                    </span>
                    <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 max-w-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-2">
                        <LinkIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-base text-gray-900 font-semibold">{message.content}</p>
                      </div>
                      <a
                        href={message.link_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Открыть ссылку
                      </a>
                      <p className="text-xs text-gray-600 break-all">{message.link_url}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Поле ввода */}
        <div className="border-t p-4 bg-gradient-to-br from-gray-50 to-blue-50/20">
          <div className="flex gap-2 mb-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNoteDialog(true)}
              className="text-xs bg-white hover:bg-yellow-50 border-yellow-200 text-yellow-700 hover:text-yellow-800"
            >
              <StickyNote className="h-3.5 w-3.5 mr-1" />
              Заметка
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowLinkDialog(true)}
              className="text-xs bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
            >
              <LinkIcon className="h-3.5 w-3.5 mr-1" />
              Ссылка
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Введите сообщение..."
              className="flex-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button 
              onClick={handleSendMessage} 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Диалог добавления заметки */}
      {showNoteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Добавить заметку</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowNoteDialog(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Цвет заметки</label>
                <div className="flex gap-2">
                  {NOTE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNoteColor(color.value)}
                      className={`w-8 h-8 rounded border-2 ${color.class} ${
                        noteColor === color.value ? 'ring-2 ring-blue-500' : ''
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Текст заметки</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Введите текст заметки..."
                  className="w-full p-2 border rounded-md min-h-[100px]"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddNote} className="bg-blue-600 hover:bg-blue-700">
                  Добавить
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Диалог добавления ссылки */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Добавить ссылку</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowLinkDialog(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Описание</label>
                <Input
                  value={linkContent}
                  onChange={(e) => setLinkContent(e.target.value)}
                  placeholder="Название ссылки..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">URL</label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddLink} className="bg-blue-600 hover:bg-blue-700">
                  Добавить
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Диалог подтверждения очистки */}
      {showClearDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Очистить чат?</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowClearDialog(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Все сообщения, заметки и ссылки будут безвозвратно удалены из базы данных. Это действие нельзя отменить.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                Отмена
              </Button>
              <Button 
                onClick={handleClearChat} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
