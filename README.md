# Интерактивная система комментариев

Современная система комментариев с богатым функционалом, построенная на React, Ant Design и GraphQL. Приложение позволяет создавать и управлять вложенными комментариями с поддержкой прикрепления файлов и HTML-форматирования.

## 🚀 Основные возможности

### Управление комментариями

- Создание новых комментариев и ответов (до 4 уровней вложенности)
- Удаление комментариев
- Поддержка вложенных комментариев (древовидная структура)
- Поддержка HTML-форматирования с разрешенными тегами:
  - `<a href="" title="">` (ссылки)
  - `<code>` (код)
  - `<i>` (курсив)
  - `<strong>` (жирный текст)

### Работа с файлами

- Поддержка различных типов файлов:
  - Изображения (JPG, PNG, GIF) - отображаются в комментарии
  - Текстовые файлы (TXT)
- Ограничения по размеру:
  - Изображения: максимум 320x240px
  - Текстовые файлы: максимум 100КБ

### Поиск и сортировка

- Полнотекстовый поиск по комментариям
- Сортировка комментариев по:
  - Дате
  - Никнейму
  - Email
- Направление сортировки:
  - По возрастанию
  - По убыванию

### Интерфейс

- Современный интерфейс на основе Ant Design
- Постраничная навигация (25 комментариев на страницу)
- Визуальная иерархия вложенных комментариев
- Автоматическая генерация аватаров для комментариев
- Предпросмотр загружаемых файлов
- Адаптивный дизайн

### Безопасность

- Интеграция с reCAPTCHA для защиты от спама
- Санитизация HTML-контента в комментариях
- Валидация вводимых данных
- Проверка типов и размеров файлов

## 🛠️ Технический стек

- **Frontend:** React
- **UI библиотека:** Ant Design (antd)
- **Работа с API:** Apollo Client, Axios
- **Формы:** Ant Design Forms
- **Загрузка файлов:** Ant Design Upload
- **Защита:** reCAPTCHA
- **Сборка:** Vite

## 🔧 Настройка окружения

Если надо можете добавить свои переменные окружения в файл `.env` в корневой директории.

```
VITE_CAPTCHA_SECRET=6LdckQIkAAAAAIti_aaT_fPhD3knm7R3qyfeysc8
VITE_BACKEND_URL=http://localhost:3010
```

## 📦 Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск сервера разработки
npm run dev
```

```bash
# Сборка для продакшена
npm run build

# Предпросмотр продакшен-сборки
npm run preview
```

## Требования

- Node.js
- npm или yarn
- Backend сервер с поддержкой GraphQL
- API ключи reCAPTCHA

## API Интеграция

Приложение работает с GraphQL бэкендом и использует следующие мутации и запросы:

- createComment (создание комментария)
- deleteComment (удаление комментария)
- getComments (получение списка комментариев)
- searchComments (поиск по комментариям)

## Особенности реализации

- Древовидная структура комментариев с поддержкой до 4 уровней вложенности
- Автоматическая генерация уникальных аватаров для каждого комментария
- Встроенный просмотр изображений и предпросмотр текстовых файлов
- Защита от XSS-атак через санитизацию HTML
- Валидация всех пользовательских данных на клиенте
