/**
 * Sociedades360 — captura de leads del cotizador en Google Sheets.
 *
 * La web (assets/cotizador.js -> saveLead) pega en la URL /exec de este script
 * con los datos del lead como parámetros de query (GET). Este doGet los agrega
 * como una fila nueva en la planilla.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CÓMO INSTALAR / REPARAR (esto es lo que hay que hacer para que vuelva a andar)
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Abrí la planilla:
 *    https://docs.google.com/spreadsheets/d/1i0DNP0VObNItSCxxgZ-Pm56YbKpQiP0Bwr2FVnhf3oE/edit
 * 2. Menú  Extensiones -> Apps Script.
 * 3. Borrá todo el código que haya y pegá este archivo entero. Guardá (Ctrl+S).
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
 *      - Si CAMBIÓ: pasásela a Joaquín para actualizar SHEETS_URL en
 *        assets/cotizador.js.
 *
 * Para probar sin la web: pegá en el navegador (logueado o no):
 *   TU_URL/exec?society=TEST&jurisdiction=PBA&capital=100&activity=prueba&name=Test&phone=1100000000&email=test@test.com&origin=prueba_manual
 * Tenés que ver {"ok":true} y una fila nueva en la planilla.
 */

var SPREADSHEET_ID = "1i0DNP0VObNItSCxxgZ-Pm56YbKpQiP0Bwr2FVnhf3oE";
var SHEET_NAME = "Leads"; // se crea sola si no existe

var COLUMNS = [
  "fecha",
  "society",
  "jurisdiction",
  "capital",
  "activity",
  "name",
  "phone",
  "email",
  "origin",
];

function doGet(e) {
  return registrarLead(e);
}

// Por si algún navegador manda POST (sendBeacon viejo, etc.): aceptamos igual.
function doPost(e) {
  return registrarLead(e);
}

function registrarLead(e) {
  try {
    var p = (e && e.parameter) || {};
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(COLUMNS);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS);
    }

    var fila = [
      new Date(),
      p.society || "",
      p.jurisdiction || "",
      p.capital || "",
      p.activity || "",
      p.name || "",
      p.phone || "",
      p.email || "",
      p.origin || "",
    ];
    sheet.appendRow(fila);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
