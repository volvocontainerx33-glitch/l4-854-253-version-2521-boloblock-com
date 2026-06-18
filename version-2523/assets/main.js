(function () {
  function toggleMenu() {
    var menu = document.querySelector('[data-mobile-menu]');
    if (!menu) {
      return;
    }
    menu.classList.toggle('open');
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    if (button) {
      button.addEventListener('click', toggleMenu);
    }
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(index);
        restart();
      });
    });

    if (slides.length > 1) {
      restart();
    }
  }

  function getCardText(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-category') || '',
      card.getAttribute('data-tags') || ''
    ].join(' ').toLowerCase();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-button]'));
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var empty = scope.querySelector('[data-empty-state]');
      var activeFilter = 'all';

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = getCardText(card);
          var queryMatch = !query || haystack.indexOf(query) !== -1;
          var filterMatch = activeFilter === 'all' || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
          var show = queryMatch && filterMatch;
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = button.getAttribute('data-filter-value') || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          apply();
        });
      });

      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
}());
