import { H as Hls } from "./hls-vendor-dru42stk.js";

export function initPlayer(videoId, sourceUrl, buttonId) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  if (!video || !button || !sourceUrl) return;
  let prepared = false;
  let requested = false;
  let hls = null;
  const prepare = () => {
    if (prepared) return;
    prepared = true;
    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (requested) video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data && data.fatal && hls) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        }
      });
    } else {
      video.src = sourceUrl;
    }
  };
  const start = () => {
    requested = true;
    prepare();
    button.classList.add("is-hidden");
    video.controls = true;
    video.play().catch(() => {});
  };
  button.addEventListener("click", start);
  video.addEventListener("play", () => {
    button.classList.add("is-hidden");
  });
}
