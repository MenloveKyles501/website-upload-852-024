(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var topButton = document.querySelector('[data-back-top]');

  if (topButton) {
    window.addEventListener('scroll', function () {
      topButton.classList.toggle('is-visible', window.scrollY > 520);
    });

    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    }
  }

  var filterInputs = document.querySelectorAll('[data-card-filter]');

  filterInputs.forEach(function (input) {
    var targetSelector = input.getAttribute('data-card-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
    var counter = document.querySelector(input.getAttribute('data-filter-count'));

    function applyFilter() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = keyword === '' || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('hidden-by-filter', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = visible + ' 部内容';
      }
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  });

  var playerBoxes = document.querySelectorAll('[data-video-player]');

  playerBoxes.forEach(function (box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('[data-player-overlay]');
    var status = box.querySelector('[data-player-status]');
    var source = box.getAttribute('data-src');
    var loaded = false;
    var hlsInstance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function attachSource() {
      if (loaded || !video || !source) {
        return;
      }

      loaded = true;
      setStatus('正在连接播放源…');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪');
          video.play().catch(function () {
            setStatus('点击播放器即可开始播放');
          });
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setStatus('播放源暂时无法连接，可稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('播放源已就绪');
          video.play().catch(function () {
            setStatus('点击播放器即可开始播放');
          });
        }, { once: true });
      } else {
        video.src = source;
        video.play().catch(function () {
          setStatus('当前浏览器可能需要 HLS 支持');
        });
      }
    }

    function startPlayback() {
      hideOverlay();
      attachSource();

      if (video && loaded) {
        video.play().catch(function () {
          setStatus('点击播放器即可开始播放');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('play', function () {
        hideOverlay();
        setStatus('正在播放');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          setStatus('已暂停');
        }
      });

      video.addEventListener('ended', function () {
        setStatus('播放结束');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });

  var searchRoot = document.querySelector('[data-search-page]');

  if (searchRoot && window.MOVIE_SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var queryInput = document.querySelector('[data-search-input]');
    var resultGrid = document.querySelector('[data-search-results]');
    var resultCount = document.querySelector('[data-search-count]');
    var emptyState = document.querySelector('[data-search-empty]');
    var initialQuery = params.get('q') || '';

    if (queryInput) {
      queryInput.value = initialQuery;
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderResults() {
      var keyword = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        if (keyword === '') {
          return true;
        }

        return movie.search.indexOf(keyword) !== -1;
      }).slice(0, 120);

      if (resultCount) {
        resultCount.textContent = results.length + ' 个结果';
      }

      if (emptyState) {
        emptyState.classList.toggle('is-visible', results.length === 0);
      }

      if (resultGrid) {
        resultGrid.innerHTML = results.map(function (movie) {
          return [
            '<article class="movie-card">',
            '  <a href="' + escapeHtml(movie.url) + '">',
            '    <div class="poster-wrap">',
            '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy">',
            '      <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
            '      <span class="poster-time">' + escapeHtml(movie.duration) + '</span>',
            '    </div>',
            '    <div class="card-content">',
            '      <h3>' + escapeHtml(movie.title) + '</h3>',
            '      <p>' + escapeHtml(movie.oneLine) + '</p>',
            '      <div class="card-meta">',
            '        <span>' + escapeHtml(movie.region) + '</span>',
            '        <span>' + escapeHtml(movie.year) + '</span>',
            '      </div>',
            '    </div>',
            '  </a>',
            '</article>'
          ].join('');
        }).join('');
      }
    }

    if (queryInput) {
      queryInput.addEventListener('input', renderResults);
    }

    renderResults();
  }
})();
