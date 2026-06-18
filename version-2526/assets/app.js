(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  selectAll("[data-hero]").forEach(function (hero) {
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
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

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  selectAll("[data-filter-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-filter-input]");
    var year = scope.querySelector("[data-filter-year]");
    var list = scope.parentElement.querySelector("[data-filter-list]");
    var cards = list ? selectAll("[data-card]", list) : [];

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.textContent
        ].join(" ").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !selectedYear || cardYear === selectedYear;
        card.style.display = matchedKeyword && matchedYear ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (year) {
      year.addEventListener("change", applyFilter);
    }
  });

  function createResultCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      '<a href="' + movie.url + '" class="card-cover" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="badge">' + escapeHtml(movie.region) + '</span>',
      '<span class="play-badge">▶</span>',
      '</a>',
      '<div class="card-body">',
      '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
      '<p class="card-meta">' + escapeHtml(movie.meta) + '</p>',
      '<p class="card-text">' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '</div>'
    ].join("");
    return article;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character];
    });
  }

  var searchForm = document.querySelector("[data-search-form]");
  var searchInput = document.querySelector("[data-search-input]");
  var searchResults = document.querySelector("[data-search-results]");

  function runSearch(value) {
    if (!searchResults || !window.SEARCH_MOVIES) {
      return;
    }
    var keyword = String(value || "").trim().toLowerCase();
    searchResults.innerHTML = "";
    if (!keyword) {
      return;
    }
    window.SEARCH_MOVIES.filter(function (movie) {
      return movie.searchText.indexOf(keyword) !== -1;
    }).slice(0, 96).forEach(function (movie) {
      searchResults.appendChild(createResultCard(movie));
    });
  }

  if (searchForm && searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || params.get("tag") || "";
    searchInput.value = initial;
    runSearch(initial);

    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      runSearch(searchInput.value);
    });

    searchInput.addEventListener("input", function () {
      runSearch(searchInput.value);
    });

    selectAll("[data-search-chip]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        searchInput.value = chip.getAttribute("data-search-chip") || "";
        runSearch(searchInput.value);
      });
    });
  }

  window.initMoviePlayer = function (playerId, source) {
    var player = document.getElementById(playerId);
    if (!player || !source) {
      return;
    }

    var video = player.querySelector("video");
    var overlay = player.querySelector("[data-play-overlay]");
    if (!video) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      player.hlsInstance = hls;
    } else {
      video.src = source;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function playVideo() {
      hideOverlay();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("play", hideOverlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
  };
})();
