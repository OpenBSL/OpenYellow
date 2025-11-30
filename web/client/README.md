# OpenYellow Client

Frontend для OpenYellow, работающий с API сервером.

## Конфигурация

### Продакшен

По умолчанию `config.js` настроен на продакшен API:
```javascript
apiBaseURL: 'https://openyellow.openintegrations.dev/api'
```

### Локальная разработка

Для локальной разработки с локальным API сервером:

1. Запустите API сервер (см. `../server/README.md`)
2. Измените в `js/config.js`:
```javascript
apiBaseURL: 'http://localhost:3000/api'
```

Или используйте готовый файл:
```bash
cp js/config.local.js js/config.js
```

### Режим JSON файлов (без API)

Если нужно работать со статичными JSON файлами:
```javascript
useAPI: false,
jsonBaseURL: '/data'
```

## Запуск

### Локальный сервер
```bash
node server.js
```

Откройте http://localhost:8000

### Продакшен

Просто разместите содержимое папки `client` на веб-сервере.

## Структура

```
client/
├── css/
│   └── main.css           # Стили
├── js/
│   ├── config.js          # Конфигурация (продакшен)
│   ├── config.local.js    # Конфигурация (локальная разработка)
│   ├── main.js            # DataService и общая логика
│   ├── grid.js            # Логика страницы репозиториев
│   ├── authors.js         # Логика страницы авторов
│   └── footer.js          # Компонент футера
├── static/                # Статичные файлы (картинки, иконки)
├── index.html             # Главная страница
├── grid.html              # Страница репозиториев
├── authors.html           # Страница авторов
├── badges.html            # Страница значков
└── server.js              # Простой HTTP сервер для разработки
```

## API Integration

Клиент работает с следующими эндпоинтами:

- `GET /api/repos?filter=top&page=1&pageSize=50&search=query` - Репозитории
- `GET /api/repos/stats` - Статистика
- `GET /api/authors?pageSize=100` - Авторы

DataService автоматически трансформирует ответы API в формат, ожидаемый клиентом.

## Переключение между API и JSON

В `config.js` измените `useAPI`:
- `true` - использовать API сервер
- `false` - использовать статичные JSON файлы

## CORS

Для локальной разработки убедитесь что API сервер настроен с CORS:
```javascript
app.use(cors());
```
