// Лёгкие визуальные эффекты: подсветка за курсором и всплеск сердечек по клику.
// Ничего не ломает: только читает DOM и добавляет свои элементы.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  // Мягкое бордовое свечение следует за курсором (только на десктопе с мышью).
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.append(glow);

    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(loop);
    })();
  }

  // Всплеск сердечек из точки клика по любой кнопке или ссылке.
  addEventListener("click", (e) => {
    if (!e.target.closest("button, a")) return;
    for (let i = 0; i < 7; i++) {
      const heart = document.createElement("span");
      heart.className = "burst";
      heart.setAttribute("aria-hidden", "true");
      heart.textContent = i % 3 === 0 ? "✦" : "♡";
      const angle = (Math.PI * 2 * i) / 7 + Math.random() * 0.5;
      const dist = 42 + Math.random() * 46;
      heart.style.left = `${e.clientX}px`;
      heart.style.top = `${e.clientY}px`;
      heart.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      heart.style.setProperty("--dy", `${Math.sin(angle) * dist - 14}px`);
      document.body.append(heart);
      heart.addEventListener("animationend", () => heart.remove());
    }
  }, { passive: true });
})();
