(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (box) {
        var video = box.querySelector('video');
        var button = box.querySelector('[data-play-button]');
        var source = box.getAttribute('data-src');
        var initialized = false;
        var hlsInstance = null;

        var attachSource = function () {
            if (initialized || !video || !source) {
                return;
            }
            initialized = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        };

        var playVideo = function () {
            attachSource();
            box.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    box.classList.remove('is-playing');
                });
            }
        };

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.currentTime) {
                    box.classList.remove('is-playing');
                }
            });
            video.addEventListener('ended', function () {
                box.classList.remove('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    });
})();
