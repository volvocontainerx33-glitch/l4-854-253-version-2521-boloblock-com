(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
  }

  var filterInput = document.querySelector('[data-card-filter]');
  var cardList = document.querySelector('[data-card-list]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter(value) {
    if (!cardList) {
      return;
    }
    var keyword = normalize(value);
    var cards = cardList.querySelectorAll('.movie-card, .rank-card');
    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
      card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
    });
  }

  if (filterInput && cardList) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query) {
      filterInput.value = query;
      applyFilter(query);
    }
    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }
})();
