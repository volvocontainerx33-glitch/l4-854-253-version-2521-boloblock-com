(function () {
  function setup(frame) {
    var video = frame.querySelector('video[data-video-src]');
    var button = frame.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-video-src');
    var initialized = false;

    function init() {
      if (initialized || !source) {
        return;
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          frame.classList.add('is-ready');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
        frame.hlsPlayer = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          frame.classList.add('is-ready');
        });
      } else {
        video.src = source;
        frame.classList.add('is-ready');
      }
    }

    init();

    if (button) {
      button.addEventListener('click', function () {
        init();
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      });
    }

    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      frame.classList.remove('is-playing');
    });

    video.addEventListener('ended', function () {
      frame.classList.remove('is-playing');
    });
  }

  document.querySelectorAll('[data-player]').forEach(setup);
})();
