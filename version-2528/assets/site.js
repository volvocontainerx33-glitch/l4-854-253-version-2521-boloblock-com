(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function setupMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var mobileNav = document.querySelector('.mobile-nav');
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            mobileNav.hidden = expanded;
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (!slides.length || !dots.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                stop();
            } else {
                start();
            }
        });

        show(0);
        start();
    }

    function normalize(text) {
        return (text || '').toString().trim().toLowerCase();
    }

    function setupFilters() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-filter-scope]'), function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var yearSelect = scope.querySelector('[data-year-filter]');
            var categorySelect = scope.querySelector('[data-category-filter]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var count = scope.querySelector('[data-filter-count]');

            function apply() {
                var query = normalize(input ? input.value : '');
                var year = yearSelect ? yearSelect.value : '';
                var category = categorySelect ? categorySelect.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.genre,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.tags
                    ].join(' '));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesYear = !year || card.dataset.year === year;
                    var matchesCategory = !category || card.dataset.category === category;
                    var shouldShow = matchesQuery && matchesYear && matchesCategory;
                    card.classList.toggle('is-hidden', !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '共 ' + visible + ' 部影片';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener('change', apply);
            }
            if (categorySelect) {
                categorySelect.addEventListener('change', apply);
            }

            var params = new URLSearchParams(window.location.search);
            var keyword = params.get('q');
            if (keyword && input) {
                input.value = keyword;
            }
            apply();
        });
    }

    function setupPlayers() {
        Array.prototype.forEach.call(document.querySelectorAll('.player-shell'), function (shell) {
            var button = shell.querySelector('.play-button');
            var video = shell.querySelector('video');
            var status = shell.querySelector('.player-status');
            var source = shell.dataset.video;

            if (!button || !video || !source) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setStatus('浏览器阻止了自动播放，请再次点击视频播放。');
                    });
                }
            }

            function initialize() {
                shell.classList.add('is-playing');
                setStatus('正在加载在线播放源...');

                if (shell.dataset.ready === 'true') {
                    playVideo();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        shell.dataset.ready = 'true';
                        setStatus('播放源加载完成。');
                        playVideo();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus('播放源暂时无法加载，请稍后重试。');
                        }
                    });
                    shell._hls = hls;
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        shell.dataset.ready = 'true';
                        setStatus('播放源加载完成。');
                        playVideo();
                    }, { once: true });
                    return;
                }

                setStatus('当前浏览器暂不支持此在线播放源。');
            }

            button.addEventListener('click', initialize);
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
