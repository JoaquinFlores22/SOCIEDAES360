/* Cotizador de 3 pasos (sociedades.html). Manda el resumen por WhatsApp y
   registra el lead en un Google Sheet vía Apps Script. */

const WA = "5491159203177";
const SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbzEsgu_aO-8Shdkbk8UNSdqvfE3OWJ-ftDuc9m20f0exgo0uGxjHaLo1qIZ9vhtcAtQew/exec";

const MIN_CAPITAL = { SAS: 704800, SRL: 300000, SA: 30000000 };
const fmt = (n) => new Intl.NumberFormat("es-AR").format(n);

/* ---- Filtro de actividad (objeto social) --------------------------------
   La "Actividad principal" va al objeto social de la sociedad. Rechazamos
   términos de actividades que la IGJ / DPPJ no inscribe. */
const ACTIVIDAD_BLOQUEADA = [
  "droga", "narcotraf", "estupefacient", "cocaina", "marihuana", "cannabis",
  "arma de fuego", "armas de fuego", "municion", "explosiv",
  "trata de persona", "explotacion sexual", "prostitu", "pornografia infantil",
  "sicario", "asesinato", "secuestro", "extorsion",
  "lavado de dinero", "lavado de activos", "esquema ponzi", "estafa piramidal",
  "contrabando", "trafico de organos", "venta de organos",
];
const normaliza = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function actividadPermitida(texto) {
  const t = normaliza(texto || "");
  return !ACTIVIDAD_BLOQUEADA.some((p) => t.includes(p));
}
window.cerrarModalCompliance = () =>
  document.getElementById("compliance-modal")?.classList.add("hidden");

const data = {
  society: "",
  jurisdiction: "",
  capital: 0,
  activity: "",
  partners: 1,
  managers: 1,
  name: "",
  phone: "",
  email: "",
};
let step = 1;

/* ---- Paso 1: selección de cards --------------------------------------- */
function selectOption(el, key, value) {
  if (!el) return;
  el.parentElement.querySelectorAll(".option-card").forEach((c) => c.classList.remove("is-active"));
  el.classList.add("is-active", "is-popping");
  el.addEventListener("animationend", () => el.classList.remove("is-popping"), { once: true });
  data[key] = value;
  refreshStep1Button();
}
window.selectOption = selectOption;

function refreshStep1Button() {
  const btn = document.getElementById("toStep2");
  if (!btn) return;
  const lang = localStorage.getItem("preferred_lang") || "es";
  const ready = data.society && data.jurisdiction;
  btn.disabled = !ready;
  btn.classList.toggle("opacity-40", !ready);
  btn.classList.toggle("cursor-not-allowed", !ready);
  btn.textContent = ready
    ? lang === "en" ? "Next" : "Siguiente"
    : lang === "en" ? "Select jurisdiction" : "Seleccioná jurisdicción";
}

/* ---- Paso 2: capital ------------------------------------------------- */
function onCapitalInput() {
  const input = document.getElementById("capital");
  const warn = document.getElementById("capitalWarn");
  const next = document.getElementById("toStep3");
  if (!input) return;

  const digits = input.value.replace(/\D/g, "");
  input.value = digits ? fmt(digits) : "";
  data.capital = parseInt(digits) || 0;

  const min = MIN_CAPITAL[data.society] || 0;
  const ok = data.capital >= min;
  if (warn) {
    warn.textContent = ok ? "✅ Monto válido" : `⚠️ Mínimo para ${data.society}: $${fmt(min)}`;
    warn.classList.toggle("text-emerald-400", ok);
    warn.classList.toggle("text-amber-400", !ok);
  }
  if (next) {
    next.disabled = !ok;
    next.classList.toggle("opacity-40", !ok);
    next.classList.toggle("cursor-not-allowed", !ok);
  }
}
window.onCapitalInput = onCapitalInput;

/* ---- Navegación ---------------------------------------------------- */
function goToStep(n) {
  document.getElementById(`step${step}`)?.classList.add("hidden");
  step = n;
  document.getElementById(`step${step}`)?.classList.remove("hidden");

  const line = document.getElementById("progress-line");
  const num = document.getElementById("step-number");
  if (line) line.style.width = `${(step / 3) * 100}%`;
  if (num) num.textContent = String(step).padStart(2, "0");

  if (step === 3) buildSummary();
  document.getElementById("wizard")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function nextStep() {
  if (step === 1 && (!data.society || !data.jurisdiction)) return;
  if (step === 2) {
    const min = MIN_CAPITAL[data.society] || 0;
    if (data.capital < min) return;
    const activity = document.getElementById("activity")?.value || "";
    if (!actividadPermitida(activity)) {
      document.getElementById("compliance-modal")?.classList.remove("hidden");
      return;
    }
    data.partners = document.getElementById("partners")?.value || 1;
    data.managers = document.getElementById("managers")?.value || 1;
    data.activity = activity;
  }
  if (step < 3) goToStep(step + 1);
}
function prevStep() {
  if (step > 1) goToStep(step - 1);
}
window.nextStep = nextStep;
window.prevStep = prevStep;

/* ---- Paso 3: resumen + envío -------------------------------------- */
function buildSummary() {
  const box = document.getElementById("summary");
  if (!box) return;
  box.value =
    `SOLICITUD: ${data.society}\n` +
    `JURISDICCIÓN: ${data.jurisdiction}\n` +
    `CAPITAL: $${fmt(data.capital)}\n` +
    `SOCIOS / GERENTES: ${data.partners} / ${data.managers}\n` +
    `ACTIVIDAD: ${data.activity || "—"}`;
}

function saveLead() {
  try {
    const params = new URLSearchParams({
      society: data.society,
      jurisdiction: data.jurisdiction,
      capital: data.capital,
      activity: data.activity,
      name: data.name,
      phone: data.phone,
      email: data.email,
      origin: "cotizador_web",
      t: Date.now().toString(),
    });
    const url = `${SHEETS_URL}?${params.toString()}`;
    // GET fire-and-forget: pega en doGet(e) del Apps Script (e.parameter trae
    // todos estos campos). keepalive por si el navegador intenta cancelarlo al
    // abrir WhatsApp. Antes esto usaba navigator.sendBeacon(url), que manda un
    // POST sin body: Google lo rechaza con 411 y el lead nunca llegaba.
    fetch(url, { method: "GET", mode: "no-cors", keepalive: true }).catch(() => {
      new Image().src = url;
    });
  } catch (e) {
    console.error("lead:", e);
  }
}

function sendWhatsApp() {
  const name = document.getElementById("userName")?.value.trim();
  const phone = document.getElementById("userPhone")?.value.trim();
  const email = document.getElementById("userEmail")?.value.trim();
  if (!name || !phone || !email) {
    alert("Completá nombre, email y teléfono.");
    return;
  }
  Object.assign(data, { name, phone, email });
  saveLead();
  if (typeof window.trackContacto === "function") window.trackContacto();

  const msg = encodeURIComponent(
    `Hola Sociedades360! 👋\n\n${document.getElementById("summary")?.value || ""}\n\n` +
      `👤 ${data.name}\n📱 ${data.phone}\n✉️ ${data.email}`
  );

  // Confirmación visual (los campos se "asientan" y el botón muestra el check)
  // antes de abrir WhatsApp — ver #step3.is-confirming en src/input.css.
  const step3 = document.getElementById("step3");
  const btn = document.getElementById("sendBtn");
  step3?.classList.add("is-confirming");
  btn?.classList.add("is-sent");
  window.setTimeout(() => {
    window.open(`https://wa.me/${WA}?text=${msg}`, "_blank", "noopener");
  }, 260);
  window.setTimeout(() => {
    step3?.classList.remove("is-confirming");
    btn?.classList.remove("is-sent");
  }, 1600);
}
window.sendWhatsApp = sendWhatsApp;

/* ---- Init -------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("capital")?.addEventListener("input", onCapitalInput);

  const type = new URLSearchParams(location.search).get("type");
  if (type) {
    const target = type.replace(/\./g, "").toUpperCase();
    document.querySelectorAll("#step1 .option-card").forEach((card) => {
      if (card.dataset.value === target) selectOption(card, "society", target);
    });
  }
  refreshStep1Button();
});
