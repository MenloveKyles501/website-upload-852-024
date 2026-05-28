(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (menuButton && menu) {
      menuButton.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
      });

      window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    var searchPage = document.querySelector('[data-search-page]');
    var searchPageInput = document.querySelector('[data-search-page-input]');
    if (searchPage && searchPageInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      searchPageInput.value = query;
      var localInputs = document.querySelectorAll('[data-local-search]');
      localInputs.forEach(function (input) {
        input.value = query;
      });
    }

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var localSearchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-search]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-result]');
    var activeFilter = 'all';

    function applyFilters() {
      var query = '';
      localSearchInputs.forEach(function (input) {
        if (input.value.trim()) {
          query = input.value.trim();
        }
      });
      var normalizedQuery = normalize(query);
      var visible = 0;

      cards.forEach(function (card) {
        var type = card.getAttribute('data-type') || '';
        var text = normalize(card.getAttribute('data-search'));
        var filterMatch = activeFilter === 'all' || type.indexOf(activeFilter) !== -1 || text.indexOf(normalize(activeFilter)) !== -1;
        var searchMatch = !normalizedQuery || text.indexOf(normalizedQuery) !== -1;
        var shouldShow = filterMatch && searchMatch;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter') || 'all';
        filterButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilters();
      });
    });

    localSearchInputs.forEach(function (input) {
      input.addEventListener('input', applyFilters);
    });

    if (cards.length) {
      applyFilters();
    }
  });
})();
