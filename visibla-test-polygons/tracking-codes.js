/**
 * Единственный файл контроля трекинг-кодов тестового полигона.
 *
 * Когда приходит код формата из кабинета / генератора — вставьте его в слот
 * и поставьте status: 'ready'. Страницы полигона сами подхватят сниппет.
 *
 * В DOM и в сеть уходит forTest(сниппет): макросы DSP/плеера подменяются
 * локально. Сырой текст (get) на странице показывается без подстановки.
 *
 * Ожидаемая форма слотов — блоки «Надо» в TRACKING_CODES_OUTPUT_BY_FORMAT.
 * Живые ID и URL сюда не копируем из эталона; только присланный код.
 */
(function (global) {
  'use strict';

  var formats = {
    // Формат 1. Пиксель
    // impressionUrl: track.gif?project=…&campaign=…&creative=…&source=…&event=impression&ts=%aw_random%
    // clickUrl: тот же Verify GIF, event=click, redirect=макрос+лендинг
    // htmlTag: <img src="…event=impression…" width="1" height="1" …>
    pixel: {
      status: 'pending',
      impressionUrl: '',
      clickUrl: '',
      htmlTag: ''
    },

    // Формат 2. Image Display
    // smartTag: 300×250 (creative 47) — основной слот для basic/rotator/edge
    // smartTag_* : остальные размеры из ЛК
    // pixels: те же два URL, что у pixel (пока нет кода из ЛК)
    // inBanner: только <script data-*-id src="…/vb.js"> из тега 300×250
    image_display: {
      status: 'ready',
      smartTag:
        '<div class="visibla-container" style="position:relative;width:100%;height:auto;display:inline-block;">\n' +
        '  <a href="[CLICK_URL]https://servicepipe.ru/blog" target="_blank" rel="noopener" id="visibla-click-area" style="display:block;text-decoration:none;">\n' +
        '    <img src="https://storage.yandexcloud.net/tag-generator-media/creatives/47.png" alt="Тест 300х250" style="width:100%;height:auto;display:block;border:0;" />\n' +
        '  </a>\n' +
        '  <script\n' +
        '    data-project-id="12413"\n' +
        '    data-campaign-id="11"\n' +
        '    data-source-id="73"\n' +
        '    data-creative-id="47"\n' +
        '    async\n' +
        '    src="https://storage.yandexcloud.net/visibla/vb.js">\n' +
        '  </script>\n' +
        '</div>',
      smartTag_240x400:
        '<div class="visibla-container" style="position:relative;width:100%;height:auto;display:inline-block;">\n' +
        '  <a href="[CLICK_URL]https://servicepipe.ru/blog" target="_blank" rel="noopener" id="visibla-click-area" style="display:block;text-decoration:none;">\n' +
        '    <img src="https://storage.yandexcloud.net/tag-generator-media/creatives/49.png" alt="Тест 240х400" style="width:100%;height:auto;display:block;border:0;" />\n' +
        '  </a>\n' +
        '  <script\n' +
        '    data-project-id="12413"\n' +
        '    data-campaign-id="11"\n' +
        '    data-source-id="73"\n' +
        '    data-creative-id="49"\n' +
        '    async\n' +
        '    src="https://storage.yandexcloud.net/visibla/vb.js">\n' +
        '  </script>\n' +
        '</div>',
      smartTag_300x300:
        '<div class="visibla-container" style="position:relative;width:100%;height:auto;display:inline-block;">\n' +
        '  <a href="[CLICK_URL]https://servicepipe.ru/blog" target="_blank" rel="noopener" id="visibla-click-area" style="display:block;text-decoration:none;">\n' +
        '    <img src="https://storage.yandexcloud.net/tag-generator-media/creatives/50.png" alt="Тест 300х300" style="width:100%;height:auto;display:block;border:0;" />\n' +
        '  </a>\n' +
        '  <script\n' +
        '    data-project-id="12413"\n' +
        '    data-campaign-id="11"\n' +
        '    data-source-id="73"\n' +
        '    data-creative-id="50"\n' +
        '    async\n' +
        '    src="https://storage.yandexcloud.net/visibla/vb.js">\n' +
        '  </script>\n' +
        '</div>',
      smartTag_300x600:
        '<div class="visibla-container" style="position:relative;width:100%;height:auto;display:inline-block;">\n' +
        '  <a href="[CLICK_URL]https://servicepipe.ru/blog" target="_blank" rel="noopener" id="visibla-click-area" style="display:block;text-decoration:none;">\n' +
        '    <img src="https://storage.yandexcloud.net/tag-generator-media/creatives/51.png" alt="Тест 300х600" style="width:100%;height:auto;display:block;border:0;" />\n' +
        '  </a>\n' +
        '  <script\n' +
        '    data-project-id="12413"\n' +
        '    data-campaign-id="11"\n' +
        '    data-source-id="73"\n' +
        '    data-creative-id="51"\n' +
        '    async\n' +
        '    src="https://storage.yandexcloud.net/visibla/vb.js">\n' +
        '  </script>\n' +
        '</div>',
      smartTag_728x90:
        '<div class="visibla-container" style="position:relative;width:100%;height:auto;display:inline-block;">\n' +
        '  <a href="[CLICK_URL]https://servicepipe.ru/blog" target="_blank" rel="noopener" id="visibla-click-area" style="display:block;text-decoration:none;">\n' +
        '    <img src="https://storage.yandexcloud.net/tag-generator-media/creatives/52.png" alt="Тест 728х90" style="width:100%;height:auto;display:block;border:0;" />\n' +
        '  </a>\n' +
        '  <script\n' +
        '    data-project-id="12413"\n' +
        '    data-campaign-id="11"\n' +
        '    data-source-id="73"\n' +
        '    data-creative-id="52"\n' +
        '    async\n' +
        '    src="https://storage.yandexcloud.net/visibla/vb.js">\n' +
        '  </script>\n' +
        '</div>',
      smartTag_970x250:
        '<div class="visibla-container" style="position:relative;width:100%;height:auto;display:inline-block;">\n' +
        '  <a href="[CLICK_URL]https://servicepipe.ru/blog" target="_blank" rel="noopener" id="visibla-click-area" style="display:block;text-decoration:none;">\n' +
        '    <img src="https://storage.yandexcloud.net/tag-generator-media/creatives/53.png" alt="Тест 970х250" style="width:100%;height:auto;display:block;border:0;" />\n' +
        '  </a>\n' +
        '  <script\n' +
        '    data-project-id="12413"\n' +
        '    data-campaign-id="11"\n' +
        '    data-source-id="73"\n' +
        '    data-creative-id="53"\n' +
        '    async\n' +
        '    src="https://storage.yandexcloud.net/visibla/vb.js">\n' +
        '  </script>\n' +
        '</div>',
      pixels: '',
      inBanner:
        '<script\n' +
        '    data-project-id="12413"\n' +
        '    data-campaign-id="11"\n' +
        '    data-source-id="73"\n' +
        '    data-creative-id="47"\n' +
        '    async\n' +
        '    src="https://storage.yandexcloud.net/visibla/vb.js">\n' +
        '  </script>'
    },

    // Формат 3. HTML5 Display
    // iframe: обёртка iframe + clickTag/clickTAG + vb.js
    // inBanner: тот же script, что image_display.inBanner
    // pixels: те же два URL, что у pixel
    html5_display: {
      status: 'pending',
      iframe: '',
      inBanner: '',
      pixels: ''
    },

    // Формат 4. VAST 3.0
    // tagUrl: /api/vast/{creative}.xml?source=…&ts=%aw_random%
    // xml: VAST 3.0, ts=[CACHEBUSTER], track.gif?project=…
    // trackers: текстовый список событийных URL
    vast: {
      status: 'pending',
      tagUrl: '',
      xml: '',
      trackers: ''
    },

    // Формат 5. VPAID 2.0
    // tagUrl: как у vast
    // xml: MediaFile vb.js, затем mp4; AdParameters без endpoint/coreUrl
    // trackers: как у vast
    vpaid: {
      status: 'pending',
      tagUrl: '',
      xml: '',
      trackers: ''
    },

    // Формат 6. Пиксель CTV — /pixel/smart/{project}/track.gif, без клика
    pixel_ctv: {
      status: 'pending',
      impressionUrl: ''
    }
  };

  function trim(value) {
    return value == null ? '' : String(value).replace(/^\s+|\s+$/g, '');
  }

  function getFormat(name) {
    return formats[name] || null;
  }

  function get(format, tab) {
    var f = getFormat(format);
    if (!f) return '';
    if (!tab) return f;
    return typeof f[tab] === 'string' ? f[tab] : '';
  }

  function isReady(format, tab) {
    var f = getFormat(format);
    if (!f || f.status !== 'ready') return false;
    if (tab) return trim(f[tab]).length > 0;
    return true;
  }

  function forTest(str) {
    if (str == null || str === '') return '';
    var ts = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    return String(str)
      .replace(/%aw_random%/g, ts)
      .replace(/\[RANDOM\]/g, ts)
      .replace(/\[CACHEBUSTER\]/g, ts)
      .replace(/%reference%/g, '')
      .replace(/\[CLICK_URL\]/g, '');
  }

  function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('visibla-inject-styles')) return;
    var style = document.createElement('style');
    style.id = 'visibla-inject-styles';
    style.textContent =
      '.visibla-pending{background:#161b22;border:1px dashed #d2991d;border-radius:8px;padding:18px 20px;color:#c9d1d9;font:13px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:640px;margin:0 auto}' +
      '.visibla-pending code{background:#21262d;color:#79c0ff;padding:1px 6px;border-radius:4px}' +
      '.visibla-pending .hint{color:#8b949e;margin-top:8px;font-size:12px}' +
      '.visibla-raw{background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:12px 14px;overflow:auto;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;color:#79c0ff;white-space:pre-wrap;word-break:break-word;max-height:220px}';
    (document.head || document.documentElement).appendChild(style);
  }

  function resolveHost(selector, root) {
    if (!selector) return null;
    if (typeof selector !== 'string') return selector;
    var doc = root || document;
    return doc.querySelector(selector);
  }

  function pendingHtml(format, tab) {
    var tabBit = tab ? ' / <code>' + tab + '</code>' : '';
    return (
      '<div class="visibla-pending">' +
        'Код формата <code>' + format + '</code>' + tabBit + ' ещё не вставлен.' +
        '<div class="hint">Вставьте сниппет в <code>tracking-codes.js</code> и поставьте <code>status: \'ready\'</code>. Коллектор не вызывается, пока слот пустой.</div>' +
      '</div>'
    );
  }

  function showPending(selector, format, tab, root) {
    ensureStyles();
    var host = resolveHost(selector, root);
    if (!host) return false;
    host.innerHTML = pendingHtml(format, tab);
    return true;
  }

  function showRaw(selector, format, tab, root) {
    ensureStyles();
    var el = resolveHost(selector, root);
    if (!el) return false;
    var raw = trim(get(format, tab));
    el.classList.add('visibla-raw');
    el.textContent = raw || '(пусто — вставьте код в tracking-codes.js)';
    return true;
  }

  function activateScripts(root) {
    var list = root.querySelectorAll ? root.querySelectorAll('script') : [];
    Array.prototype.forEach.call(list, function (old) {
      var fresh = document.createElement('script');
      Array.prototype.forEach.call(old.attributes || [], function (attr) {
        fresh.setAttribute(attr.name, attr.value);
      });
      fresh.text = old.textContent || '';
      if (old.parentNode) old.parentNode.replaceChild(fresh, old);
    });
    return root;
  }

  function mount(selector, html, root) {
    var host = resolveHost(selector, root);
    if (!host) return false;
    host.innerHTML = '';
    var live = forTest(html);
    if (!trim(live)) return false;
    var tpl = document.createElement('template');
    tpl.innerHTML = live;
    host.appendChild(tpl.content);
    activateScripts(host);
    return true;
  }

  function mountFormat(selector, format, tab, root) {
    ensureStyles();
    if (!isReady(format, tab)) {
      showPending(selector, format, tab, root);
      return false;
    }
    return mount(selector, get(format, tab), root);
  }

  function beacon(url) {
    var live = forTest(url);
    if (!trim(live)) return '';
    var img = document.createElement('img');
    img.width = 1;
    img.height = 1;
    img.alt = '';
    img.src = live;
    return live;
  }

  function vastXml(format) {
    var f = getFormat(format);
    if (!f || f.status !== 'ready') return '';
    return forTest(trim(f.xml));
  }

  function vastUrl(format) {
    var f = getFormat(format);
    if (!f || f.status !== 'ready') return '';
    var xml = trim(f.xml);
    var tag = trim(f.tagUrl);
    if (xml) {
      return URL.createObjectURL(new Blob([forTest(xml)], { type: 'application/xml' }));
    }
    if (tag) return forTest(tag);
    return '';
  }

  global.VisiblaTrackingCodes = { formats: formats };
  global.VisiblaInject = {
    get: get,
    isReady: isReady,
    forTest: forTest,
    mount: mount,
    mountFormat: mountFormat,
    showPending: showPending,
    showRaw: showRaw,
    beacon: beacon,
    vastUrl: vastUrl,
    vastXml: vastXml
  };
})(window);
