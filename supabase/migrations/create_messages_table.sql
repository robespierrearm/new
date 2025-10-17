-- Создание таблицы для сообщений чата
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('message', 'note', 'link')),
  content TEXT NOT NULL,
  link_url TEXT,
  note_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_type ON messages(message_type);

-- Включаем Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Политика: все авторизованные пользователи могут читать сообщения
CREATE POLICY "Все могут читать сообщения" ON messages
  FOR SELECT
  USING (true);

-- Политика: все авторизованные пользователи могут создавать сообщения
CREATE POLICY "Все могут создавать сообщения" ON messages
  FOR INSERT
  WITH CHECK (true);

-- Политика: все авторизованные пользователи могут удалять сообщения (для очистки чата)
CREATE POLICY "Все могут удалять сообщения" ON messages
  FOR DELETE
  USING (true);
