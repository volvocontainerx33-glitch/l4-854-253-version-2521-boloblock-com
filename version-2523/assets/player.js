(function () {
  function startPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var source = player.getAttribute('data-stream');

    if (!video || !source) {
      return;
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    if (player.getAttribute('data-ready') === '1') {
      video.play().catch(function () {});
      return;
    }

    player.setAttribute('data-ready', '1');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        }
      });
      player._hls = hls;
      return;
    }

    video.src = source;
    video.play().catch(function () {});
  }

  document.addEventListener('DOMContentLoaded', function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

    players.forEach(function (player) {
      var overlay = player.querySelector('.player-overlay');
      var button = player.querySelector('.player-start');
      var video = player.querySelector('video');

      if (overlay) {
        overlay.addEventListener('click', function () {
          startPlayer(player);
        });
      }

      if (button && button !== overlay) {
        button.addEventListener('click', function () {
          startPlayer(player);
        });
      }

      if (video) {
        video.addEventListener('click', function () {
          if (player.getAttribute('data-ready') !== '1') {
            startPlayer(player);
          }
        });
      }
    });
  });
}());
