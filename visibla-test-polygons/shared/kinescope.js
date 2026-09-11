(function (global) {
  'use strict';

  var SCRIPT = 'https://player.kinescope.io/latest/iframe.player.js';
  var CONTENT = 'https://kinescope.io/200960204';
  var factory = null;
  var loading = false;
  var waiters = [];

  function load(cb) {
    if (factory) {
      cb(factory);
      return;
    }
    waiters.push(cb);
    if (loading) return;
    loading = true;
    window.onKinescopeIframeAPIReady = function (f) {
      factory = f;
      var list = waiters.splice(0);
      var i;
      for (i = 0; i < list.length; i++) list[i](f);
    };
    var s = document.createElement('script');
    s.src = SCRIPT;
    s.async = true;
    document.head.appendChild(s);
  }

  function brokenXml(xml) {
    return String(xml).replace(
      /(type="video\/mp4"[^>]*>\s*(?:<!\[CDATA\[)?)(https?:\/\/[^\]<\s]+)/,
      '$1https://storage.yandexcloud.net/visibla/missing-polygon-404.mp4'
    );
  }

  function setMuted(player, muted) {
    if (!player || typeof player.setMuted !== 'function') return;
    player.setMuted(!!muted);
  }

  function isMuted(player) {
    if (!player) return true;
    if (typeof player.isMuted === 'function') return !!player.isMuted();
    return true;
  }

  function create(elementId, opts) {
    opts = opts || {};
    load(function (f) {
      var xml = opts.xml || '';
      var startMuted = opts.muted !== false;
      var p;
      try {
        p = f.create(elementId, {
          url: opts.contentUrl || CONTENT,
          size: { width: '100%', height: opts.height || 400 },
          muted: startMuted,
          autoPlay: true,
          behaviour: { muted: startMuted, autoPlay: true, playsInline: true },
          playlist: [{ ad: { adTag: xml } }]
        });
      } catch (e) {
        return;
      }
      if (!p || typeof p.then !== 'function') return;
      p.then(function (player) {
        setMuted(player, startMuted);
        if (opts.onReady) opts.onReady(player);
      }, function () {});
    });
  }

  global.VisiblaKinescope = {
    load: load,
    create: create,
    brokenXml: brokenXml,
    setMuted: setMuted,
    isMuted: isMuted,
    CONTENT: CONTENT
  };
})(window);
