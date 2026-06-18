(function () {
  var ready = function (fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  ready(function () {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      var button = shell.querySelector(".player-launch");
      var state = shell.parentElement ? shell.parentElement.querySelector(".player-state") : null;
      var started = false;
      var hlsInstance = null;

      var setState = function (text) {
        if (state) {
          state.textContent = text || "";
        }
      };

      var start = function () {
        if (!video || started) {
          if (video) {
            video.play().catch(function () {});
          }
          return;
        }

        started = true;
        setState("正在加载...");

        if (overlay) {
          overlay.classList.add("is-hidden");
        }

        var url = video.getAttribute("data-video");

        if (!url) {
          setState("暂时无法播放");
          return;
        }

        var playVideo = function () {
          video.play().then(function () {
            setState("");
          }).catch(function () {
            setState("点击视频继续播放");
          });
        };

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          playVideo();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setState("播放暂时不可用，请稍后再试");
            }
          });
          return;
        }

        video.src = url;
        playVideo();
      };

      if (button) {
        button.addEventListener("click", start);
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            start();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  });
})();
