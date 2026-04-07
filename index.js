/* ==========================================
   CONFIGURACIÓN Y VARIABLES GLOBALES
   ========================================== */
   const WHATSAPP_BUSINESS = '5491159203177';

   /* ==========================================
      INICIALIZACIÓN PRINCIPAL
      ========================================== */
   document.addEventListener('DOMContentLoaded', () => {
       // Ejecutar inicializadores
       initTheme();
       initMobileMenu();
       initLangDropdown();
   
       // Cargar idioma preferido
       const savedLang = localStorage.getItem('preferred_lang') || 'es';
       changeLanguage(savedLang);
   });
   
   /* ==========================================
      GESTIÓN DE TEMAS (DARK/LIGHT)
      ========================================== */
   function initTheme() {
       const htmlElement = document.documentElement;
       const toggles = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
   
       // 1. Cargar estado inicial
       const isDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
       
       if (isDark) {
           htmlElement.classList.add('dark');
       } else {
           htmlElement.classList.remove('dark');
       }
   
       // 2. Escuchar clics en todos los botones de tema
       toggles.forEach(btn => {
           // Actualizar icono inicial
           btn.innerHTML = htmlElement.classList.contains('dark') ? '☀️' : '🌙';
   
           btn.addEventListener('click', () => {
               htmlElement.classList.toggle('dark');
               const nowDark = htmlElement.classList.contains('dark');
               localStorage.theme = nowDark ? 'dark' : 'light';
               
               // Actualizar todos los iconos a la vez
               toggles.forEach(b => b.innerHTML = nowDark ? '☀️' : '🌙');
           });
       });
   }
   
   /* ==========================================
      NAVEGACIÓN MÓVIL
      ========================================== */
   function initMobileMenu() {
       const btn = document.getElementById('menu-btn');
       const menu = document.getElementById('mobile-menu');
       const menuPath = document.getElementById('menu-path');
   
       if (!btn || !menu) return;
   
       const toggleMenu = (forceClose = false) => {
           const isHidden = forceClose ? true : menu.classList.toggle('hidden');
           
           if (forceClose) menu.classList.add('hidden');
   
           if (!menu.classList.contains('hidden')) {
               // Abierto
               if (menuPath) menuPath.setAttribute('d', 'M6 18L18 6M6 6l12 12');
               document.body.style.overflow = 'hidden';
           } else {
               // Cerrado
               if (menuPath) menuPath.setAttribute('d', 'M4 6h16M4 12h16m-7 6h7');
               document.body.style.overflow = '';
           }
       };
   
       btn.addEventListener('click', () => toggleMenu());
   
       // Cerrar al clickear links
       menu.querySelectorAll('a').forEach(link => {
           link.addEventListener('click', () => toggleMenu(true));
       });
   }
   
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
   
   /* ==========================================
      UTILIDADES
      ========================================== */
   window.contactService = (serviceName) => {
       const message = `Hola Sociedades360, me gustaría realizar una consulta sobre: ${serviceName}`;
       const url = `https://wa.me/${WHATSAPP_BUSINESS}?text=${encodeURIComponent(message)}`;
       window.open(url, '_blank');
   };
   
   function abrirWhatsapp() {
       const mensaje = "Hola! Solicito información sobre sociedades.";
       window.open(`https://wa.me/${WHATSAPP_BUSINESS}?text=${encodeURIComponent(mensaje)}`, '_blank');
   }


// CARDS Y FORM  Index y pre-completar el formulario
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sociedadPrevia = urlParams.get('sociedad'); // Captura SAS, SRL o SA

    if (sociedadPrevia) {
        console.log("Auto-seleccionando sociedad:", sociedadPrevia);

        // Esperamos un momento para que el DOM esté listo y las funciones cargadas
        setTimeout(() => {
            // 1. Buscamos todas las option-cards del Paso 1
            const cards = document.querySelectorAll('#step1 .option-card');
            
            let cardEncontrada = null;

            cards.forEach(card => {
                // Buscamos si el texto de la tarjeta contiene la sociedad (SAS, SRL, SA)
                // O si el atributo onclick contiene el valor
                const texto = card.innerText.toUpperCase();
                const clickAttr = card.getAttribute('onclick') || "";

                if (texto.includes(sociedadPrevia.toUpperCase()) || clickAttr.includes(`'${sociedadPrevia}'`)) {
                    cardEncontrada = card;
                }
            });

            if (cardEncontrada) {
                // 2. Simulamos el clic en la tarjeta de la sociedad
                cardEncontrada.click();

                // 3. Opcional: Si quieres que además se elija una jurisdicción por defecto (ej: CABA)
                // para que el botón "Siguiente" se habilite solo:
                const cabaCard = Array.from(cards).find(c => c.innerText.includes('CABA'));
                if (cabaCard) {
                    cabaCard.click();
                }

                // 4. Hacer scroll suave al formulario para que el usuario se ubique
                document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
                
                console.log("Sociedad auto-seleccionada con éxito.");
            }
        }, 600); // 600ms para asegurar que todo el JS previo cargó
    }
});