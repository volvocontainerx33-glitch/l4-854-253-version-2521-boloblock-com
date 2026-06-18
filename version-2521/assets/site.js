(function () {
  function getAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMobileNav() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = getAll("[data-hero-slide]");
    var dots = getAll("[data-hero-dot]");
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    var timer = null;

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
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }
    start();
  }

  function initSearchAndFilters() {
    var input = document.querySelector(".js-search");
    var grid = document.querySelector("[data-card-grid]");
    var filterButtons = getAll("[data-filter]");
    var empty = document.querySelector("[data-empty-state]");
    if (!grid) {
      return;
    }
    var activeFilter = "all";

    function apply() {
      var query = normalize(input ? input.value : "");
      var visible = 0;
      getAll(".js-card", grid).forEach(function (card) {
        var content = normalize(card.getAttribute("data-search") || card.textContent);
        var category = card.getAttribute("data-category") || "";
        var matchesQuery = query === "" || content.indexOf(query) !== -1;
        var matchesFilter = activeFilter === "all" || category === activeFilter;
        var shouldShow = matchesQuery && matchesFilter;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter") || "all";
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });
  }

  function loadHlsScript(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback);
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback);
    document.head.appendChild(script);
  }

  function initPlayer() {
    var video = document.querySelector("[data-video-player]");
    var playButton = document.querySelector("[data-player-play]");
    var shell = document.querySelector("[data-player-shell]");
    if (!video) {
      return;
    }
    var source = video.getAttribute("data-src");
    var hlsInstance = null;

    function attachSource() {
      if (!source) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playOrPause() {
      if (video.paused) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      } else {
        video.pause();
      }
    }

    function updateState() {
      if (shell) {
        shell.classList.toggle("is-playing", !video.paused);
      }
    }

    loadHlsScript(attachSource);

    if (playButton) {
      playButton.addEventListener("click", playOrPause);
    }

    video.addEventListener("play", updateState);
    video.addEventListener("pause", updateState);
    video.addEventListener("ended", updateState);

    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHero();
    initSearchAndFilters();
    initPlayer();
  });
}());
