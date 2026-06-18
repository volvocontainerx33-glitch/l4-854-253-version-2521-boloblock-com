import { H as Hls } from "./hls.js";

export function initMoviePlayer(streamUrl) {
  var video = document.querySelector("[data-player-video]");
  var cover = document.querySelector("[data-player-button]");
  var hls = null;

  if (!video || !streamUrl) {
    return;
  }

  function bindStream() {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        }
      });
      return;
    }

    video.src = streamUrl;
  }

  function hideCover() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  }

  function showCover() {
    if (cover && video.paused) {
      cover.classList.remove("is-hidden");
    }
  }

  function playMovie() {
    hideCover();
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        showCover();
      });
    }
  }

  bindStream();

  if (cover) {
    cover.addEventListener("click", playMovie);
  }

  video.addEventListener("play", hideCover);
  video.addEventListener("pause", showCover);
  video.addEventListener("ended", showCover);
  video.addEventListener("click", function () {
    if (video.paused) {
      playMovie();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
