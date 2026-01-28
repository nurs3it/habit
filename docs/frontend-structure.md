# Frontend Structure (FSD)

## Feature-Sliced Design

Проект следует архитектуре FSD для масштабируемости и поддерживаемости.

## Слои

### app/

Инициализация приложения, провайдеры, роутинг.

- `App.tsx` - Главный компонент с роутингом
- `providers.tsx` - Redux и Router провайдеры
- `store.ts` - Redux store конфигурация
- `index.tsx` - Entry point

### shared/

Переиспользуемые компоненты, утилиты, константы.

- `ui/` - UI компоненты (Button, Card, Input, etc.)
- `lib/` - Утилиты (utils, hooks, uiSlice)
- `api/` - Axios instance и interceptors
- `constants/` - Константы (colors, categories)

### entities/

Бизнес-сущности с моделями и слайсами.

- `user/` - Пользователь, аутентификация
- `habit/` - Привычки, аналитика
- `checkin/` - Выполнения
- `streak/` - Логика стриков (может быть в habit)

### features/

Фичи приложения - отдельные действия.

- `create-habit/` - Создание привычки
- `edit-habit/` - Редактирование
- `check-in/` - Отметка выполнения
- `habit-analytics/` - Аналитика по привычке
- `auth/` - Авторизация

### widgets/

Композиция фич - сложные компоненты и экраны.

- `today-screen/` - Экран "Сегодня"
- `habits-list/` - Список привычек
- `insights-dashboard/` - Дашборд инсайтов
- `settings/` - Настройки
- `bottom-navigation/` - Нижняя навигация

## Redux Store

```
store/
├── user/        # Auth, профиль
├── habits/      # Список привычек
├── checkins/    # История выполнения
├── analytics/   # Аналитика
└── ui/          # UI состояние (theme)
```

## Импорты

Использовать path aliases:

```typescript
import { Button } from '@shared/ui/button'
import { fetchHabits } from '@entities/habit/model/habitsSlice'
import { TodayScreen } from '@widgets/today-screen/ui/TodayScreen'
```
