# Handbook: страницы полигона под трекинг-коды Кампаний

Инструкция для агента **внутри проекта полигона**. Задача — проверить или поправить HTML-страницы, которые хостят коды из раздела Кампании. Генератор Visibla, backend и `vb.js` не трогать.

Строки URL и HTML — из эталона выдачи. Если этот файл лежит рядом с репозиторием Visibla, канон сниппетов: [`TRACKING_CODES_OUTPUT_BY_FORMAT.md`](TRACKING_CODES_OUTPUT_BY_FORMAT.md) (блоки **«Надо»**). Сборщик мока: `UI Visibla v0/components/campaigns/tracking-tags.ts`. Если handbook скопирован в другой репозиторий без этих файлов — опирайся на примеры ниже; они совпадают с эталоном.

Прод-ответ `POST /api/creative/create` (`tag_code`, `visibla-tag.min.js`, `data-company`, VAST с `account`/`company`) **не эталон**. Такие сниппеты на полигоне не воспроизводить и не «чинить под прод».

Вне скоупа: OMID / `clickUrl` в VAST Tag URL (фаза 2); счётчик сайта из Настроек проекта (`visibla('init', …)`).

---

## 1. Роль агента

1. Для каждого формата ниже есть одна или несколько страниц. Страница должна **вставить код как из кабинета**, а не изобрести свой пиксель.
2. Имена query-ключей, `data-*` и JSON-полей не менять. Можно подставить свои **числовые** ID вместо фикстуры.
3. Не добавлять `company`, `data-endpoint`, `"endpoint"`, `"coreUrl"`, `account`, `bundle` в Verify-URL.
4. Не использовать `visibla-tag.min.js`, `visibla-vpaid.min.js`, `visibla-core.min.js`.
5. SDK один: `https://storage.yandexcloud.net/visibla/vb.js`. Коллектор Verify зашит в скрипт — в тег его не писать.

---

## 2. Фикстуры

Все примеры собраны на одних данных. Источник DSP по умолчанию — Яндекс.

| Сущность | Значение | Куда попадает |
| :--- | :--- | :--- |
| Проект | `1` | Verify query `project`; CTV путь; `data-project-id`; VPAID `"project"` |
| Кампания | `105` | `campaign` / `data-campaign-id` |
| Источник | `24` | `source` / `data-source-id` |
| Креатив | `512` | `creative` / `data-creative-id`; сегмент VAST Tag URL |
| Лендинг | `https://client.ru/promo` | `href`, `ClickThrough`, `clickUrl`; в query — percent-encoded |
| DSP click | `%reference%` | префикс клика, **не** экранировать |
| DSP cachebuster | `%aw_random%` | `ts=` в коде для кабинета DSP |
| Плеер cachebuster | `[CACHEBUSTER]` | `ts=` внутри VAST/VPAID XML |
| Плеер error | `[ERRORCODE]` | `error_code=` у события `error` |

На полигоне ID можно заменить, но только десятичными числами. Запрещены `camp-001`, `src-002`, `cr-001`, `new`.

Базовый Verify (дальше только `event` и опции):

```
https://antifraud.servicepipe.ru/pixel/verify/track.gif?project=1&campaign=105&creative=512&source=24
```

---

## 3. Макросы на полигоне

В кабинете DSP макросы подставляет площадка. На полигоне площадки нет. Не смешивать два режима на одной странице.

| Режим | Когда | Что делать |
| :--- | :--- | :--- |
| **Как из кабинета** | сверка вёрстки/строки с эталоном | оставить `%aw_random%`, `%reference%`, `[CACHEBUSTER]` литералами |
| **Живой хит** | проверка, что коллектор отвечает | `ts` → случайная ASCII-строка (не время аналитики); кликовый макрос → пустой префикс **или** тестовый click-tracker; затем лендинг |

Для живого клика Verify:

- query: `redirect=` + (опциональный префикс трекера) + `https%3A%2F%2Fclient.ru%2Fpromo`
- HTML `href`: макрос (или пусто) + сырой `https://client.ru/promo` (без encode)
- если в `ts` или `redirect` остался литерал `%reference%` / `[CACHEBUSTER]` / `%aw_random%`, коллектор **не** должен отдавать 302 — только 1×1 GIF

Другие DSP (если страница имитирует не Яндекс):

| Источник | click | cachebuster |
| :--- | :--- | :--- |
| Buzzoola / general | `[CLICK_URL]` | `[RANDOM]` / `[CACHEBUSTER]` |
| Яндекс Direct / Adfox | `%reference%` | `%aw_random%` |
| VK Ads / MyTarget | `{{url_esc}}` | `{{random}}` |
| Hybrid.ai | `{{CLICK_URL}}` | `{{CACHEBUSTER}}` |
| Soloway | `!{click_url}` | `!{random}` |
| MTS DSP | `${CLICK_URL_ESC}` | `${RANDOM}` |
| Google DV360 / CM360 | `%%CLICK_URL_UNESC%%` | `%%CACHEBUSTER%%` |

`bundle` всегда плейсхолдер `<app_id>` (его вписывает Smart TV, не страница), кроме режима живого хита CTV — тогда подставить тестовый app id без угловых скобок.

---

## 4. Два коллектора

Имена файлов `track.gif` совпадают, пути — нет.

| Семейство | Форматы | URL |
| :--- | :--- | :--- |
| Verify | `pixel`, Image, HTML5 (в т.ч. 1×1), VAST, VPAID | `https://antifraud.servicepipe.ru/pixel/verify/track.gif?project={id}&…` |
| Smart | только `pixel_ctv` | `https://antifraud.servicepipe.ru/pixel/smart/{project_id}/track.gif?…` |

Не использовать: `{project_id}.gif`, `verify2.gif`, `/pixel/smart/{project}/{campaign}.gif`.

У Verify все четыре ID в query, в пути только `track.gif`.  
У CTV `project` только в пути; в query — `campaign`, `source`, `creative` (без дубля `project`).

---

## 5. Каталог параметров

### 5.1. Query Verify GIF

| Параметр | Обязателен | Значение |
| :--- | :--- | :--- |
| `project` | да | число |
| `campaign` | да | число |
| `creative` | да | число |
| `source` | да | число |
| `event` | да | см. §7 |
| `ts` | у impression, start, квартилей, complete, click | макрос DSP или `[CACHEBUSTER]` в XML; на живом хите — random |
| `redirect` | только `event=click` у веб-пикселя / 1×1 баннера | макрос + encoded лендинг |
| `error_code` | только `event=error` | `[ERRORCODE]` |

Нет: `company`, `account`, `bundle`, `endpoint`.

Порядок ключей в эталоне: `project`, `campaign`, `creative`, `source`, `event`, затем опции. Полигон не обязан копировать порядок, обязан копировать набор и значения.

### 5.2. Query Smart CTV

Путь: `/pixel/smart/{project_id}/track.gif`

| Параметр | Обязателен | Значение |
| :--- | :--- | :--- |
| `campaign` | да | число |
| `source` | да | число |
| `creative` | да | число |
| `event` | да | только `impression` |
| `bundle` | да | `<app_id>` (плейсхолдер) |
| `ts` | да | макрос cachebuster площадки |

Нет: `project` в query, `event=click`, `redirect`, HTML-тега 1×1.

### 5.3. HTML SDK (`vb.js`)

```html
<script
  data-project-id="1"
  data-campaign-id="105"
  data-source-id="24"
  data-creative-id="512"
  async
  src="https://storage.yandexcloud.net/visibla/vb.js">
</script>
```

SDK принимает и короткие имена (`data-project`, `data-campaign`, …). В выдаче кабинета — суффикс `-id`. На полигоне ставить как в эталоне.

Контейнер баннера: предок с классом `visibla-container` (иначе SDK ищет sized-предка или `body`). Слот должен быть **видимым** (ненулевая геометрия, не `display:none` на контейнере Smart Tag). Для viewability держать креатив в viewport ≥ 1 с (display 50% / 1 с; видео 50% / 2 с playing). Не воспроизводить payload-registry SDK: POST `init`/`enrich` и GET pulse — рантайм `vb.js`, не поля генератора.

Не ставить: `data-endpoint`, `data-company`, `data-company-id`, `data-account`.

### 5.4. VPAID AdParameters JSON

```json
{
  "project": "1",
  "campaign": "105",
  "source": "24",
  "creative": "512",
  "videoUrl": "https://storage.yandexcloud.net/visibla/creatives/512.mp4",
  "clickUrl": "https://client.ru/promo"
}
```

Опционально в JSON: `skippable`, `linear`. **Не слать:** `"endpoint"`, `"company"`, `"coreUrl"`.

### 5.5. VAST Tag URL

```
https://antifraud.servicepipe.ru/api/vast/512.xml?source=24&ts=%aw_random%
```

`512` = `creative_id`. В XML, который отдаёт этот URL, `ts=[CACHEBUSTER]` — это макрос плеера, не рассинхрон с `%aw_random%` в Tag URL.

### 5.6. Кодирование клика

| Место | Лендинг | Макрос DSP |
| :--- | :--- | :--- |
| HTML `href`, VAST `ClickThrough`, VPAID `clickUrl` | сырой URL | не экранировать |
| Query `redirect=`, `clickTag=`, `clickTAG=` | `encodeURIComponent` | не экранировать, стоит **перед** encoded лендингом |

Пример кабинета (Яндекс):

- `href="%reference%https://client.ru/promo"`
- `redirect=%reference%https%3A%2F%2Fclient.ru%2Fpromo`

Коллектор `GET …/pixel/verify/track.gif`: при `event=click` и валидном `redirect` — HTTP 302 на лендинг (после снятия префикса DSP и сверки с зарегистрированным `target_url`). Показ и прочие события — 1×1 GIF без `Location`. FastAPI ЛК `track.gif` не обслуживает.

---

## 6. Матрица страниц

| # | Формат | `markup_format` | Страницы полигона | Вставка |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Пиксель | `pixel` | показ, клик, HTML 1×1 | Verify GIF / `<img>` |
| 2 | Image Display | `image_display` | Smart Tag, 1×1 Pixels, In-Banner | `vb.js` + баннер; запасной = формат 1 |
| 3 | HTML5 Display | `html5_display` | iframe-обёртка, In-Banner + `index.html`, 1×1 | iframe + `clickTag`/`clickTAG` |
| 4 | VAST | `vast` | плеер по Tag URL; опционально просмотр XML | `…/api/vast/{id}.xml` |
| 5 | VPAID | `vpaid` | тот же Tag URL, XML с JS+MP4 | `vb.js` первым MediaFile |
| 6 | Пиксель CTV | `pixel_ctv` | одна страница показа | Smart `track.gif` |

URL показа веб-пикселя **совпадает** с вкладкой «1×1 Pixels» Image/HTML5. На полигоне это один и тот же билдер — не плодить разные query.

---

### Формат 1. Пиксель (`pixel`)

Счётчики без баннера. Показ и клик — один креатив. Лендинг обязателен.

**Страница A — URL показа.** Вставить как `src` у `<img>` или открыть GET:

```
https://antifraud.servicepipe.ru/pixel/verify/track.gif?project=1&campaign=105&creative=512&source=24&event=impression&ts=%aw_random%
```

Ожидаемый хит: `event=impression`. Ответ — GIF, не 302.

**Страница B — URL клика.** Ссылка или редирект-тест:

```
https://antifraud.servicepipe.ru/pixel/verify/track.gif?project=1&campaign=105&creative=512&source=24&event=click&ts=%aw_random%&redirect=%reference%https%3A%2F%2Fclient.ru%2Fpromo
```

Для живого 302 убрать литерал `%reference%` и `%aw_random%` (см. §3). Иначе коллектор отдаст GIF.

**Страница C — HTML-тег 1×1.** Скрытый img, не Smart Tag:

```html
<img src="https://antifraud.servicepipe.ru/pixel/verify/track.gif?project=1&campaign=105&creative=512&source=24&event=impression&ts=%aw_random%"
     width="1" height="1" alt="" border="0"
     style="display:none;position:absolute;left:-9999px;" />
```

Типичные ошибки: путь `/pixel/smart/`; параметр `bundle`; нет `event`; клик без `redirect`; `company` в query.

---

### Формат 2. Image Display

Графический баннер. Коллектор внутри `vb.js`.

**Страница A — JS Smart Tag** (главная):

```html
<div class="visibla-container" style="position:relative;width:100%;height:auto;display:inline-block;">
  <a href="%reference%https://client.ru/promo" target="_blank" rel="noopener" id="visibla-click-area" style="display:block;text-decoration:none;">
    <img src="https://storage.yandexcloud.net/visibla/creatives/512.jpg" alt="Баннер 300x250" style="width:100%;height:auto;display:block;border:0;" />
  </a>
  <script
    data-project-id="1"
    data-campaign-id="105"
    data-source-id="24"
    data-creative-id="512"
    async
    src="https://storage.yandexcloud.net/visibla/vb.js">
  </script>
</div>
```

На полигоне `src` картинки можно заменить локальным ассетом. Обязательны: `.visibla-container`, `rel="noopener"`, четыре `data-*-id`, HTTPS `vb.js`. Клик по `<a>` ведёт на лендинг; SDK дополнительно шлёт GET GIF на `pointerdown`.

**Страница B — 1×1 Pixels.** Те же два URL, что формат 1 (показ + клик). Для площадок без JS.

**Страница C — In-Banner.** Только script (без обёртки и без `<a>`), как вкладка 3 эталона. Вставлять рядом с уже существующим баннером или в размеченный контейнер.

Типичные ошибки: `visibla-tag.min.js`; `data-endpoint`; `data-company`; голый лендинг в `href` без макроса в режиме «как из кабинета»; контейнер `display:none`.

---

### Формат 3. HTML5 Display

ZIP / `index.html` в iframe. Ширина×высота в эталоне: 300×250.

**Страница A — iframe-обёртка:**

```html
<div class="visibla-container" style="position:relative;width:300px;height:250px;">
  <iframe
    src="https://storage.yandexcloud.net/visibla/html5/512/index.html?clickTag=%reference%https%3A%2F%2Fclient.ru%2Fpromo&clickTAG=%reference%https%3A%2F%2Fclient.ru%2Fpromo"
    width="300"
    height="250"
    frameborder="0"
    scrolling="no"
    style="border:none;width:100%;height:100%;">
  </iframe>
  <script
    data-project-id="1"
    data-campaign-id="105"
    data-source-id="24"
    data-creative-id="512"
    async
    src="https://storage.yandexcloud.net/visibla/vb.js">
  </script>
</div>
```

Локальный `index.html` обязан читать **оба** query: `clickTag` и `clickTAG` (разный регистр у баннер-билдеров). Значение — макрос + encoded лендинг.

**Страница B — In-Banner.** Тот же `<script>` `vb.js`, что у Image вкладки 3; в эталоне его кладут в `<head>` `index.html` до упаковки ZIP. На полигоне: либо отдельный HTML5 с script в head, либо тот же iframe, если script уже внутри архива — не дублировать два SDK на одной странице без нужды.

**Страница C — 1×1 Pixels.** Как формат 1.

Типичные ошибки: только `clickTag` без `clickTAG`; сырой лендинг в query iframe; iframe 100% без фиксированного слота (нулевая геометрия для SDK).

---

### Формат 4. VAST 3.0

Площадки РФ берут **URL**, не XML-текст. Главная страница полигона — плеер, которому скормили Tag URL.

**Страница A — плеер + VAST Tag URL**

```
https://antifraud.servicepipe.ru/api/vast/512.xml?source=24&ts=%aw_random%
```

Для живого хита подставить `ts` random. Если публичный `GET /api/vast/{id}.xml` ещё не доступен, страница может временно грузить **локальную копию XML эталона**, но в разметке полигона должен быть виден канонический Tag URL (комментарий / поле «код из кабинета»). Не делать XML единственным «правильным» путём РФ.

**Страница B (опционально) — инспектор XML.** Показать/скачать XML. Макросы внутри — плеера: `ts=[CACHEBUSTER]`, `error_code=[ERRORCODE]`. Параметра `account` нет.

Эталонные событийные URL (вкладка «Событийные трекеры»):

```
impression      https://antifraud.servicepipe.ru/pixel/verify/track.gif?project=1&campaign=105&creative=512&source=24&event=impression&ts=[CACHEBUSTER]
start           https://antifraud.servicepipe.ru/pixel/verify/track.gif?project=1&campaign=105&creative=512&source=24&event=start&ts=[CACHEBUSTER]
firstQuartile   https://antifraud.servicepipe.ru/pixel/verify/track.gif?project=1&campaign=105&creative=512&source=24&event=firstQuartile&ts=[CACHEBUSTER]
midpoint        https://antifraud.servicepipe.ru/pixel/verify/track.gif?project=1&campaign=105&creative=512&source=24&event=midpoint&ts=[CACHEBUSTER]
thirdQuartile   https://antifraud.servicepipe.ru/pixel/verify/track.gif?project=1&campaign=105&creative=512&source=24&event=thirdQuartile&ts=[CACHEBUSTER]
complete        https://antifraud.servicepipe.ru/pixel/verify/track.gif?project=1&campaign=105&creative=512&source=24&event=complete&ts=[CACHEBUSTER]
click           https://antifraud.servicepipe.ru/pixel/verify/track.gif?project=1&campaign=105&creative=512&source=24&event=click&ts=[CACHEBUSTER]
error           https://antifraud.servicepipe.ru/pixel/verify/track.gif?project=1&campaign=105&creative=512&source=24&event=error&error_code=[ERRORCODE]
```

В XML также есть mute / unmute / pause / resume **без** `ts`. `ClickThrough` — сырой лендинг. `MediaFile` — `video/mp4` HTTPS.

Типичные ошибки: `company`/`account` в query; `ts` у mute; Tag URL без `source`; смешанный контент HTTP.

Полный XML — блок «Надо» формата 4 в эталоне.

---

### Формат 5. VPAID 2.0

Тот же VAST Tag URL, что у формата 4. Тип манифеста берётся из `markup_format` креатива.

**Страница:** плеер с VPAID. В XML:

1. Первый `MediaFile`: `apiFramework="VPAID"` `type="application/javascript"` → `https://storage.yandexcloud.net/visibla/vb.js`
2. Второй: progressive `video/mp4` (fallback)
3. `AdParameters` — JSON из §5.4, без `endpoint` / `coreUrl` / `company`
4. Impression / Error / (если есть) квартили — те же Verify URL, что формат 4

Без VPAID-JS плеер посчитает только server `<Impression>`.

Типичные ошибки: `visibla-vpaid.min.js`; `coreUrl`; Impression без ID креатива (`?event=impression` голый); JS не первым MediaFile.

---

### Формат 6. Пиксель CTV (`pixel_ctv`)

Счётчик Smart TV без клика и без лендинга. Одна страница.

```
https://antifraud.servicepipe.ru/pixel/smart/1/track.gif?campaign=105&source=24&creative=512&event=impression&bundle=<app_id>&ts=%aw_random%
```

Вставить как `<img src="…">` (видимый или 1×1 — без требования HTML-тега кабинета: вкладки HTML 1×1 **нет**).

Запрещено на этой странице: `event=click`, `redirect`, Verify-путь `/pixel/verify/`, поле лендинга, вторая вкладка клика.

Типичные ошибки: `/pixel/smart/1/105.gif`; `project` в query; `bundle` на Verify-страницах.

---

## 7. События `event=` (приёмка Network)

| `event` | Где | `ts` | Прочее |
| :--- | :--- | :--- | :--- |
| `impression` | пиксель, 1×1, VAST/VPAID | да | |
| `click` | пиксель/1×1 и VAST ClickTracking | да | веб-пиксель: ещё `redirect`; VAST XML click — без `redirect` |
| `start` | VAST/VPAID | да | |
| `firstQuartile` | VAST/VPAID | да | |
| `midpoint` | VAST/VPAID | да | |
| `thirdQuartile` | VAST/VPAID | да | |
| `complete` | VAST/VPAID | да | |
| `mute` | VAST XML | нет | |
| `unmute` | VAST XML | нет | |
| `pause` | VAST XML | нет | |
| `resume` | VAST XML | нет | |
| `error` | VAST/VPAID | нет | `error_code=[ERRORCODE]` |

Видео-вкладка «Событийные трекеры» в кабинете показывает impression, start, квартили, complete, click, error (без mute/pause в списке вкладки; в XML mute/pause есть).

Дополнительно SDK (Smart Tag / VPAID JS): POST beacon `init`/`enrich`, GET pulse. Для приёмки страницы достаточно: скрипт загрузился, слот видимый, в Network есть запросы на `…/pixel/verify/track.gif`. Не сверять полный набор полей fingerprint.

---

## 8. Чек-лист: страница ок / чинить

- [ ] Хост и путь бикона совпали с форматом (Verify vs Smart)
- [ ] Четыре числовых ID на месте; `company` нет ни в URL, ни в `data-*`, ни в JSON
- [ ] Режим макросов один на странице: литералы кабинета **или** явная подстановка для живого хита
- [ ] Клик HTML: `href` = макрос + сырой лендинг, есть `rel="noopener"` у Smart Tag
- [ ] Клик query: `redirect` = макрос + encoded лендинг
- [ ] CTV: нет клика, нет HTML-вкладки 1×1, нет `event=click`
- [ ] `bundle=<app_id>` только у CTV
- [ ] SDK = `https://storage.yandexcloud.net/visibla/vb.js`; нет `data-endpoint`
- [ ] HTML5: в iframe query есть и `clickTag`, и `clickTAG`
- [ ] 1×1 Image/HTML5 совпадает с URL показа веб-пикселя
- [ ] VAST/VPAID: в UI страницы есть Tag URL; XML не выдаётся как единственный код для РФ
- [ ] VPAID: JS MediaFile первый, затем MP4; в AdParameters нет `endpoint`/`coreUrl`
- [ ] Все SDK и медиа — HTTPS
- [ ] Нет `visibla-tag.min.js`, `visibla-vpaid.min.js`, `account=` в эталонных URL
- [ ] Контейнер баннера видимый (не нулевая геометрия у `.visibla-container`)

---

## 9. Что считать расхождением эталона

Чинить страницу, если:

- другой коллектор или старый путь `/pixel/smart/{project}/{campaign}.gif`
- в теге есть `company` / endpoint / coreUrl
- ID не числа
- у веб-пикселя нет одной из трёх вкладок (показ / клик / HTML)
- у CTV сделали клик или HTML 1×1
- у HTML5 нет второго регистра `clickTAG`
- VAST-события без четырёх ID или с `account`

Не чинить (это не баг полигона):

- отсутствие публичного `GET /api/vast/*.xml` на стенде — используй локальный XML + покажи канонический Tag URL
- отсутствие 302 при литералах макросов в `redirect`/`ts`
- POST enrich/fingerprint от `vb.js` (рантайм SDK)
- счётчик из Настроек проекта
