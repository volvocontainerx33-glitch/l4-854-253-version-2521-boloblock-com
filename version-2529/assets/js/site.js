(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            panel.hidden = expanded;
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        show(0);
        start();
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var grid = document.querySelector('[data-card-grid]');
        if (!panel || !grid) {
            return;
        }
        var search = panel.querySelector('[data-search-input]');
        var selects = selectAll('[data-filter]', panel);
        var reset = panel.querySelector('[data-filter-reset]');
        var emptyState = document.querySelector('[data-empty-state]');
        var cards = selectAll('.movie-card', grid).concat(selectAll('.ranking-card', grid));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && search) {
            search.value = query;
        }
        function apply() {
            var term = normalize(search ? search.value : '');
            var activeFilters = {};
            selects.forEach(function (select) {
                activeFilters[select.getAttribute('data-filter')] = normalize(select.value);
            });
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matched = !term || haystack.indexOf(term) !== -1;
                Object.keys(activeFilters).forEach(function (key) {
                    var value = activeFilters[key];
                    if (value && normalize(card.getAttribute('data-' + key)).indexOf(value) === -1) {
                        matched = false;
                    }
                });
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }
        if (search) {
            search.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        if (reset) {
            reset.addEventListener('click', function () {
                if (search) {
                    search.value = '';
                }
                selects.forEach(function (select) {
                    select.value = '';
                });
                apply();
            });
        }
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initFilters();
    });
}());
