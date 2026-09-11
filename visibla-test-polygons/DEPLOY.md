# Деплой полигона на VPS (HTTP по IP)

Статический сайт в одном контейнере nginx. Сборка не нужна. Открывать `http://IP/`, не `file://`.

Scan SDK и fingerprint рассчитаны на HTTPS и свой домен. По IP+HTTP баннеры Verify (`vb.js` с S3) обычно работают; сигналы Scan могут быть неполными. Certbot — когда появится домен `.ru`.

Сайт лежит в git. На сервер он попадает через `git clone` / `git pull`.

## Первый запуск (Ubuntu)

1. Залейте репозиторий на GitHub / GitLab (лучше приватный: в `tracking-codes.js` будут теги из ЛК).
2. На VPS — только Docker и git. Хостовый nginx не ставить (если уже стоит — `sudo systemctl disable --now nginx`).

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo apt install -y git
sudo ufw allow 80/tcp
```

В облачной панели VPS тоже откройте входящий TCP 80.

```bash
sudo git clone git@github.com:ORG/visibla-test-polygons.git /opt/visibla-polygon
cd /opt/visibla-polygon
sudo docker compose up -d
```

Подставьте свой URL репозитория. Если клон по SSH не проходит — HTTPS-URL и токен.

Проверка в браузере:

- `http://IP/`
- `http://IP/display-image/article.html`
- `http://IP/scan-sdk/article.html`

F5 на выдуманном path вроде `http://IP/scan-sdk/lenta` даст 404: так устроен тест SPA History API.

## Обновить сайт или коды

Локально закоммитьте и запушьте изменения (страницы или `tracking-codes.js`). На VPS:

```bash
cd /opt/visibla-polygon
sudo git pull
```

Контейнер не перезапускайте: файлы смонтированы с диска. `tracking-codes.js` и HTML отдаются с `Cache-Control: no-store`.
