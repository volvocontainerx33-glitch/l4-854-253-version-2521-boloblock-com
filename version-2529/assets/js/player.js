(function () {
    window.initMoviePlayer = function (source) {
        var shell = document.querySelector('[data-player]');
        if (!shell || !source) {
            return;
        }
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.player-overlay');
        var loading = shell.querySelector('.player-loading');
        var message = shell.querySelector('.player-message');
        var hlsInstance = null;

        function showLoading(active) {
            if (loading) {
                loading.hidden = !active;
            }
        }

        function showMessage(text) {
            if (message) {
                message.textContent = text;
                message.hidden = false;
            }
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function attachSource() {
            showLoading(true);
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                showLoading(false);
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    showLoading(false);
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showLoading(false);
                        showMessage('播放暂时不可用');
                        if (hlsInstance) {
                            hlsInstance.destroy();
                            hlsInstance = null;
                        }
                    }
                });
                return;
            }
            showLoading(false);
            showMessage('当前浏览器暂不支持播放');
        }

        function startPlayback() {
            hideOverlay();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', function (event) {
                event.preventDefault();
                startPlayback();
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener('play', hideOverlay);
        video.addEventListener('waiting', function () {
            showLoading(true);
        });
        video.addEventListener('playing', function () {
            showLoading(false);
        });
        video.addEventListener('canplay', function () {
            showLoading(false);
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });

        attachSource();
    };
}());
