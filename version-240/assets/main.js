
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) return;
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "search.html?q=" + encodeURIComponent(query);
        }
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) return;
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(index);
        start();
      });
    });
    root.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    root.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var scope = document.querySelector("[data-filter-scope]");
    if (!scope) return;
    var input = scope.querySelector("[data-filter-input]");
    var year = scope.querySelector("[data-year-filter]");
    var type = scope.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-result]");
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.tags, card.textContent].join(" ").toLowerCase();
        var ok = true;
        if (query && text.indexOf(query) === -1) ok = false;
        if (yearValue && card.dataset.year !== yearValue) ok = false;
        if (typeValue && card.dataset.type !== typeValue) ok = false;
        card.style.display = ok ? "" : "none";
        if (ok) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    }
    [input, year, type].forEach(function (item) {
      if (item) item.addEventListener("input", apply);
      if (item) item.addEventListener("change", apply);
    });
  }

  function renderCard(movie) {
    return [
      '<article class="movie-card">',
      '<a class="movie-cover" href="' + escapeHtml(movie.file) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="movie-category">' + escapeHtml(movie.category) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3><a href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p class="movie-desc">' + escapeHtml(movie.desc) + '</p>',
      '<div class="movie-meta"><span>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span><span>★ ' + escapeHtml(movie.rating) + '</span></div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var form = document.querySelector("[data-search-page-form]");
    if (!results || !window.SEARCH_INDEX) return;
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = form ? form.querySelector("input[name='q']") : null;
    if (input) input.value = query;
    function run(value) {
      var q = value.trim().toLowerCase();
      if (!q) {
        title.textContent = "请输入关键词";
        results.innerHTML = "";
        return;
      }
      var items = window.SEARCH_INDEX.filter(function (movie) {
        return [movie.title, movie.category, movie.region, movie.type, movie.genre, movie.desc, (movie.tags || []).join(" ")]
          .join(" ")
          .toLowerCase()
          .indexOf(q) !== -1;
      }).slice(0, 120);
      title.textContent = '“' + value.trim() + '” 的相关影片';
      results.innerHTML = items.length ? items.map(renderCard).join("") : '<div class="empty-result">没有匹配的影片</div>';
    }
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = input ? input.value : "";
        var url = value.trim() ? "search.html?q=" + encodeURIComponent(value.trim()) : "search.html";
        window.history.replaceState(null, "", url);
        run(value);
      });
    }
    run(query);
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
