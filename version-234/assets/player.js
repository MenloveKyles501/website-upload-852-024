(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById('movie-player');
    var dataNode = document.getElementById('movie-player-data');
    var overlay = document.querySelector('[data-player-overlay]');
    var loading = document.querySelector('[data-player-loading]');
    var toggleButton = document.querySelector('[data-player-toggle]');
    var muteButton = document.querySelector('[data-player-mute]');
    var fullscreenButton = document.querySelector('[data-player-fullscreen]');

    if (!video || !dataNode) {
      return;
    }

    var data = {};
    try {
      data = JSON.parse(dataNode.textContent || '{}');
    } catch (error) {
      data = {};
    }

    var hls = null;
    var initialized = false;

    function setLoading(isLoading) {
      if (loading) {
        loading.classList.toggle('show', Boolean(isLoading));
      }
    }

    function setPlayingState() {
      var isPlaying = !video.paused && !video.ended;
      if (toggleButton) {
        toggleButton.textContent = isPlaying ? '暂停' : '播放';
      }
      if (overlay) {
        overlay.classList.toggle('hidden', isPlaying);
      }
    }

    function initializePlayer() {
      if (initialized || !data.src) {
        return;
      }
      initialized = true;
      setLoading(true);

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(data.src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setLoading(false);
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, payload) {
          if (!payload || !payload.fatal) {
            return;
          }
          if (payload.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          }
          if (payload.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = data.src;
        video.addEventListener('loadedmetadata', function () {
          setLoading(false);
        }, { once: true });
      } else {
        video.src = data.src;
        setLoading(false);
      }
    }

    function playVideo() {
      initializePlayer();
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          setPlayingState();
        });
      }
    }

    function togglePlay() {
      if (video.paused || video.ended) {
        playVideo();
      } else {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    if (toggleButton) {
      toggleButton.addEventListener('click', togglePlay);
    }
    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }
    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }

    video.addEventListener('click', togglePlay);
    video.addEventListener('play', setPlayingState);
    video.addEventListener('pause', setPlayingState);
    video.addEventListener('ended', setPlayingState);
    video.addEventListener('waiting', function () {
      setLoading(true);
    });
    video.addEventListener('playing', function () {
      setLoading(false);
      setPlayingState();
    });

    setPlayingState();
  });
})();
