(function () {
  var ready = function (fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("form[data-search-path]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : "";

        if (!value) {
          event.preventDefault();
          return;
        }

        event.preventDefault();
        window.location.href = form.getAttribute("data-search-path") + "?q=" + encodeURIComponent(value);
      });
    });

    document.querySelectorAll(".hero").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
      var current = 0;

      if (slides.length < 2) {
        return;
      }

      var activate = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          activate(index);
        });
      });

      window.setInterval(function () {
        activate(current + 1);
      }, 5600);
    });

    var filterPanel = document.querySelector(".filter-panel");

    if (filterPanel) {
      var textInput = filterPanel.querySelector('[data-filter="text"]');
      var genreSelect = filterPanel.querySelector('[data-filter="genre"]');
      var yearSelect = filterPanel.querySelector('[data-filter="year"]');
      var sortSelect = filterPanel.querySelector('[data-filter="sort"]');
      var grid = document.querySelector(".filter-grid");
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];

      var applyFilters = function () {
        var query = textInput ? textInput.value.trim().toLowerCase() : "";
        var genre = genreSelect ? genreSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var sort = sortSelect ? sortSelect.value : "default";

        cards.forEach(function (card) {
          var title = (card.dataset.title || "").toLowerCase();
          var cardGenre = card.dataset.genre || "";
          var cardYear = card.dataset.year || "";
          var cardRegion = (card.dataset.region || "").toLowerCase();
          var visible = true;

          if (query && title.indexOf(query) === -1 && cardGenre.toLowerCase().indexOf(query) === -1 && cardRegion.indexOf(query) === -1) {
            visible = false;
          }

          if (genre && cardGenre.indexOf(genre) === -1) {
            visible = false;
          }

          if (year && cardYear !== year) {
            visible = false;
          }

          card.style.display = visible ? "" : "none";
        });

        if (grid && sort !== "default") {
          var sorted = cards.slice().sort(function (a, b) {
            if (sort === "year-desc") {
              return (parseInt(b.dataset.year, 10) || 0) - (parseInt(a.dataset.year, 10) || 0);
            }
            if (sort === "year-asc") {
              return (parseInt(a.dataset.year, 10) || 0) - (parseInt(b.dataset.year, 10) || 0);
            }
            return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
          });

          sorted.forEach(function (card) {
            grid.appendChild(card);
          });
        }
      };

      [textInput, genreSelect, yearSelect, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });
    }

    var searchInput = document.querySelector("#searchInput");
    var searchResults = document.querySelector("#searchResults");
    var searchNote = document.querySelector("#searchNote");

    if (searchInput && searchResults && window.MOVIE_SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      searchInput.value = initialQuery;

      var renderResults = function () {
        var query = searchInput.value.trim().toLowerCase();
        var source = window.MOVIE_SEARCH_INDEX;
        var results = query ? source.filter(function (movie) {
          return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase().indexOf(query) !== -1;
        }) : source.slice(0, 24);

        results = results.slice(0, 120);
        searchResults.innerHTML = "";

        if (searchNote) {
          searchNote.textContent = query ? "为你匹配到以下相关影视内容" : "可输入片名、地区、题材或年份进行搜索";
        }

        if (!results.length) {
          searchResults.innerHTML = '<div class="no-result">没有找到匹配内容，可以换一个关键词再试。</div>';
          return;
        }

        var html = results.map(function (movie) {
          return [
            '<article class="movie-card">',
            '<a class="movie-poster" href="movie/movie-' + movie.id + '.html">',
            '<img loading="lazy" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
            '<span class="play-chip">播放</span>',
            '</a>',
            '<div class="movie-body">',
            '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '<h3><a href="movie/movie-' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
            '</div>',
            '</article>'
          ].join("");
        }).join("");

        searchResults.innerHTML = html;
      };

      var escapeHtml = function (value) {
        return String(value).replace(/[&<>"']/g, function (char) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
          }[char];
        });
      };

      var searchButton = document.querySelector(".search-box button");

      if (searchButton) {
        searchButton.addEventListener("click", renderResults);
      }

      searchInput.addEventListener("input", renderResults);
      renderResults();
    }
  });
})();
