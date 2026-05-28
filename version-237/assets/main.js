document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setupImageFallbacks();
  setupFilters();
});

function setupMobileMenu() {
  var button = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (!button || !menu) {
    return;
  }

  button.addEventListener("click", function () {
    menu.classList.toggle("open");
  });
}

function setupImageFallbacks() {
  var images = document.querySelectorAll("img[data-cover]");

  images.forEach(function (image) {
    image.addEventListener("error", function () {
      var frame = image.closest(".card-poster, .list-poster, .hero-card");

      if (frame) {
        frame.classList.add("poster-empty");
      }

      image.style.opacity = "0";
    });
  });
}

function setupFilters() {
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var input = document.querySelector("[data-filter-input]");
  var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
  var count = document.querySelector("[data-filter-count]");

  if (!cards.length || (!input && !selects.length)) {
    return;
  }

  populateFilterOptions(cards, selects);

  function applyFilters() {
    var query = input ? input.value.trim().toLowerCase() : "";
    var filters = {};

    selects.forEach(function (select) {
      filters[select.getAttribute("data-filter-select")] = select.value;
    });

    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.tags,
        card.dataset.category
      ].join(" ").toLowerCase();

      var matchesText = !query || haystack.indexOf(query) !== -1;
      var matchesSelects = Object.keys(filters).every(function (key) {
        return !filters[key] || card.dataset[key] === filters[key];
      });

      if (matchesText && matchesSelects) {
        card.classList.remove("is-hidden-by-filter");
        visible += 1;
      } else {
        card.classList.add("is-hidden-by-filter");
      }
    });

    if (count) {
      count.textContent = "当前显示 " + visible + " 部影片";
    }
  }

  if (input) {
    input.addEventListener("input", applyFilters);
  }

  selects.forEach(function (select) {
    select.addEventListener("change", applyFilters);
  });

  applyFilters();
}

function populateFilterOptions(cards, selects) {
  selects.forEach(function (select) {
    var key = select.getAttribute("data-filter-select");
    var values = [];

    cards.forEach(function (card) {
      var value = card.dataset[key];

      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });

    if (key === "year") {
      values.sort(function (a, b) {
        return Number(b) - Number(a);
      });
    } else {
      values.sort(function (a, b) {
        return a.localeCompare(b, "zh-Hans-CN");
      });
    }

    values.forEach(function (value) {
      if (select.querySelector("option[value='" + cssEscape(value) + "']")) {
        return;
      }

      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  });
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }

  return String(value).replace(/'/g, "\\'");
}
