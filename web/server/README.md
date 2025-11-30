# OpenYellow API Server

Backend API для OpenYellow, работающий с MySQL базой данных.

## Установка

```bash
npm install
```

## Настройка

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Заполните переменные окружения в `.env`:
```
PORT=3000
DB_HOST=your_host
DB_USER=openintegr_site
DB_PASSWORD=your_password
DB_NAME=openintegr_openyellow
```

## Запуск

Продакшн:
```bash
npm start
```

Разработка (с автоперезагрузкой):
```bash
npm run dev
```

## API Endpoints

### Repositories

**GET /api/repos**
Получить список репозиториев с фильтрацией и пагинацией

Query параметры:
- `filter` - тип фильтра: `top` (по умолчанию), `new`, `updated`
- `page` - номер страницы (по умолчанию: 1)
- `pageSize` - размер страницы (по умолчанию: 50, макс: 100)
- `search` - поисковый запрос
- `lang` - фильтр по языку программирования
- `license` - фильтр по лицензии
- `author` - фильтр по автору (частичное совпадение)

Пример:
```
GET /api/repos?filter=top&page=1&pageSize=50&search=test&lang=1C&license=MIT
```

**GET /api/repos/filters**
Получить доступные опции для фильтров (уникальные языки и лицензии)

**GET /api/repos/stats**
Получить общую статистику

**GET /api/repos/:id**
Получить репозиторий по ID

### Authors

**GET /api/authors**
Получить список авторов (отсортированы по звездам)

Query параметры:
- `page` - номер страницы (по умолчанию: 1)
- `pageSize` - размер страницы (по умолчанию: 100, макс: 200)
- `search` - поисковый запрос

**GET /api/authors/:name**
Получить автора по имени

### News

**GET /api/news**
Получить список новостей с пагинацией

Query параметры:
- `page` - номер страницы (по умолчанию: 1)
- `pageSize` - размер страницы (по умолчанию: 10, макс: 50)

**GET /api/news/:id**
Получить новость по ID

### Badges

**GET /data/badges/:id.svg** ⭐ Рекомендуется
Получить готовый SVG badge (прямая генерация)

Параметры:
- `:id` - ID репозитория

Возвращает готовый SVG badge с актуальным местом в рейтинге.

Пример использования в README:
```markdown
[![OpenYellow](https://openyellow.openintegrations.dev/data/badges/257929475.svg)](https://openyellow.openintegrations.dev/grid?filter=top&repo=257929475)
```

**GET /data/badges/:group/:id.json** (для обратной совместимости)
Получить badge JSON для shields.io

Параметры:
- `:group` - группа (для совместимости, обычно 2)
- `:id` - ID репозитория

Возвращает JSON в формате shields.io endpoint.

Пример (старый формат):
```markdown
[![OpenYellow](https://img.shields.io/endpoint?url=https://openyellow.openintegrations.dev/data/badges/2/257929475.json)](https://openyellow.openintegrations.dev/grid?filter=top&repo=257929475)
```

## Структура БД

### Таблица `authors`
- `name` (varchar, PRIMARY KEY) - имя автора
- `url` (varchar) - URL профиля
- `pic` (varchar) - URL аватара
- `repos` (smallint) - количество репозиториев
- `stars` (mediumint) - общее количество звезд

### Таблица `repos`
- `id` (int, PRIMARY KEY) - ID репозитория
- `name` (varchar) - название
- `description` (text) - описание
- `author` (varchar, FOREIGN KEY) - автор
- `authorUrl` (varchar) - URL автора
- `url` (varchar) - URL репозитория
- `pic` (varchar) - URL аватара
- `stars` (mediumint) - количество звезд
- `forks` (smallint) - количество форков
- `lang` (varchar) - язык программирования
- `license` (varchar) - лицензия
- `size` (int) - размер
- `createddate` (date) - дата создания
- `updateddate` (date) - дата обновления

## Деплой

Сервер будет доступен по адресу: `https://openyellow.openintegrations.dev/`
