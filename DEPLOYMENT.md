# 🚀 Инструкция по деплою Hostes на VPS

## 📋 Что потребуется

- VPS сервер (Ubuntu 22.04) - минимум 1GB RAM, 1 CPU, 20GB SSD
- SSH доступ к серверу
- Git установленный локально

## 🎯 Архитектура

```
ВАШ СЕРВЕР
│
├── Nginx (порт 80) - веб-сервер
│   ├── / → React приложение (статика из /var/www/hostes/frontend/dist)
│   └── /api → проксирует на backend localhost:3001
│
├── Node.js Backend (порт 3001) - управляется PM2
│   └── Express API (/var/www/hostes/backend)
│
└── PostgreSQL (порт 5432)
    └── База данных: hostes
```

---

## 📝 ШАГ 1: Подготовка проекта (на вашем компьютере)

### 1.1 Загрузить код на GitHub

```bash
# Если ещё не инициализирован Git
git init
git add .
git commit -m "Ready for deployment"

# Создайте репозиторий на GitHub и подключите
git remote add origin https://github.com/ВАШ_USERNAME/hostes.git
git branch -M main
git push -u origin main
```

### 1.2 Проверить .gitignore

Убедитесь, что файл `.gitignore` содержит:
```
node_modules/
dist/
.env
.env.local
*.log
```

---

## 🖥 ШАГ 2: Настройка VPS сервера

### 2.1 Подключение к серверу

```bash
# Подключиться по SSH
ssh root@ВАШ_IP_АДРЕС
# Введите пароль, который вам выдал провайдер
```

### 2.2 Обновление системы

```bash
# Обновить пакеты
apt update && apt upgrade -y
```

### 2.3 Установка Node.js 20

```bash
# Установить Node.js через NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Проверить версии
node --version  # должно быть v20.x.x
npm --version
```

### 2.4 Установка PostgreSQL

```bash
# Установить PostgreSQL
apt install -y postgresql postgresql-contrib

# Проверить статус
systemctl status postgresql

# Если не запущена, запустить
systemctl start postgresql
systemctl enable postgresql
```

### 2.5 Установка Nginx

```bash
# Установить Nginx
apt install -y nginx

# Запустить и добавить в автозагрузку
systemctl start nginx
systemctl enable nginx

# Проверить статус
systemctl status nginx
```

### 2.6 Установка PM2 (менеджер процессов для Node.js)

```bash
# Установить PM2 глобально
npm install -g pm2
```

### 2.7 Установка Git

```bash
# Установить Git
apt install -y git
```

---

## 🗄 ШАГ 3: Настройка PostgreSQL

### 3.1 Создать базу данных и пользователя

```bash
# Войти в PostgreSQL под пользователем postgres
sudo -u postgres psql

# В консоли PostgreSQL выполнить:
CREATE DATABASE hostes;
CREATE USER hostes_user WITH ENCRYPTED PASSWORD 'ваш_сложный_пароль';
GRANT ALL PRIVILEGES ON DATABASE hostes TO hostes_user;
\q

# Выйти из PostgreSQL (Ctrl+D или \q)
```

### 3.2 Разрешить подключение с localhost

```bash
# Отредактировать pg_hba.conf
nano /etc/postgresql/*/main/pg_hba.conf

# Найти строку:
# local   all             all                                     peer
# Заменить на:
# local   all             all                                     md5

# Сохранить (Ctrl+O, Enter, Ctrl+X)

# Перезапустить PostgreSQL
systemctl restart postgresql
```

---

## 📂 ШАГ 4: Загрузка кода на сервер

### 4.1 Создать директорию для проекта

```bash
# Создать директорию
mkdir -p /var/www/hostes
cd /var/www/hostes

# Клонировать репозиторий из GitHub
git clone https://github.com/ВАШ_USERNAME/hostes.git .
```

### 4.2 Установить зависимости

```bash
# Установить зависимости для всего монорепозитория
npm install

# Установить зависимости для backend
cd /var/www/hostes/apps/backend
npm install

# Установить зависимости для frontend
cd /var/www/hostes/apps/frontend
npm install
```

---

## ⚙️ ШАГ 5: Настройка переменных окружения

### 5.1 Backend .env

```bash
# Создать .env для backend
nano /var/www/hostes/apps/backend/.env
```

Добавить:
```env
DATABASE_URL="postgresql://hostes_user:ваш_сложный_пароль@localhost:5432/hostes?schema=public"
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://ВАШ_IP_АДРЕС
```

Сохранить: `Ctrl+O`, `Enter`, `Ctrl+X`

### 5.2 Frontend .env

```bash
# Создать .env для frontend
nano /var/www/hostes/apps/frontend/.env
```

Добавить:
```env
VITE_API_URL=http://ВАШ_IP_АДРЕС/api
```

Сохранить: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🏗 ШАГ 6: Сборка проекта

### 6.1 Собрать shared пакет

```bash
cd /var/www/hostes/packages/shared
npm run build
```

### 6.2 Применить миграции БД

```bash
cd /var/www/hostes/apps/backend
npx prisma migrate deploy
npx prisma generate
```

### 6.3 Заполнить БД тестовыми данными (опционально)

```bash
cd /var/www/hostes/apps/backend
npm run db:seed
```

### 6.4 Собрать backend

```bash
cd /var/www/hostes/apps/backend
npm run build
```

### 6.5 Собрать frontend

```bash
cd /var/www/hostes/apps/frontend
npm run build
```

---

## 🚀 ШАГ 7: Запуск backend с PM2

```bash
# Запустить backend через PM2
cd /var/www/hostes/apps/backend
pm2 start dist/index.js --name hostes-backend

# Настроить автозапуск при перезагрузке сервера
pm2 startup systemd
pm2 save

# Проверить статус
pm2 status
pm2 logs hostes-backend
```

---

## 🌐 ШАГ 8: Настройка Nginx

### 8.1 Создать конфигурацию Nginx

```bash
nano /etc/nginx/sites-available/hostes
```

Добавить:
```nginx
server {
    listen 80;
    server_name ВАШ_IP_АДРЕС;

    # Frontend - статические файлы
    location / {
        root /var/www/hostes/apps/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API - проксирование
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Сохранить: `Ctrl+O`, `Enter`, `Ctrl+X`

### 8.2 Активировать конфигурацию

```bash
# Создать символическую ссылку
ln -s /etc/nginx/sites-available/hostes /etc/nginx/sites-enabled/

# Удалить дефолтную конфигурацию
rm /etc/nginx/sites-enabled/default

# Проверить конфигурацию
nginx -t

# Перезапустить Nginx
systemctl restart nginx
```

---

## 🔥 ШАГ 9: Настройка Firewall

```bash
# Разрешить HTTP, HTTPS, SSH
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS (для будущего SSL)

# Включить firewall
ufw enable

# Проверить статус
ufw status
```

---

## ✅ ШАГ 10: Проверка работы

Откройте браузер и зайдите на:
```
http://ВАШ_IP_АДРЕС
```

Вы должны увидеть ваше React приложение!

Проверьте API:
```
http://ВАШ_IP_АДРЕС/api/health
```

---

## 🔄 Обновление приложения

Когда нужно обновить код:

```bash
# Подключиться к серверу
ssh root@ВАШ_IP_АДРЕС

# Перейти в директорию проекта
cd /var/www/hostes

# Получить последние изменения
git pull origin main

# Установить зависимости (если были изменения)
npm install

# Применить миграции (если были изменения в БД)
cd apps/backend
npx prisma migrate deploy

# Пересобрать backend
npm run build

# Пересобрать frontend
cd ../frontend
npm run build

# Перезапустить backend
pm2 restart hostes-backend

# Перезагрузить Nginx
systemctl reload nginx
```

---

## 🛠 Полезные команды

### PM2
```bash
pm2 status              # Статус всех процессов
pm2 logs hostes-backend # Логи backend
pm2 restart hostes-backend # Перезапустить backend
pm2 stop hostes-backend    # Остановить backend
pm2 monit                  # Мониторинг
```

### Nginx
```bash
systemctl status nginx   # Статус
systemctl restart nginx  # Перезапустить
systemctl reload nginx   # Перезагрузить конфиг
nginx -t                 # Проверить конфигурацию
tail -f /var/log/nginx/error.log  # Логи ошибок
```

### PostgreSQL
```bash
sudo -u postgres psql    # Подключиться к БД
systemctl status postgresql
systemctl restart postgresql
```

---

## 🔒 ШАГ 11: SSL сертификат (после подключения домена)

После того как купите домен и привяжете его к серверу:

```bash
# Установить Certbot
apt install -y certbot python3-certbot-nginx

# Получить SSL сертификат
certbot --nginx -d ваш-домен.ru

# Certbot автоматически настроит Nginx и перенаправление на HTTPS
```

---

## 💰 Примерные цены на VPS

- **Timeweb**: от 169₽/мес (1GB RAM)
- **Hetzner**: от €4.5/мес (~450₽)
- **DigitalOcean**: от $6/мес (~550₽)

---

## 📞 Поддержка

Если что-то пошло не так, проверьте:
1. Логи PM2: `pm2 logs hostes-backend`
2. Логи Nginx: `tail -f /var/log/nginx/error.log`
3. Статус сервисов: `systemctl status nginx postgresql`
