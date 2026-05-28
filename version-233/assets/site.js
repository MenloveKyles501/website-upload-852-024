(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-button]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 16) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && header) {
    menuButton.addEventListener('click', function () {
      var active = header.classList.toggle('menu-active');
      document.body.classList.toggle('menu-open', active);
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var input = root.querySelector('[data-filter-input]');
    var year = root.querySelector('[data-filter-year]');
    var region = root.querySelector('[data-filter-region]');
    var type = root.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var empty = root.querySelector('[data-no-results]');

    function value(node) {
      return node ? node.value.trim().toLowerCase() : '';
    }

    function apply() {
      var q = value(input);
      var y = value(year);
      var r = value(region);
      var t = value(type);
      var shown = 0;
      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (y && card.dataset.year !== y) {
          ok = false;
        }
        if (r && card.dataset.region !== r) {
          ok = false;
        }
        if (t && card.dataset.type !== t) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('active', shown === 0);
      }
    }

    [input, year, region, type].forEach(function (node) {
      if (!node) {
        return;
      }
      node.addEventListener('input', apply);
      node.addEventListener('change', apply);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (input && q) {
      input.value = q;
    }
    apply();
  });

  function playVideo(wrap) {
    var video = wrap.querySelector('video');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-src');
    if (!source) {
      return;
    }

    function begin() {
      var promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          wrap.classList.add('is-playing');
        }).catch(function () {
          wrap.classList.remove('is-playing');
        });
      } else {
        wrap.classList.add('is-playing');
      }
    }

    if (video.dataset.ready === '1') {
      begin();
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.ready = '1';
      begin();
      return;
    }

    function attachWithHls() {
      if (!window.Hls || !window.Hls.isSupported()) {
        video.src = source;
        video.dataset.ready = '1';
        begin();
        return;
      }
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.dataset.ready = '1';
      hls.on(window.Hls.Events.MANIFEST_PARSED, begin);
    }

    if (window.Hls) {
      attachWithHls();
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    script.onload = attachWithHls;
    script.onerror = function () {
      video.src = source;
      video.dataset.ready = '1';
      begin();
    };
    document.head.appendChild(script);
  }

  document.querySelectorAll('.player-wrap').forEach(function (wrap) {
    var button = wrap.querySelector('.play-trigger');
    if (button) {
      button.addEventListener('click', function () {
        playVideo(wrap);
      });
    }
    wrap.addEventListener('click', function (event) {
      if (event.target.closest('video')) {
        return;
      }
      playVideo(wrap);
    });
  });
})();
