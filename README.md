<<<<<<< HEAD
# dplm
=======
# Дипломный интернет-магазин

Frontend: React + Vite. Backend: Node.js + Express. Database: MongoDB Atlas. Для демонстрационного запуска предусмотрены Docker-контейнеры frontend и backend; база данных остаётся во внешнем MongoDB Atlas.

## 1. Подготовка MongoDB Atlas

1. В MongoDB Atlas создайте базу данных и пользователя базы данных.
2. В разделе Network Access разрешите подключение с IP-адреса машины/сервера, на котором запускается приложение. Для публичного хостинга настройте доступ для IP хостинга или его документированного диапазона, если он предоставляется.
3. Скопируйте `.env.example` в `.env` и укажите настоящую строку `MONGODB_URI`. Не публикуйте `.env` и не отправляйте его в общий репозиторий.

## 2. Запуск через Docker Desktop (рекомендуется для демонстрации)

Нужны Docker Desktop с работающим Docker Engine и доступ к MongoDB Atlas.

В PowerShell из корня проекта выполните:

```powershell
Copy-Item .env.example .env
notepad .env
```

В файле `.env` замените значение `MONGODB_URI` на строку подключения из Atlas, сохраните файл, затем выполните:

```powershell
docker compose up --build -d
```

Откройте магазин: <http://localhost:8080>

Проверка backend: <http://localhost:3000/health>. При успешном подключении ответ содержит `"status":"ok"` и `"database":"connected"`.

Посмотреть журналы:

```powershell
docker compose logs -f backend
```

Остановить приложение:

```powershell
docker compose down
```

Данные в MongoDB Atlas при остановке контейнеров не удаляются.

## 3. Локальный запуск без Docker

Нужен Node.js 22 или совместимая актуальная версия.

```powershell
npm ci
```

Создайте `backend/.env` и добавьте:

```dotenv
MONGODB_URI=ваша_строка_подключения_Atlas
PORT=3000
CORS_ORIGIN=http://localhost:5173,http://localhost:4173
```

В первом терминале запустите API:

```powershell
npm run start:server
```

Во втором терминале запустите frontend:

```powershell
npm run dev
```

Откройте адрес, который покажет Vite, обычно <http://localhost:5173>. Запросы `/api` в режиме разработки перенаправляются Vite на backend.

Сборка frontend для проверки:

```powershell
npm run build
```

## 4. Middleware в backend

В `backend/server.js` используются middleware для:

- CORS с перечнем разрешённых источников;
- базовых HTTP-заголовков безопасности;
- журнала запросов без записи паролей и тел запросов;
- разбора JSON с лимитом 1 МБ;
- проверки данных товаров и позиций заказов до обращения к базе;
- JSON-ответа для неизвестных маршрутов;
- централизованной обработки ошибок, включая ошибки валидации MongoDB и дублирующиеся товары.

Итоговая стоимость заказа пересчитывается backend по позициям, а не принимается на доверии из браузера.

## 5. Важное ограничение безопасности текущей версии

В исходном frontend регистрация и вход хранят профили и пароли в `localStorage`. Это демонстрационная клиентская логика, а не серверная аутентификация. Административные API-маршруты также пока не защищены серверной проверкой роли. Поэтому **не публикуйте эту версию как настоящий магазин с персональными данными или реальными заказами**. Перед полноценным публичным запуском необходимо перенести регистрацию/вход на backend (хеширование паролей, сессия или JWT) и закрыть административные маршруты middleware авторизации и ролей. Секретный API-ключ нельзя встраивать во frontend: его увидит посетитель сайта.

## 6. Основные API-маршруты

- `GET /api/products` — список товаров.
- `GET /api/products/:type/:id` — карточка товара.
- `POST /api/products` — добавление товара.
- `PUT /api/products/:type/:id` — изменение товара.
- `DELETE /api/products/:type/:id` — удаление товара.
- `POST /api/orders` — создание заказа.
- `GET /api/orders` — список заказов.
- `GET /api/orders/:id` — заказ по ID.
- `PUT /api/orders/:id` — изменение позиций заказа.
- `DELETE /api/orders/:orderId/items/:itemIndex` — удаление позиции.
- `DELETE /api/orders/:id` — удаление заказа.
- `GET /health` — проверка доступности API и соединения с MongoDB.
## Изображения товаров

Изображения находятся в `public/images/vegetables` и `public/images/drinks`. Приложение преобразует сохранённые в MongoDB старые пути `/src/assets/...` в стабильные URL `/images/...`, поэтому картинки доступны после production-сборки Vite и в Docker.
>>>>>>> f8cfaf9 (Initial commit: diplom project with auth, admin protection, docker)
