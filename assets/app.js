/* Sociedades360 — chrome compartido: tema, menú móvil, dropdown de idioma, i18n.
   Antes esto vivía duplicado en index.js y sociedades.js. Ahora un solo archivo
   en todas las páginas. El cotizador tiene su lógica aparte en cotizador.js. */

const WHATSAPP = "5491159203177";

/* ---- Tema (oscuro por defecto; el toggle guarda 'light'/'dark') ---------- */
function initTheme() {
  const root = document.documentElement;
  // El HTML ya viene con class="dark". Solo lo sacamos si el usuario eligió claro.
  if (localStorage.theme === "light") root.classList.remove("dark");

  const paint = () => {
    const dark = root.classList.contains("dark");
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
      b.textContent = dark ? "☀️" : "🌙";
      b.setAttribute("aria-label", dark ? "Activar modo claro" : "Activar modo oscuro");
    });
  };
  paint();

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) =>
    btn.addEventListener("click", () => {
      root.classList.toggle("dark");
      localStorage.theme = root.classList.contains("dark") ? "dark" : "light";
      paint();
    })
  );
}

/* ---- Menú móvil (overlay) ----------------------------------------------- */
function initMobileMenu() {
  const btn = document.getElementById("menu-btn");
  const menu = document.getElementById("mobile-menu");
  const path = document.getElementById("menu-path");
  if (!btn || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle("hidden", !open);
    document.body.style.overflow = open ? "hidden" : "";
    btn.setAttribute("aria-expanded", String(open));
    if (path)
      path.setAttribute("d", open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7");
  };

  btn.addEventListener("click", () => setOpen(menu.classList.contains("hidden")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));
}

/* ---- Dropdown de idioma ----------------------------------------------- */
function initLangDropdown() {
  const btn = document.getElementById("lang-menu-btn");
  const menu = document.getElementById("lang-dropdown");
  if (!btn || !menu) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("hidden");
  });
  document.addEventListener("click", () => menu.classList.add("hidden"));
}

/* ---- i18n ------------------------------------------------------------- */
async function changeLanguage(lang) {
  try {
    const res = await fetch(`./locales/${lang}.json`);
    if (!res.ok) throw new Error("locale " + lang);
    const dict = await res.json();

    localStorage.setItem("preferred_lang", lang);
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const val = el
        .getAttribute("data-i18n")
        .split(".")
        .reduce((o, k) => (o == null ? null : o[k]), dict);
      if (val == null) return;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.placeholder = val;
      else el.innerHTML = val;
    });

    document.querySelectorAll("[data-lang-flag]").forEach((n) => (n.textContent = lang === "en" ? "US" : "AR"));
    document.querySelectorAll("[data-lang-code]").forEach((n) => (n.textContent = lang.toUpperCase()));
    document.getElementById("lang-dropdown")?.classList.add("hidden");
  } catch (e) {
    console.error("i18n:", e);
  }
}
window.changeLanguage = changeLanguage;

/* ---- WhatsApp helper (usado por las cards de servicios) ---------------- */
window.contactService = (service) => {
  const msg = `Hola Sociedades360, quiero consultar sobre: ${service}`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
};

/* ---- Año dinámico en el footer --------------------------------------- */
function initYear() {
  const y = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach((n) => (n.textContent = y));
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMobileMenu();
  initLangDropdown();
  initYear();
  changeLanguage(localStorage.getItem("preferred_lang") || "es");
});
