(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var isOpen = mobileNav.hasAttribute("hidden") === false;
        if (isOpen) {
          mobileNav.setAttribute("hidden", "");
          toggle.setAttribute("aria-expanded", "false");
        } else {
          mobileNav.removeAttribute("hidden");
          toggle.setAttribute("aria-expanded", "true");
        }
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
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
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          var value = Number(dot.getAttribute("data-hero-dot") || "0");
          show(value);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      start();
    }

    var searchForms = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));
    searchForms.forEach(function (form) {
      var input = form.querySelector("input");
      var scope = form.closest("main") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var emptyState = scope.querySelector("[data-empty-state]");
      var activeField = "all";
      var activeValue = "all";

      function matches(card, query) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-type") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
        var queryPass = !query || text.indexOf(query) !== -1;
        var filterPass = true;

        if (activeValue !== "all") {
          filterPass = (card.getAttribute("data-" + activeField) || "") === activeValue;
        }

        return queryPass && filterPass;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card, query);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial) {
          input.value = initial;
        }
      }

      var group = scope.querySelector("[data-filter-group]");
      if (group) {
        group.addEventListener("click", function (event) {
          var button = event.target.closest("[data-filter-value]");
          if (!button) {
            return;
          }
          activeField = button.getAttribute("data-filter-field") || "all";
          activeValue = button.getAttribute("data-filter-value") || "all";
          Array.prototype.slice.call(group.querySelectorAll("[data-filter-value]")).forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      }

      form.addEventListener("submit", function (event) {
        if (form.hasAttribute("data-card-search")) {
          event.preventDefault();
          apply();
        }
      });

      apply();
    });
  });
})();
