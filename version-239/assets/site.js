(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        resetTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        resetTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        resetTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  const pageFilterInput = document.querySelector('.page-filter-input');
  const cardList = document.querySelector('[data-card-list]');
  const yearButtons = Array.from(document.querySelectorAll('[data-page-year]'));
  let selectedYear = '';

  function filterCards() {
    if (!cardList) {
      return;
    }
    const query = pageFilterInput ? pageFilterInput.value.trim().toLowerCase() : '';
    const cards = Array.from(cardList.querySelectorAll('.movie-card'));
    cards.forEach(function (card) {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.year
      ].join(' ').toLowerCase();
      const matchQuery = !query || haystack.indexOf(query) !== -1;
      const matchYear = !selectedYear || card.dataset.year === selectedYear;
      card.classList.toggle('is-hidden', !(matchQuery && matchYear));
    });
  }

  if (pageFilterInput) {
    pageFilterInput.addEventListener('input', filterCards);
  }

  yearButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      selectedYear = button.dataset.pageYear || '';
      filterCards();
    });
  });

  const searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot) {
    const input = searchRoot.querySelector('[data-search-input]');
    const category = searchRoot.querySelector('[data-filter-category]');
    const type = searchRoot.querySelector('[data-filter-type]');
    const region = searchRoot.querySelector('[data-filter-region]');
    const reset = searchRoot.querySelector('[data-search-reset]');
    const results = searchRoot.querySelector('[data-search-results]');
    const count = searchRoot.querySelector('[data-search-count]');
    const dataUrl = searchRoot.dataset.dataUrl || 'assets/movies.json';
    let movies = [];

    function readQueryParam() {
      const params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    }

    function renderMovie(movie) {
      const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="' + escapeHtml(movie.url) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="play-badge">▶</span>',
        '    <span class="category-badge">' + escapeHtml(movie.category) + '</span>',
        '  </a>',
        '  <div class="movie-info">',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="movie-line">' + escapeHtml(movie.one_line || '') + '</p>',
        '    <div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>★ ' + escapeHtml(movie.rating) + '</span></div>',
        '    <div class="movie-tags">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function applySearch() {
      const q = input.value.trim().toLowerCase();
      const selectedCategory = category.value;
      const selectedType = type.value;
      const selectedRegion = region.value;
      const filtered = movies.filter(function (movie) {
        const haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.one_line,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return (!q || haystack.indexOf(q) !== -1)
          && (!selectedCategory || movie.category === selectedCategory)
          && (!selectedType || movie.type === selectedType)
          && (!selectedRegion || movie.region === selectedRegion);
      });
      const limited = filtered.slice(0, 120);
      results.innerHTML = limited.map(renderMovie).join('');
      count.textContent = '共找到 ' + filtered.length + ' 部影片，当前显示 ' + limited.length + ' 部。';
    }

    fetch(dataUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        movies = data;
        input.value = readQueryParam();
        applySearch();
      })
      .catch(function () {
        count.textContent = '影片数据载入失败，请确认 assets/movies.json 文件存在。';
      });

    [input, category, type, region].forEach(function (control) {
      control.addEventListener('input', applySearch);
      control.addEventListener('change', applySearch);
    });

    reset.addEventListener('click', function () {
      input.value = '';
      category.value = '';
      type.value = '';
      region.value = '';
      applySearch();
    });
  }
})();
