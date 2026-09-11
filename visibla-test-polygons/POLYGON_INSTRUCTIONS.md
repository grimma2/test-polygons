# Инструкция полигона Visibla

Полигон для проверки трекинг-кодов Verify из ЛК и отдельно — Scan SDK. Сейчас хостинг — статический сайт по **HTTP и IP** VPS (см. [DEPLOY.md](DEPLOY.md)). Когда появится домен `.ru`, лучше HTTPS. Коды Verify вставляются только в `tracking-codes.js`.

Открывайте `http://IP/`, не `file://`. Не открывайте DevTools на прогоне: fingerprint глушит JS-события.

## Verify (рекламные коды)

1. В ЛК — отдельный тестовый проект. Источник DSP: **Buzzoola**.
2. Сгенерируйте коды нужных форматов и вставьте в слоты `tracking-codes.js`. Поставьте `status: 'ready'`.
3. Закоммитьте `tracking-codes.js` и на VPS сделайте `git pull` (см. [DEPLOY.md](DEPLOY.md)). Контейнер не перезапускайте.
4. Макросы Buzzoola (`[CLICK_URL]`, `[RANDOM]`, `[CACHEBUSTER]`) на странице подставляются сами. Сырой текст сниппета виден в блоке на странице.
5. Клик должен вести на тот же URL, что `target_url` креатива в ЛК.
6. Приёмка: в отчёте ЛК данные полные и правдоподобные. Нет хита или скрипт не видит слот — SDK или тег.

### HTML5

1. Соберите ZIP из папки `html5-banner/creative/` (в корне один `index.html`, без `__MACOSX` / `.DS_Store`).
2. Загрузите ZIP в ЛК как HTML5-креатив.
3. Вставьте выданный iframe-код в `html5_display.iframe`. Полигон не меняет `src`.

### Видео

Вставьте XML с вкладок VAST и VPAID (это разные документы). Поле Tag URL пока пустое: публичный `GET /api/vast/{id}.xml` недоступен. Плеер — Kinescope, старт без звука. Рекламный ролик берётся из XML (S3). Контент после преролла — ролик Kinescope.

Страница ошибки VAST подменяет MediaFile только локально, слот в `tracking-codes.js` не портится. Ожидание в ЛК: `event=error`.

## Scan SDK

На страницах `scan-sdk/` сниппет уже стоит: `visibla('init', '12413')` и `https://storage.yandexcloud.net/visibla-scan/visibla.min.js`. Прогоняйте с разных браузеров и ботов. Payload смотрите на бэке Scan, не в DevTools.
