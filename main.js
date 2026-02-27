(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Footer year
  const year = $("#js-year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Mobile nav toggle
  const toggle = $("#js-nav-toggle");
  const links = $("#js-nav-links");
  if (toggle && links) {
    const setOpen = (open) => {
      links.dataset.open = open ? "true" : "false";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };

    setOpen(false);

    toggle.addEventListener("click", () => {
      const open = links.dataset.open !== "true";
      setOpen(open);
    });

    $$("#js-nav-links a").forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  // Intersection reveals
  const revealEls = $$(".reveal");
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.14 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // Smooth scroll for on-page anchors (keeps focus for accessibility)
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href.length < 2) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      setTimeout(() => target.removeAttribute("tabindex"), 500);
      history.replaceState(null, "", href);
    });
  });

  // Portfolio filters (no-op on pages without these elements)
  const filters = $$(".chip[data-filter]");
  const tiles = $$(".tile[data-category]");
  if (filters.length && tiles.length) {
    const apply = (category) => {
      tiles.forEach((t) => {
        const match = category === "all" || t.dataset.category === category;
        t.style.display = match ? "" : "none";
      });
    };

    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        apply(btn.dataset.filter || "all");
      });
    });
  }
})();

