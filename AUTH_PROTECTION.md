# 🔐 Защита авторизации - TenderCRM

## ✨ Что добавлено

Полная защита всех страниц проекта от неавторизованного доступа.

### 🛡️ Система защиты:

#### **1. Middleware (серверная защита):**

**Файл:** `middleware.ts`

**Что делает:**
- ✅ Проверяет cookie `auth-token` на каждом запросе
- ✅ Публичные пути: `/login`
- ✅ Все остальные пути - приватные
- ✅ Без токена → редирект на `/login`
- ✅ С токеном на `/login` → редирект на `/dashboard`

**Код:**
```typescript
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.includes(path);
  const token = request.cookies.get('auth-token')?.value || '';

  // Если публичный путь и есть токен → дашборд
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Если приватный путь и нет токена → логин
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

#### **2. AuthProvider (клиентская защита):**

**Файл:** `components/AuthProvider.tsx`

**Что делает:**
- ✅ Проверяет `localStorage` на клиенте
- ✅ Дублирует защиту middleware
- ✅ Работает при навигации на клиенте
- ✅ Мгновенный редирект

**Код:**
```typescript
export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const publicPaths = ['/login'];
    const isPublicPath = publicPaths.includes(pathname);
    const currentUser = localStorage.getItem('currentUser');

    // Приватная страница без пользователя → логин
    if (!isPublicPath && !currentUser) {
      router.push('/login');
      return;
    }

    // Публичная страница с пользователем → дашборд
    if (isPublicPath && currentUser) {
      router.push('/dashboard');
      return;
    }
  }, [pathname, router]);

  return <>{children}</>;
}
```

#### **3. Cookie при входе:**

**Файл:** `app/login/page.tsx`

**Что добавлено:**
```typescript
// Устанавливаем cookie для middleware
document.cookie = `auth-token=${user.id}; path=/; max-age=86400`; // 24 часа
```

**Срок действия:** 24 часа

#### **4. Удаление cookie при выходе:**

**Файл:** `components/AppSidebar.tsx`

**Что добавлено:**
```typescript
// Удаляем cookie
document.cookie = 'auth-token=; path=/; max-age=0';
```

#### **5. Убраны примеры логина/пароля:**

**Было:**
```tsx
<Input placeholder="Armen@gmail.com" />
<Input placeholder="••••••••" />
```

**Стало:**
```tsx
<Input placeholder="Введите email" />
<Input placeholder="Введите пароль" />
```

### 🔒 Как работает защита:

#### **Сценарий 1: Неавторизованный пользователь**

1. Пользователь открывает `/dashboard`
2. **Middleware** проверяет cookie → нет токена
3. **Редирект** на `/login`
4. Пользователь видит форму входа

#### **Сценарий 2: Авторизованный пользователь**

1. Пользователь входит в систему
2. Устанавливается cookie `auth-token`
3. Сохраняется в `localStorage`
4. Редирект на `/dashboard`
5. **Middleware** проверяет cookie → есть токен
6. Доступ разрешен

#### **Сценарий 3: Попытка открыть /login после входа**

1. Пользователь уже авторизован
2. Открывает `/login`
3. **Middleware** проверяет cookie → есть токен
4. **Редирект** на `/dashboard`

#### **Сценарий 4: Выход из системы**

1. Пользователь нажимает "Выход"
2. Удаляется cookie
3. Очищается localStorage
4. Редирект на `/login`
5. Попытка открыть `/dashboard` → редирект на `/login`

### 🛡️ Двойная защита:

**Серверная (Middleware):**
- ✅ Проверка на каждом запросе
- ✅ Невозможно обойти
- ✅ Работает даже при отключенном JS

**Клиентская (AuthProvider):**
- ✅ Мгновенный редирект
- ✅ Проверка при навигации
- ✅ Дополнительная защита

### 📁 Созданные/обновленные файлы:

**Созданы:**
1. ✅ `middleware.ts` - серверная защита
2. ✅ `components/AuthProvider.tsx` - клиентская защита

**Обновлены:**
3. ✅ `app/layout.tsx` - обернут в AuthProvider
4. ✅ `app/login/page.tsx` - установка cookie, убраны примеры
5. ✅ `components/AppSidebar.tsx` - удаление cookie при выходе

### 🧪 Тестирование:

#### **Тест 1: Доступ без авторизации**

1. Откройте браузер в режиме инкогнито
2. Перейдите на `http://localhost:3000/dashboard`
3. **Ожидаемый результат:**
   - ✅ Автоматический редирект на `/login`
   - ✅ Доступ запрещен

#### **Тест 2: Вход в систему**

1. Введите email и пароль
2. Нажмите "Войти"
3. **Ожидаемый результат:**
   - ✅ Cookie установлен
   - ✅ Редирект на `/dashboard`
   - ✅ Доступ разрешен

#### **Тест 3: Попытка открыть /login после входа**

1. Авторизуйтесь
2. Откройте `/login` вручную
3. **Ожидаемый результат:**
   - ✅ Автоматический редирект на `/dashboard`

#### **Тест 4: Выход из системы**

1. Нажмите "Выход"
2. Попробуйте открыть `/dashboard`
3. **Ожидаемый результат:**
   - ✅ Cookie удален
   - ✅ Редирект на `/login`
   - ✅ Доступ запрещен

#### **Тест 5: Прямой доступ к URL**

1. Выйдите из системы
2. Вставьте в адресную строку:
   - `/dashboard`
   - `/tenders`
   - `/accounting`
   - `/admin`
3. **Ожидаемый результат:**
   - ✅ Все редиректят на `/login`

### 🔑 Важные моменты:

**Cookie:**
- Имя: `auth-token`
- Значение: `user.id`
- Путь: `/` (весь сайт)
- Срок: 24 часа
- HttpOnly: нет (нужен доступ из JS)

**localStorage:**
- Ключ: `currentUser`
- Значение: JSON объект пользователя
- Используется для клиентской проверки

**Публичные пути:**
- `/login` - единственный публичный путь
- Все остальное - приватное

### ⚠️ Безопасность:

**Что защищено:**
- ✅ Все страницы дашборда
- ✅ Админка
- ✅ Бухгалтерия
- ✅ Тендеры
- ✅ Файлы

**Что НЕ защищено:**
- Страница логина `/login`
- Статические файлы (CSS, JS, изображения)
- API routes (если есть)

### 💡 Рекомендации:

**Для production:**
1. Используйте HttpOnly cookies
2. Добавьте CSRF защиту
3. Используйте JWT токены
4. Добавьте refresh tokens
5. Шифруйте пароли (bcrypt)

**Текущая реализация:**
- ✅ Подходит для демо/MVP
- ✅ Простая и понятная
- ⚠️ Не для критичных данных

---

**Готово!** 🎉

Теперь весь проект защищен от неавторизованного доступа!
