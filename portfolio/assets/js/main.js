(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const isTouchDevice = window.matchMedia?.("(pointer: coarse)")?.matches || "ontouchstart" in window;

  /** Paste your GitHub username only (e.g. "octocat"), not the full URL. */
  const PROFILE = {
    linkedin: "https://www.linkedin.com/in/dabhi-hemraj-704147171/",
    githubUsername: "",
  };

  function wireSocialLinks() {
    const gh = PROFILE.githubUsername?.trim();
    const ghHref = gh ? `https://github.com/${encodeURIComponent(gh)}` : null;
    for (const a of $$("[data-social='linkedin']")) {
      a.href = PROFILE.linkedin;
    }
    for (const a of $$("[data-social='github']")) {
      if (ghHref) a.href = ghHref;
    }
    if (ghHref && !document.querySelector('link[rel="me"][href^="https://github.com/"]')) {
      const link = document.createElement("link");
      link.rel = "me";
      link.href = ghHref;
      document.head.appendChild(link);
    }
  }
  wireSocialLinks();

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Theme
  const THEME_KEY = "portfolio_theme";
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");
  const stored = localStorage.getItem(THEME_KEY);
  const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  const initialTheme = stored || (systemDark ? "dark" : "light");
  setTheme(initialTheme);

  themeToggle?.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  function setTheme(theme) {
    root.dataset.theme = theme;
    // If not set, some browsers treat empty as "auto"
    root.style.colorScheme = theme === "light" ? "light" : "dark";
  }

  // Mobile nav
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");
  const navLinks = $$(".nav__link", navMenu || document);

  function closeNav() {
    navToggle?.setAttribute("aria-expanded", "false");
    navMenu?.classList.remove("is-open");
  }
  function openNav() {
    navToggle?.setAttribute("aria-expanded", "true");
    navMenu?.classList.add("is-open");
  }

  navToggle?.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeNav() : openNav();
  });
  navLinks.forEach((a) => a.addEventListener("click", closeNav));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
  document.addEventListener("click", (e) => {
    if (!navMenu || !navToggle) return;
    const t = e.target;
    if (!(t instanceof Node)) return;
    const inside = navMenu.contains(t) || navToggle.contains(t);
    if (!inside) closeNav();
  });

  // Scroll progress
  const progress = $("#scrollProgress");
  let raf = 0;
  const onScroll = () => {
    if (!progress) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const h = document.documentElement;
      const max = Math.max(1, h.scrollHeight - h.clientHeight);
      const pct = (h.scrollTop / max) * 100;
      progress.style.width = `${pct}%`;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  const revealEls = $$(".reveal");
  if (!prefersReduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    revealEls.forEach((el, idx) => {
      // slight stagger on first view
      el.style.transitionDelay = `${Math.min(240, idx * 35)}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Magnetic buttons (subtle) - disabled on touch devices
  const magnets = $$(".magnetic");
  if (!prefersReduced && !isTouchDevice) {
    magnets.forEach((el) => {
      const strength = 10;
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const dx = (x / rect.width) * strength;
        const dy = (y / rect.height) * strength;
        el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "translate3d(0,0,0)";
      });
    });
  }

  // Project card hover spotlight
  $$(".projectCard").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${mx}%`);
      card.style.setProperty("--my", `${my}%`);
    });
  });

  // Hero tilt card - disabled on touch devices
  const tilt = $("#tiltCard");
  const shine = $("#cardShine");
  if (tilt && !prefersReduced && !isTouchDevice) {
    const frame = tilt.querySelector(".card3d__frame");
    const maxRot = 9;
    const onMove = (e) => {
      const rect = tilt.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * -2 * maxRot;
      const ry = (px - 0.5) * 2 * maxRot;
      frame.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      if (shine) {
        const sx = Math.round(px * 100);
        const sy = Math.round(py * 100);
        shine.style.background = `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,.22), transparent 42%)`;
      }
    };
    const reset = () => {
      frame.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
      if (shine) shine.style.background = "";
    };
    tilt.addEventListener("mousemove", onMove);
    tilt.addEventListener("mouseleave", reset);
  }

  // Sparkline (tiny animated SVG)
  const sparkHost = $("#sparkline");
  if (sparkHost) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 40");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.position = "absolute";
    svg.style.inset = "0";
    svg.style.padding = "10px";

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "rgba(255,255,255,.86)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");

    const glow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    glow.setAttribute("fill", "none");
    glow.setAttribute("stroke", "rgba(124,92,255,.65)");
    glow.setAttribute("stroke-width", "6");
    glow.setAttribute("opacity", "0.35");
    glow.setAttribute("stroke-linecap", "round");
    glow.setAttribute("stroke-linejoin", "round");

    svg.appendChild(glow);
    svg.appendChild(path);
    sparkHost.appendChild(svg);

    const base = [10, 14, 12, 18, 17, 22, 20, 26, 24, 28, 26, 30];
    let t = 0;
    const draw = () => {
      const pts = base.map((v, i) => {
        const wobble = Math.sin((t + i) * 0.9) * 2.2 + Math.cos((t + i) * 0.45) * 1.2;
        return clamp(v + wobble, 8, 32);
      });
      const d = toSmoothPath(pts);
      path.setAttribute("d", d);
      glow.setAttribute("d", d);
      t += 0.11;
      if (!prefersReduced) requestAnimationFrame(draw);
    };
    draw();
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function toSmoothPath(values) {
    const n = values.length;
    const step = 100 / (n - 1);
    const pts = values.map((v, i) => ({
      x: i * step,
      y: 40 - (v / 32) * 34 - 3,
    }));

    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx.toFixed(2)} ${p0.y.toFixed(2)}, ${cx.toFixed(2)} ${p1.y.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
    }
    return d;
  }

  // Contact form -> saved via PHP/MySQL (api/contact_submit.php)
  const form = $("#contactForm");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const note = $("#formNote");
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();
    const submitBtn = form.querySelector('button[type="submit"]');

    const setLoading = (loading) => {
      if (submitBtn) submitBtn.disabled = loading;
      if (note) {
        note.textContent = loading ? "Sending…" : note.textContent;
      }
    };

    setLoading(true);
    if (note) note.textContent = "Sending…";

    try {
      const res = await fetch(new URL("api/contact_submit.php", window.location.href), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong. Try again later.");
      }
      form.reset();
      if (note) note.textContent = "Thanks — your message was saved. I’ll get back to you soon.";
    } catch (err) {
      if (note) {
        note.textContent =
          err instanceof Error ? err.message : "Could not send. Check Apache/MySQL and database setup.";
      }
    } finally {
      setLoading(false);
    }
  });

  // Resume link helper
  $("#downloadResume")?.addEventListener("click", (e) => {
    // prevent dead link; user can replace with a real PDF
    e.preventDefault();
    const note = $("#formNote");
    if (note) note.textContent = "Add your resume PDF to assets/ and update the resume link.";
  });
})();
