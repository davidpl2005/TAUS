/* =========================================================
   TAUS — main.js (i18n split: co.js / us.js)
   - Splash
   - Hero slider
   - Reveal on scroll
   - Dropdown servicios
   - Mobile menu
   - i18n loader (carga co/us y traduce TODO lo marcado)
========================================================= */
(function () {
  "use strict";

  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ========= Año footer =========
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ========= Splash =========
  const splash = $("#splash");
  const hideSplash = () => {
    if (!splash) return;
    splash.classList.add("is-hidden");
    splash.setAttribute("aria-hidden", "true");
    setTimeout(() => (splash.style.display = "none"), prefersReduced ? 80 : 900);
  };
  window.addEventListener("load", () => {
    setTimeout(hideSplash, prefersReduced ? 120 : 900);
  });
  setTimeout(hideSplash, prefersReduced ? 900 : 4500);

  // ========= Hero slider (si existe) =========
  const heroSlides = $$(".hero__slide");
  if (heroSlides.length > 1) {
    let idx = 0;
    const intervalMs = prefersReduced ? 999999 : 6500;
    setInterval(() => {
      const cur = heroSlides[idx];
      idx = (idx + 1) % heroSlides.length;
      const nxt = heroSlides[idx];
      if (cur) cur.classList.remove("is-active");
      if (nxt) nxt.classList.add("is-active");
    }, intervalMs);
  }

  // ========= Reveal on scroll =========
  const revealEls = $$(".reveal");
  if (revealEls.length) {
    if (prefersReduced) {
      revealEls.forEach((el) => el.classList.add("is-in"));
    } else {
      const bySection = new Map();
      revealEls.forEach((el) => {
        const sec = el.closest("section") || document.body;
        const arr = bySection.get(sec) || [];
        arr.push(el);
        bySection.set(sec, arr);
      });

      bySection.forEach((arr) => {
        arr.forEach((el, i) => {
          el.style.transitionDelay = `${Math.min(i * 70, 260)}ms`;
        });
      });

      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("is-in");
            obs.unobserve(e.target);
          });
        },
        { threshold: 0.16, rootMargin: "0px 0px -12% 0px" }
      );

      revealEls.forEach((el) => io.observe(el));
    }
  }

  // ========= Dropdown Servicios =========
  const servicesBtn = $("#servicesBtn");
  const servicesMenu = $("#servicesMenu");

  const closeServices = () => {
    if (!servicesBtn || !servicesMenu) return;
    servicesBtn.setAttribute("aria-expanded", "false");
    servicesMenu.classList.remove("is-open");
  };
  const openServices = () => {
    if (!servicesBtn || !servicesMenu) return;
    servicesBtn.setAttribute("aria-expanded", "true");
    servicesMenu.classList.add("is-open");
  };
  const toggleServices = () => {
    if (!servicesMenu) return;
    servicesMenu.classList.contains("is-open") ? closeServices() : openServices();
  };

  if (servicesBtn && servicesMenu) {
    servicesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleServices();
    });

    document.addEventListener("click", (e) => {
      const t = e.target;
      const inside = servicesMenu.contains(t) || servicesBtn.contains(t);
      if (!inside) closeServices();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeServices();
    });
  }

  // ========= Mobile menu =========
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");

  const closeMobile = () => {
    if (!navToggle || !navMenu) return;
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    closeServices();
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      navMenu.classList.toggle("is-open");
      navToggle.setAttribute(
        "aria-expanded",
        navMenu.classList.contains("is-open") ? "true" : "false"
      );
    });

    $$(".nav__link", navMenu).forEach((a) => a.addEventListener("click", closeMobile));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMobile();
    });

    document.addEventListener("click", (e) => {
      if (!navMenu.classList.contains("is-open")) return;
      const t = e.target;
      const inside = navMenu.contains(t) || navToggle.contains(t);
      if (!inside) closeMobile();
    });
  }

  // =========================================================
  // i18n loader (co/us)
  // =========================================================
  let currentDict = {};

  function setActiveLangButtons(lang) {
    $$(".langBtn").forEach((b) => {
      b.classList.toggle("is-active", (b.getAttribute("data-lang") || "co") === lang);
    });
  }

  function applyTranslations(dict, lang) {
    currentDict = dict || {};
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.lang = (lang === "us") ? "en" : "es";

    // Traduce texto normal
    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      const val = currentDict[key];
      if (typeof val === "string") el.textContent = val;
    });

    // Traduce placeholders si existen
    $$("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (!key) return;
      const val = currentDict[key];
      if (typeof val === "string") el.setAttribute("placeholder", val);
    });

    setActiveLangButtons(lang);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.defer = true;
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error("No se pudo cargar: " + src));
      document.head.appendChild(s);
    });
  }

  async function loadLang(lang) {
    // Limpia dict anterior global
    delete window.TAUS_I18N;

    const path = (lang === "us")
      ? "assets/js/i18n/us.js"
      : "assets/js/i18n/co.js";

    try {
      await loadScript(path);
      const dict = window.TAUS_I18N || {};
      applyTranslations(dict, lang);

      try {
        localStorage.setItem("taus_lang", lang);
      } catch (_) {}
    } catch (err) {
      console.error(err);
      // Fallback: co
      if (lang !== "co") loadLang("co");
    }
  }

  // Click idioma
  $$(".langBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang") || "co";
      loadLang(lang);
    });
  });

  // Idioma guardado
  const saved = (() => {
    try { return localStorage.getItem("taus_lang"); } catch (_) { return null; }
  })();

  loadLang(saved || "co");

  // ========= Plataforma placeholder =========
  const btnPlataforma = $("#btnPlataforma");
  if (btnPlataforma) {
    btnPlataforma.addEventListener("click", (e) => {
      const href = btnPlataforma.getAttribute("href") || "#";
      if (href === "#") {
        e.preventDefault();
        console.log("Plataforma pendiente de integrar (login/dashboard).");
      }
    });
  }
})();
