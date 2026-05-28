
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initPlayer(box) {
    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    var button = box.querySelector("[data-play-button]");
    var error = box.querySelector(".player-error");
    var source = box.getAttribute("data-src");
    var attached = false;
    var hls = null;

    function showError() {
      if (error) {
        error.textContent = "当前环境无法播放，请稍后重试";
        error.hidden = false;
      }
    }

    function attachSource() {
      if (attached || !video || !source) return;
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showError();
          }
        });
      } else {
        showError();
      }
    }

    function play() {
      attachSource();
      if (!video || !source) return;
      video.controls = true;
      video.muted = false;
      box.classList.add("is-playing");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          video.muted = true;
          video.play().catch(function () {
            showError();
          });
        });
      }
    }

    if (button) button.addEventListener("click", play);
    if (cover && cover !== button) cover.addEventListener("click", play);
    if (video) {
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
    }
    window.addEventListener("beforeunload", function () {
      if (hls) hls.destroy();
    });
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(initPlayer);
  });
})();
