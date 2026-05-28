document.addEventListener("DOMContentLoaded", function () {
  var shell = document.querySelector("[data-player-shell]");
  var video = document.querySelector("video[data-src]");
  var startButton = document.querySelector("[data-player-start]");
  var status = document.querySelector("[data-player-status]");

  if (!shell || !video) {
    return;
  }

  var source = video.getAttribute("data-src");
  var ready = false;
  var pendingPlay = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function markReady() {
    ready = true;
    setStatus("片源已就绪，点击播放按钮即可观看");

    if (pendingPlay) {
      playVideo();
    }
  }

  function playVideo() {
    pendingPlay = true;

    if (!ready) {
      setStatus("正在加载 HLS 片源，请稍候");
    }

    var promise = video.play();

    if (promise && typeof promise.then === "function") {
      promise.then(function () {
        if (startButton) {
          startButton.classList.add("is-hidden");
        }

        setStatus("正在播放");
      }).catch(function () {
        setStatus("浏览器阻止了自动播放，请点击播放器控件中的播放按钮");
      });
    }
  }

  function initWithHls() {
    if (!window.Hls || !window.Hls.isSupported()) {
      return false;
    }

    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
      markReady();
    });

    hls.on(window.Hls.Events.ERROR, function (eventName, data) {
      if (data && data.fatal) {
        setStatus("片源加载遇到问题，请刷新页面重试");
      }
    });

    window.addEventListener("beforeunload", function () {
      hls.destroy();
    });

    return true;
  }

  function loadHlsLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve();
        return;
      }

      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initPlayer() {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", markReady, { once: true });
      setStatus("正在准备原生 HLS 播放");
      return;
    }

    loadHlsLibrary().then(function () {
      if (!initWithHls()) {
        setStatus("当前浏览器不支持 HLS 播放");
      }
    }).catch(function () {
      setStatus("HLS 播放组件加载失败，请检查网络后刷新页面");
    });
  }

  if (startButton) {
    startButton.addEventListener("click", playVideo);
  }

  video.addEventListener("play", function () {
    if (startButton) {
      startButton.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (startButton && video.currentTime === 0) {
      startButton.classList.remove("is-hidden");
    }
  });

  initPlayer();
});
