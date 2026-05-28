
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  function initHeroSlider() {
    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    if (!slides.length) return;
    let index = 0;
    const setActive = (next) => {
      slides[index].classList.remove('active');
      index = next;
      slides[index].classList.add('active');
    };
    slides[index].classList.add('active');
    const prev = document.querySelector('[data-hero-prev]');
    const next = document.querySelector('[data-hero-next]');
    if (prev) prev.addEventListener('click', () => setActive((index - 1 + slides.length) % slides.length));
    if (next) next.addEventListener('click', () => setActive((index + 1) % slides.length));
    setInterval(() => setActive((index + 1) % slides.length), 5200);
  }

  function normalizeText(s) {
    return String(s || '').toLowerCase().replace(/\s+/g, '');
  }

  function initFilters() {
    const form = document.querySelector('[data-filter-form]');
    const input = document.querySelector('[data-filter-input]');
    const selects = Array.from(document.querySelectorAll('[data-filter-select]'));
    const cards = Array.from(document.querySelectorAll('[data-filter-card]'));
    if (!cards.length || !input) return;

    const apply = () => {
      const q = normalizeText(input.value);
      const values = Object.fromEntries(selects.map((el) => [el.name, el.value]));
      let shown = 0;
      cards.forEach((card) => {
        const hay = normalizeText([
          card.dataset.title,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.tags,
          card.dataset.year,
        ].join(' '));
        const matchesQuery = !q || hay.includes(q);
        const matchesType = !values.type || values.type === 'all' || card.dataset.type === values.type;
        const matchesRegion = !values.region || values.region === 'all' || card.dataset.region === values.region;
        const matchesYear = !values.year || values.year === 'all' || card.dataset.year === values.year;
        const show = matchesQuery && matchesType && matchesRegion && matchesYear;
        card.classList.toggle('hide', !show);
        if (show) shown += 1;
      });
      const counter = document.querySelector('[data-filter-count]');
      if (counter) counter.textContent = String(shown);
    };

    if (form) form.addEventListener('submit', (e) => e.preventDefault());
    input.addEventListener('input', apply);
    selects.forEach((el) => el.addEventListener('change', apply));
    apply();
  }

  function initDetailToggle() {
    const btn = document.querySelector('[data-expand-summary]');
    const box = document.querySelector('[data-summary-box]');
    if (!btn || !box) return;
    btn.addEventListener('click', () => {
      box.classList.toggle('expanded');
      box.querySelectorAll('.summary-more').forEach((node) => node.classList.toggle('hide'));
      btn.textContent = box.classList.contains('expanded') ? '收起简介' : '展开简介';
    });
  }

  ready(() => {
    initNav();
    initHeroSlider();
    initFilters();
    initDetailToggle();
  });
})();
