# Sociedades360

Sitio estático de gestoría societaria. HTML plano + Tailwind **compilado** (sin CDN).

## Estructura

```
*.html              páginas
assets/app.js       chrome compartido (nav, tema, idioma, i18n)
assets/cotizador.js cotizador de 3 pasos (solo sociedades.html)
locales/{es,en}.json textos i18n — fuente de verdad del copy
src/input.css       fuente del CSS (Tailwind + @font-face + componentes)
css/style.css      CSS compilado — ESTO es lo que sirve el sitio
fonts/              Inter self-hosteada
```

## Editar y compilar

El CSS de Tailwind está **precompilado** en `css/style.css`. Si tocás clases de
Tailwind en el HTML, hay que recompilar:

```bash
npm install          # una vez
npm run build:css    # cada vez que cambian las clases
```

Durante desarrollo: `npm run watch:css` (recompila solo) o `npm run dev`
(watch + servidor en http://localhost:5500).

Los **textos** se editan en `locales/es.json` / `locales/en.json`, no en el HTML
(el HTML tiene texto de respaldo, pero `[data-i18n]` lo reemplaza al cargar).

## Integraciones

- WhatsApp: `5491159203177` (en `assets/*.js` y en los `href` de los HTML).
- Leads del cotizador: Google Apps Script (`SHEETS_URL` en `assets/cotizador.js`),
  vía `navigator.sendBeacon`.
