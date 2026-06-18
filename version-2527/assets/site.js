function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function setupMenu() {
  const button = document.querySelector("[data-menu-button]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!button || !menu) return;
  button.addEventListener("click", () => {
    menu.classList.toggle("is-open");
  });
}

function setupHero() {
  const root = document.querySelector("[data-hero]");
  if (!root) return;
  const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
  if (!slides.length) return;
  let index = 0;
  const show = next => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, current) => {
      slide.classList.toggle("is-active", current === index);
    });
    dots.forEach((dot, current) => {
      dot.classList.toggle("is-active", current === index);
    });
  };
  dots.forEach((dot, current) => {
    dot.addEventListener("click", () => show(current));
  });
  window.setInterval(() => show(index + 1), 5000);
}

function cardText(card) {
  return [
    card.dataset.title,
    card.dataset.category,
    card.dataset.year,
    card.dataset.region,
    card.dataset.type,
    card.textContent
  ].join(" ").toLowerCase();
}

function setupCatalogs() {
  document.querySelectorAll("[data-catalog]").forEach(catalog => {
    const search = catalog.querySelector("[data-card-search]");
    const category = catalog.querySelector("[data-card-category]");
    const sort = catalog.querySelector("[data-card-sort]");
    const list = catalog.querySelector("[data-card-list]");
    if (!list) return;
    const cards = Array.from(list.querySelectorAll("[data-card]"));
    const original = cards.slice();
    const apply = () => {
      const keyword = search ? search.value.trim().toLowerCase() : "";
      const selected = category ? category.value : "";
      cards.forEach(card => {
        const matchedKeyword = !keyword || cardText(card).includes(keyword);
        const matchedCategory = !selected || card.dataset.category === selected;
        card.classList.toggle("is-filtered", !(matchedKeyword && matchedCategory));
      });
      const mode = sort ? sort.value : "default";
      const visible = original.filter(card => !card.classList.contains("is-filtered"));
      const hidden = original.filter(card => card.classList.contains("is-filtered"));
      if (mode === "score") {
        visible.sort((a, b) => Number(b.dataset.score || 0) - Number(a.dataset.score || 0));
      } else if (mode === "year") {
        visible.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
      }
      [...visible, ...hidden].forEach(card => list.appendChild(card));
    };
    if (search) search.addEventListener("input", apply);
    if (category) category.addEventListener("change", apply);
    if (sort) sort.addEventListener("change", apply);
  });
}

ready(() => {
  setupMenu();
  setupHero();
  setupCatalogs();
});
