(function () {
    var body = document.body;
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-slide-dot]'));
        var activeIndex = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        };

        var startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide-dot') || 0));
                startTimer();
            });
        });

        startTimer();
    }

    var applyFilter = function (form) {
        var container = form.closest('main') || document;
        var list = container.querySelector('[data-card-list]');
        var empty = container.querySelector('[data-empty-state]');
        if (!list) {
            return;
        }

        var input = form.querySelector('input[type="search"]');
        var select = form.querySelector('select[name="category"]');
        var query = input ? input.value.trim().toLowerCase() : '';
        var category = select ? select.value : '';
        var visible = 0;

        Array.prototype.slice.call(list.querySelectorAll('.movie-card')).forEach(function (card) {
            var searchText = card.getAttribute('data-search') || '';
            var cardCategory = card.getAttribute('data-category') || '';
            var matchedQuery = !query || searchText.indexOf(query) !== -1;
            var matchedCategory = !category || cardCategory === category;
            var matched = matchedQuery && matchedCategory;
            card.classList.toggle('is-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    };

    Array.prototype.slice.call(document.querySelectorAll('[data-search-form], [data-local-filter]')).forEach(function (form) {
        var input = form.querySelector('input[type="search"]');
        var params = new URLSearchParams(window.location.search);
        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        form.addEventListener('submit', function (event) {
            if (form.hasAttribute('data-search-form')) {
                event.preventDefault();
            }
            applyFilter(form);
        });

        Array.prototype.slice.call(form.querySelectorAll('input, select')).forEach(function (control) {
            control.addEventListener('input', function () {
                applyFilter(form);
            });
            control.addEventListener('change', function () {
                applyFilter(form);
            });
        });

        applyFilter(form);
    });

    var chipRow = document.querySelector('[data-chip-row]');
    var searchForm = document.querySelector('[data-search-form]');
    if (chipRow && searchForm) {
        var searchInput = searchForm.querySelector('input[type="search"]');
        Array.prototype.slice.call(chipRow.querySelectorAll('[data-chip]')).forEach(function (chip) {
            chip.addEventListener('click', function () {
                var value = chip.getAttribute('data-chip') || '';
                if (searchInput) {
                    searchInput.value = searchInput.value.trim().toLowerCase() === value ? '' : value;
                }
                Array.prototype.slice.call(chipRow.querySelectorAll('[data-chip]')).forEach(function (item) {
                    item.classList.toggle('is-active', item === chip && searchInput && searchInput.value);
                });
                applyFilter(searchForm);
            });
        });
    }
})();
