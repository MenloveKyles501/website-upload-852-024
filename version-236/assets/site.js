(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
            document.body.classList.toggle("no-scroll", menu.classList.contains("is-open"));
        });
        menu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                menu.classList.remove("is-open");
                document.body.classList.remove("no-scroll");
            });
        });
    }

    function initHero() {
        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            if (slides.length < 2) {
                return;
            }

            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 6500);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            start();
        });
    }

    function initRails() {
        document.querySelectorAll("[data-scroll-left], [data-scroll-right]").forEach(function (button) {
            button.addEventListener("click", function () {
                var leftId = button.getAttribute("data-scroll-left");
                var rightId = button.getAttribute("data-scroll-right");
                var target = document.getElementById(leftId || rightId);
                if (!target) {
                    return;
                }
                target.scrollBy({
                    left: leftId ? -420 : 420,
                    behavior: "smooth"
                });
            });
        });
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-card-search]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var empty = scope.querySelector("[data-empty-state]");
            var filters = {};

            if (scope.hasAttribute("data-search-page") && input) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get("q");
                if (query) {
                    input.value = query;
                }
            }

            function setButtonState(button) {
                var field = button.getAttribute("data-filter-field");
                var row = button.closest(".filter-row");
                if (row) {
                    row.querySelectorAll("[data-filter-button][data-filter-field='" + field + "']").forEach(function (peer) {
                        peer.classList.remove("is-active");
                    });
                }
                button.classList.add("is-active");
            }

            function matchesText(card, query) {
                if (!query) {
                    return true;
                }
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].map(normalize).join(" ");
                return haystack.indexOf(query) !== -1;
            }

            function matchesFilters(card) {
                return Object.keys(filters).every(function (field) {
                    if (!filters[field]) {
                        return true;
                    }
                    return normalize(card.getAttribute("data-" + field)) === normalize(filters[field]);
                });
            }

            function apply() {
                var query = input ? normalize(input.value) : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var show = matchesText(card, query) && matchesFilters(card);
                    card.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            scope.querySelectorAll("[data-filter-button]").forEach(function (button) {
                button.addEventListener("click", function () {
                    var field = button.getAttribute("data-filter-field");
                    var value = button.getAttribute("data-filter-value") || "";
                    filters[field] = value;
                    setButtonState(button);
                    apply();
                });
            });

            apply();
        });
    }

    function initPlayer(videoId, overlayId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var attached = false;

        if (!video || !source) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._movieHls = hls;
                return;
            }
            video.src = source;
        }

        function start() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        attach();

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
    }

    window.MovieSite = {
        initPlayer: initPlayer
    };

    ready(function () {
        initNavigation();
        initHero();
        initRails();
        initFilters();
    });
}());
