import { H as Hls } from './hls.js';

const players = Array.from(document.querySelectorAll('video[data-hls-src]'));

players.forEach((video) => {
  const source = video.dataset.hlsSrc;
  const box = video.closest('.player-box');
  const status = box ? box.querySelector('[data-player-status]') : null;
  const button = box ? box.querySelector('[data-play-button]') : null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  if (!source) {
    setStatus('当前影片暂时无法播放。');
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setStatus('播放器已就绪，点击播放。');
    });
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data && data.fatal) {
        setStatus('播放器载入异常，可刷新页面后重试。');
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    setStatus('播放器已就绪，点击播放。');
  } else {
    video.src = source;
    setStatus('浏览器可能需要更新后才能播放。');
  }

  if (button) {
    button.addEventListener('click', () => {
      video.play().catch(() => {
        setStatus('浏览器阻止了自动播放，请使用播放器控件播放。');
      });
    });
  }

  video.addEventListener('play', () => {
    if (box) {
      box.classList.add('is-playing');
    }
  });

  video.addEventListener('pause', () => {
    if (box) {
      box.classList.remove('is-playing');
    }
  });
});
