# 🧹 Cleanup Job - Освобождение Reserved Stock

## Что это?

Автоматический процесс который освобождает зарезервированный товар (reserved stock) для заказов, которые не были оплачены в течение **40 минут**.

---

## Зачем это нужно?

### Проблема без Cleanup Job:

```
Клиент → Checkout → Stock резервируется
Клиент → Закрыл страницу Stripe (не оплатил)
Товар → Остается зарезервированным НАВСЕГДА ❌
```

### Решение с Cleanup Job:

```
Клиент → Checkout → Stock резервируется
Клиент → Закрыл страницу (не оплатил)
40 минут → Cleanup Job освобождает reserved ✅
Товар → Снова доступен для покупки ✅
```

---

## 🚀 Как использовать

### Вариант 1: Ручной запуск (для тестирования)

```bash
# Запустить cleanup вручную
curl http://localhost:3001/api/admin/cleanup-reservations

# Или в браузере
http://localhost:3001/api/admin/cleanup-reservations
```

**Когда использовать:** Для тестирования или одноразового запуска.

---

### Вариант 2: Автоматический запуск (РЕКОМЕНДУЕТСЯ)

#### A. Vercel Cron (если деплоите на Vercel)

Создайте файл `vercel.json` в корне проекта:

```json
{
  "crons": [
    {
      "path": "/api/admin/cleanup-reservations",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Что это делает:** Запускает cleanup каждые 5 минут автоматически.

#### B. Linux Cron (если свой сервер)

```bash
# Открыть crontab
crontab -e

# Добавить строку (запуск каждые 5 минут)
*/5 * * * * curl -X GET https://your-domain.com/api/admin/cleanup-reservations > /dev/null 2>&1
```

#### C. GitHub Actions (альтернатива)

Создайте `.github/workflows/cleanup.yml`:

```yaml
name: Cleanup Reservations

on:
  schedule:
    - cron: '*/5 * * * *'  # Каждые 5 минут

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call cleanup endpoint
        run: |
          curl -X GET https://your-domain.com/api/admin/cleanup-reservations
```

---

## 📊 Что делает Cleanup Job?

1. **Находит просроченные заказы:**
   - Статус: `PENDING`
   - PaymentStatus: `PENDING`
   - Созданы более **40 минут назад**

2. **Освобождает reserved stock:**
   ```sql
   UPDATE Product
   SET reserved = reserved - quantity
   WHERE id = productId
   ```

3. **Логирует результат:**
   ```json
   {
     "success": true,
     "stats": {
       "found": 5,
       "processed": 5,
       "totalReservedFreed": 12,
       "duration": 234
     }
   }
   ```

---

## 🔧 Настройки

### Изменить таймаут (по умолчанию 40 минут)

Откройте файл:
```
src/app/api/admin/cleanup-reservations/route.ts
```

Измените строку:
```typescript
// Было: 40 минут
const RESERVATION_TIMEOUT_MS = 40 * 60 * 1000

// Стало: 30 минут
const RESERVATION_TIMEOUT_MS = 30 * 60 * 1000

// Стало: 1 час
const RESERVATION_TIMEOUT_MS = 60 * 60 * 1000
```

### Автоматически отменять заказы

В файле `route.ts` найдите закомментированный код:

```typescript
// Раскомментируйте эти строки:
await tx.order.update({
  where: { id: order.id },
  data: {
    status: 'CANCELLED',
    cancelReason: 'Payment timeout - reservation expired after 40 minutes',
    cancelledAt: new Date()
  }
})
```

---

## 📈 Мониторинг

### Проверить логи

```bash
# Development
npm run dev

# В логах вы увидите:
[Cleanup] Starting reservation cleanup at 2025-11-02T10:00:00.000Z
[Cleanup] Found 3 expired orders
[Cleanup] Freed 2 reserved stock for product "Diamond Ring"
[Cleanup] Completed in 234ms
```

### Проверить статистику через API

```bash
curl http://localhost:3001/api/admin/cleanup-reservations
```

Ответ:
```json
{
  "success": true,
  "message": "Cleanup completed successfully",
  "stats": {
    "found": 3,
    "processed": 3,
    "failed": 0,
    "totalReservedFreed": 7,
    "duration": 234
  }
}
```

---

## ⚠️ Важно!

### Безопасность

Этот endpoint **НЕ защищен авторизацией**.

**Для production добавьте защиту:**

```typescript
// В начале GET функции добавьте:
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  // Проверка авторизации
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ... остальной код
}
```

Или используйте **secret token**:

```typescript
const SECRET_TOKEN = process.env.CLEANUP_JOB_SECRET

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')
  if (token !== `Bearer ${SECRET_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... остальной код
}
```

---

## 🧪 Тестирование

### 1. Создать тестовый заказ

```bash
# В консоли браузера после checkout
localStorage.setItem('test_order_time', Date.now())
```

### 2. Изменить таймаут на 1 минуту (для теста)

```typescript
const RESERVATION_TIMEOUT_MS = 1 * 60 * 1000 // 1 минута
```

### 3. Подождать 1 минуту

### 4. Запустить cleanup

```bash
curl http://localhost:3001/api/admin/cleanup-reservations
```

### 5. Проверить результат

```sql
-- В базе данных
SELECT name, stock, reserved FROM Product;
```

---

## 📞 Поддержка

Если что-то не работает:

1. Проверьте логи сервера
2. Убедитесь что заказ старше 40 минут
3. Проверьте что статус = PENDING
4. Убедитесь что reserved > 0

---

## ✅ Готово!

Cleanup Job настроен и готов к использованию! 🎉

**Рекомендация:** Настройте автоматический запуск через Vercel Cron или Linux crontab.
