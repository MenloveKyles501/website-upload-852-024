
(function () {
  const ready = (fn) => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  function initNav() {
    const toggle = qs('.nav-toggle');
    const nav = qs('.site-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }

  function initHeroSlider() {
    const slider = qs('[data-hero-slider]');
    if (!slider) return;
    const slides = qsa('.hero-slide', slider);
    const dots = qsa('.hero-dot', slider);
    if (!slides.length) return;
    let current = 0;
    let timer = null;

    const show = (idx) => {
      current = (idx + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(current + 1), 5200);
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    dots.forEach((dot, i) => dot.addEventListener('click', () => {
      show(i);
      start();
    }));

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearch() {
    qsa('[data-filter-area]').forEach((area) => {
      const input = qs('.js-search-input', area);
      const cards = qsa('[data-card-item]', area);
      const count = qs('[data-filter-count]', area);
      const tags = qsa('[data-filter-tag]', area);

      const apply = (query = '') => {
        const q = query.trim().toLowerCase();
        let visible = 0;
        cards.forEach((card) => {
          const hay = (card.getAttribute('data-search') || '').toLowerCase();
          const ok = !q || hay.includes(q);
          card.style.display = ok ? '' : 'none';
          if (ok) visible += 1;
        });
        if (count) count.textContent = `${visible} / ${cards.length}`;
      };

      if (input) {
        input.addEventListener('input', () => apply(input.value));
      }

      tags.forEach((tag) => {
        tag.addEventListener('click', () => {
          const value = tag.getAttribute('data-value') || '';
          if (input) input.value = value;
          apply(value);
          tags.forEach((t) => t.classList.toggle('active', t === tag));
        });
      });

      apply(input ? input.value : '');
    });
  }

  function initPlayer() {
    const container = qs('[data-player]');
    if (!container) return;
    const video = qs('video', container);
    const overlay = qs('.play-overlay', container);
    if (!video) return;

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };

    const hideOverlay = () => overlay && overlay.classList.add('hidden');

    if (overlay) {
      overlay.addEventListener('click', () => {
        hideOverlay();
        tryPlay();
      });
    }

    video.addEventListener('click', () => {
      hideOverlay();
      tryPlay();
    });

    const stream = container.getAttribute('data-stream');
    const fallback = container.getAttribute('data-fallback');
    if (stream) {
      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          tryPlay();
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (fallback) {
        video.src = fallback;
      }
    } else if (fallback) {
      video.src = fallback;
    }

    video.addEventListener('play', hideOverlay);
  }

  function initBackToTop() {
    const btn = qs('[data-back-top]');
    if (!btn) return;
    const toggle = () => {
      btn.style.opacity = window.scrollY > 500 ? '1' : '0';
      btn.style.pointerEvents = window.scrollY > 500 ? 'auto' : 'none';
    };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  ready(() => {
    initNav();
    initHeroSlider();
    initSearch();
    initPlayer();
    initBackToTop();
  });
})();
