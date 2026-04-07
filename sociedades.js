// --- 1. CONFIGURACIÓN ---
const WHATSAPP_BUSINESS = '5491159203177';
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbwP9FmcBtRq-Snp2h9Tq7tZcPDFfrbIjWkBJs7Q74PMor6nomaKr2OrGMxYk-dywzKagw/exec";

const MIN_CAPITAL = { 
    'SAS': 704800, 
    'SRL': 300000, 
    'SA': 30000000 
};

let formData = {
    society: '', 
    jurisdiction: '', 
    capitalAmountARS: 0, 
    activity: '',
    partners: 1,  
    managers: 1,  
    userName: '',
    userPhone: '',
    userEmail: '',
};

let currentStep = 1;

// --- 2. LÓGICA DE SELECCIÓN Y PASOS ---

function selectOption(element, category, value) {
    if (!element) return;

    const parent = element.parentElement;
    parent.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('active', 'border-ice-blue', 'bg-white/10');
    });

    element.classList.add('active', 'border-ice-blue', 'bg-white/10');
    formData[category] = value;
    
    // --- LÓGICA DEL BOTÓN TRADUCIDO ---
    const btn = document.getElementById('toStep2');
    if (btn) {
        // Obtenemos el idioma actual (o 'es' por defecto)
        const currentLang = localStorage.getItem('preferred_lang') || 'es';
        
        if (formData.society && formData.jurisdiction) {
            btn.disabled = false;
            btn.classList.remove('opacity-20', 'cursor-not-allowed');
            // Usamos la clave del JSON para "Siguiente"
            btn.innerText = (currentLang === 'en') ? "Next" : "Siguiente";
        } else {
            // Usamos la clave del JSON para "Seleccioná Jurisdicción"
            btn.innerText = (currentLang === 'en') ? "Select Jurisdiction" : "Seleccioná Jurisdicción";
        }
    }
}
function onCapitalInput() {
    const input = document.getElementById('capital');
    const warn = document.getElementById('capitalWarnText');
    const btnToStep3 = document.getElementById('toStep3');
    if (!input) return;

    let val = input.value.replace(/\D/g, "");
    input.value = val ? new Intl.NumberFormat('es-AR').format(val) : '';
    formData.capitalAmountARS = parseInt(val) || 0;

    const minRequerido = MIN_CAPITAL[formData.society] || 0;
    if (formData.capitalAmountARS < minRequerido) {
        if(warn) warn.innerText = `⚠️ Mínimo para ${formData.society}: $${new Intl.NumberFormat('es-AR').format(minRequerido)}`;
        if(btnToStep3) {
            btnToStep3.disabled = true;
            btnToStep3.classList.add('opacity-50', 'cursor-not-allowed');
        }
    } else {
        if(warn) warn.innerText = "✅ Monto válido";
        if(btnToStep3) {
            btnToStep3.disabled = false;
            btnToStep3.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
}

function nextStep() {
    if (currentStep === 2) {
        const min = MIN_CAPITAL[formData.society] || 0;
        if (formData.capitalAmountARS < min) {
            alert("Por favor, ingresa un capital válido.");
            return;
        }
        formData.partners = document.getElementById('partners')?.value || 1;
        formData.managers = document.getElementById('managers')?.value || 1;
        formData.activity = document.getElementById('activity')?.value || '';
    }
    if (currentStep < 3) {
        document.getElementById(`step${currentStep}`).classList.add('hidden');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.remove('hidden');
        updateUI();
        if (currentStep === 3) generateSummary();
    }
}

function prevStep() {
    if (currentStep <= 1) return;
    document.getElementById(`step${currentStep}`).classList.add('hidden');
    currentStep--;
    document.getElementById(`step${currentStep}`).classList.remove('hidden');
    updateUI();
}

function updateUI() {
    const progressLine = document.getElementById('progress-line');
    const stepLabel = document.getElementById('step-label');
    if (progressLine) progressLine.style.width = `${(currentStep / 3) * 100}%`;
    if (stepLabel) stepLabel.textContent = `Paso 0${currentStep}`;
}

// --- 3. RESUMEN Y ENVÍO ---

function generateSummary() {
    const summaryArea = document.getElementById('summary');
    if (!summaryArea) return;
    summaryArea.value = 
        `SOLICITUD: ${formData.society}\n` +
        `JURISDICCIÓN: ${formData.jurisdiction}\n` +
        `CAPITAL: $${new Intl.NumberFormat('es-AR').format(formData.capitalAmountARS)}\n` +
        `SOCIOS/GERENTES: ${formData.partners}/${formData.managers}\n` +
        `ACTIVIDAD: ${formData.activity}`;
}

async function saveToSheets(data) {
    try {
        const params = new URLSearchParams({
            society: data.society,
            jurisdiction: data.jurisdiction,
            capital: data.capitalAmountARS,
            activity: data.activity,
            email: data.userEmail,
            phone: data.userPhone,
            name: data.userName,
            origin: 'cotizador_web',
            t: Date.now().toString()
        });
        // MÉTODO BEACON (El que no falla)
        const img = new Image();
        img.src = `${SHEETS_URL}?${params.toString()}`;
    } catch (e) { console.error("Error Sheets:", e); }
}

async function sendWhatsApp() {
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    const phoneInput = document.getElementById('userPhone');
    const summaryInput = document.getElementById('summary');

    if (!nameInput?.value || !emailInput?.value || !phoneInput?.value) {
        alert("Por favor, completa nombre, email y teléfono.");
        return;
    }

    formData.userName = nameInput.value;
    formData.userEmail = emailInput.value;
    formData.userPhone = phoneInput.value;

    saveToSheets(formData);

    const msg = encodeURIComponent(
        `Hola Sociedades360! 👋\n\n` +
        `${summaryInput ? summaryInput.value : 'Nueva Cotización'}\n\n` +
        `👤 Cliente: ${formData.userName}\n` +
        `📱 Tel: ${formData.userPhone}`
    );

    setTimeout(() => {
        window.open(`https://wa.me/${WHATSAPP_BUSINESS}?text=${msg}`, '_blank');
    }, 200);
}

// --- 4. INICIALIZACIÓN ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Idioma
    const savedLang = localStorage.getItem('preferred_lang') || 'es';
    if (typeof changeLanguage === "function") changeLanguage(savedLang);

    // 2. Capital
    document.getElementById('capital')?.addEventListener('input', onCapitalInput);

    // 3. Auto-selección desde URL
    const urlParams = new URLSearchParams(window.location.search);
    const typeFromUrl = urlParams.get('type'); 
    if (typeFromUrl) {
        const allCards = document.querySelectorAll('.option-card');
        allCards.forEach(card => {
            const h3 = card.querySelector('h3');
            if (h3) {
                const cleanCardText = h3.innerText.replace(/\./g, '').trim().toUpperCase();
                const cleanUrlText = typeFromUrl.replace(/\./g, '').trim().toUpperCase();
                if (cleanCardText === cleanUrlText) {
                    selectOption(card, 'society', cleanUrlText);
                    setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
                }
            }
        });
    }

    // 4. MENÚ HAMBURGUESA
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuPath = document.getElementById('menu-path');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.toggle('hidden');
            if (!isHidden) {
                if (menuPath) menuPath.setAttribute('d', 'M6 18L18 6M6 6l12 12');
                document.body.style.overflow = 'hidden';
            } else {
                if (menuPath) menuPath.setAttribute('d', 'M4 6h16M4 12h16m-7 6h7');
                document.body.style.overflow = '';
            }
        });
    }

    // 5. MODO OSCURO
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        });
    }
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

    // 6. DROPDOWN IDIOMAS
    const langBtn = document.getElementById('lang-menu-btn');
    const langDropdown = document.getElementById('lang-dropdown');
    if (langBtn && langDropdown) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', () => langDropdown.classList.add('hidden'));
    }
});



   /* ==========================================
      SISTEMA DE IDIOMAS (i18n)
      ========================================== */
      async function changeLanguage(lang) {
        try {
            const response = await fetch(`./locales/${lang}.json`);
            if (!response.ok) throw new Error("Archivo no encontrado");
            const texts = await response.json();
    
            localStorage.setItem('preferred_lang', lang);
            document.documentElement.lang = lang;
    
            // Traducir elementos
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const path = el.getAttribute('data-i18n').split('.');
                let translation = texts;
                path.forEach(key => { translation = translation ? translation[key] : null; });
    
                if (translation) {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        el.placeholder = translation;
                    } else {
                        el.innerHTML = translation;
                    }
                }
            });
    
            updateLangUI(lang);
        } catch (e) {
            console.error("Error idioma:", e);
        }
    }

     
   function updateLangUI(lang) {
    const flag = document.getElementById('current-lang-flag');
    const text = document.getElementById('current-lang-text');
    if (lang === 'es') {
        if (flag) flag.textContent = 'AR';
        if (text) text.textContent = 'ES';
    } else {
        if (flag) flag.textContent = 'US';
        if (text) text.textContent = 'EN';
    }
}

function initLangDropdown() {
    const langBtn = document.getElementById('lang-menu-btn');
    const langDropdown = document.getElementById('lang-dropdown');

    if (langBtn && langDropdown) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', () => langDropdown.classList.add('hidden'));
    }
}