// === app.js corregido para carga de Google Sheets ===
// Mantiene toda la estructura y UI actual; solo mejora la carga y parsing de datos.

// --- Utilidad: parseo CSV robusto ---
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
  return lines.map(line => {
    const cells = [];
    let cell = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i], next = line[i + 1];
      if (inQuotes) {
        if (ch === '"' && next === '"') {
          cell += '"'; i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          cell += ch;
        }
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') { cells.push(cell); cell = ''; }
        else cell += ch;
      }
    }
    cells.push(cell);
    return cells;
  });
}

// --- Normaliza texto numérico a número real ---
function parseNumber(value) {
  if (typeof value !== 'string') return value;
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? value : num;
}

// --- Carga datos desde Google Sheets (CSV) ---
async function fetchGoogleSheetData(sheetId, sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error al cargar CSV: ${res.status}`);
  const text = await res.text();

  // Salta filas vacías o encabezados previos (primeras 6 filas)
  const lines = text.split(/\r?\n/).slice(6);
  const rows = parseCSV(lines.join('\n'));
  if (!rows.length) return [];

  const headers = rows[0].map(h => h.trim());
  const data = rows.slice(1)
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = parseNumber(r[i] ?? null);
      });
      return obj;
    })
    // Filtra títulos como "INDICADOR DE PROCESO"
    .filter(r => r["INDICADOR"] && !r["INDICADOR"].toUpperCase().includes("INDICADOR DE"));

  console.log("Datos procesados:", data.slice(0, 5));
  return data;
}

// --- Inicialización principal (mantiene todo lo demás igual) ---
document.addEventListener("DOMContentLoaded", async () => {
  const loader = document.getElementById("loader");
  try {
    const SHEET_ID = "1pV10qTgEWIRtmpVpZEJMFa_G9dluMACSoKFw6JNvFQ4";
    const SHEET_INDICADORES = "INDICADORES DE GESTION - GESTION AMBIENTAL";
    const SHEET_BARRIOS = "BARRIOS INTERVENIDOS";

    const [indicadores, barrios] = await Promise.all([
      fetchGoogleSheetData(SHEET_ID, SHEET_INDICADORES),
      fetchGoogleSheetData(SHEET_ID, SHEET_BARRIOS)
    ]);

    console.log("Indicadores cargados:", indicadores.length, "filas");
    console.log("Barrios cargados:", barrios.length, "filas");

    if (typeof initializeApp === "function") {
      initializeApp(indicadores, barrios);
    } else {
      console.warn("⚠️ initializeApp() no encontrada — revisá el script principal.");
    }
  } catch (e) {
    console.error("Error al cargar datos:", e);
  } finally {
    if (loader) loader.style.display = "none";
  }
});
