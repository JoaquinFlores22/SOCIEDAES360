/**
 * Sociedades360 — captura de leads del cotizador en Google Sheets.
 *
 * La web (assets/cotizador.js -> saveLead) pega en la URL /exec de este script
 * con los datos del lead como parámetros de query (GET). Este doGet arma una
 * fila según los ENCABEZADOS de la fila 1 de la hoja (así el orden de columnas
 * en la planilla no importa, y se pueden agregar columnas nuevas sin tocar
 * el código).
 *
 * Parámetros que hoy manda la web (assets/cotizador.js): society, jurisdiction,
 * capital, activity, name, phone, email, origin. "employees" y "comex" están
 * soportados acá pero el formulario todavía no los pregunta, así que esas
 * columnas quedan siempre en "No".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CÓMO REPARAR (esto es lo que hay que hacer para que vuelva a andar)
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Abrí la planilla:
 *    https://docs.google.com/spreadsheets/d/1i0DNP0VObNItSCxxgZ-Pm56YbKpQiP0Bwr2FVnhf3oE/edit
 * 2. Menú  Extensiones -> Apps Script.
 * 3. Confirmá que el código ahí sea este (si difiere, pegá este archivo entero
 *    y guardá con Ctrl+S).
 * 4. Arriba a la derecha: Implementar -> Administrar implementaciones.
 *      - Si ya hay una implementación de tipo "Aplicación web": tocá el lápiz (editar).
 *      - Si no hay ninguna: Implementar -> Nueva implementación -> tipo "Aplicación web".
 * 5. Configurá EXACTAMENTE así:
 *      - Ejecutar como:      Yo (tu cuenta)
 *      - Quién tiene acceso:  Cualquier persona            <-- ¡ESTO es lo que estaba mal!
 *        (NO "Cualquier persona con cuenta de Google", NO "Solo yo")
 * 6. Implementar. Google te pide autorizar permisos la primera vez -> Aceptar.
 * 7. Copiá la "URL de la aplicación web" que termina en /exec.
 *      - Si es la MISMA de antes: listo, no hay que tocar la web.
 *      - Si CAMBIÓ: hay que actualizar SHEETS_URL en assets/cotizador.js.
 *
 * Para probar sin la web: pegá en el navegador (logueado o no):
 *   TU_URL/exec?society=TEST&jurisdiction=PBA&capital=100&activity=prueba&name=Test&phone=1100000000&email=test@test.com&origin=prueba_manual
 * Tenés que ver "OK" y una fila nueva en la hoja.
 *
 * Diagnóstico rápido: si al pegar esa URL en una pestaña de incógnito te
 * termina llevando a una pantalla de login de Google en vez de mostrar "OK",
 * el problema es el paso 5 (el /exec sigue exigiendo login).
 */

const SPREADSHEET_ID = "1i0DNP0VObNItSCxxgZ-Pm56YbKpQiP0Bwr2FVnhf3oE";
const SHEET_NAME = "Hoja 1"; // tu hoja

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

  const p = (e && e.parameter) ? e.parameter : {};
  Logger.log("PARAMS: " + JSON.stringify(p));

  const lastCol = sh.getLastColumn();
  if (lastCol === 0) {
    return ContentService.createTextOutput("ERROR: No hay encabezados en la fila 1.");
  }

  // Encabezados (fila 1)
  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const idx = {};
  headers.forEach((h, i) => {
    const key = String(h).trim().toUpperCase();
    if (key) idx[key] = i;
  });

  const row = new Array(headers.length).fill("");

  const set = (colName, val) => {
    const key = colName.toUpperCase();
    if (idx[key] === undefined) return;
    row[idx[key]] = val;
  };

  set("FECHA", new Date());
  set("TP SOCIEDAD", p.society || "");
  set("JURISDICCION", p.jurisdiction || "");
  set("CAPITAL", p.capital || "");
  set("ACTIVIDAD", p.activity || "");
  set("EMAIL", p.email || "");
  set("TELEFONO", p.phone || "");
  set("EMPLEADOS", (p.employees === "true") ? "Sí" : "No");
  set("NOMBRE", p.name || "");
  set("ORIGEN", p.origin || "cotizador_web");
  set("COMEX", (p.comex === "true") ? "Sí" : "No");

  // Opcional (si agregás columnas después):
  set("ESTADO", p.status || "Nuevo");
  set("ULTIMO_CONTACTO", p.ultimo_contacto || "");
  set("NOTAS", p.notas || "");

  sh.appendRow(row);

  return ContentService.createTextOutput("OK");
}
