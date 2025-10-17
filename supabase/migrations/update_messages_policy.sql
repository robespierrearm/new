-- Удаляем старую политику удаления
DROP POLICY IF EXISTS "Пользователи могут удалять свои сообщения" ON messages;

-- Создаем новую политику, разрешающую всем удалять сообщения
CREATE POLICY "Все могут удалять сообщения" ON messages
  FOR DELETE
  USING (true);
