
import Hls from './hls.js';

function bindPlayer() {
  const wrap = document.querySelector('[data-player-wrap]');
  const video = document.querySelector('[data-player-video]');
  const overlay = document.querySelector('[data-player-overlay]');
  const playBtn = document.querySelector('[data-player-play]');
  if (!wrap || !video || !overlay || !playBtn) return;

  const source = wrap.dataset.source;
  let hls;
  let started = false;

  const showPlaying = () => {
    overlay.classList.add('hide');
    started = true;
  };

  const load = () => {
    if (video.src) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      overlay.querySelector('[data-player-message]').textContent = '当前浏览器暂不支持播放';
    }
  };

  const start = async () => {
    load();
    try {
      await video.play();
      showPlaying();
    } catch (err) {
      showPlaying();
    }
  };

  playBtn.addEventListener('click', start);
  overlay.addEventListener('click', start);
  video.addEventListener('click', () => {
    if (!started) start();
  });
  video.addEventListener('play', showPlaying);
  video.addEventListener('loadeddata', () => {
    if (started) showPlaying();
  });
}

bindPlayer();
