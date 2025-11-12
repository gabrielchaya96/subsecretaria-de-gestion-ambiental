// === app.js FINAL para Subsecretaría de Gestión Ambiental ===
// Mantiene toda la estructura visual original. Corrige la carga de datos desde Google Sheets.
// Normaliza encabezados, ignora filas vacías y filtra títulos internos ("INDICADOR DE...").

function normalizeKey(key) {
  if (!key) return "";
  return key
    .toString()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/[^a-z0-9]+/g, "_") // reemplaza símbolos y espacios por "_"
    .replace(/^_+|_+$/g, ""); // quita guiones bajos al inicio o final
}

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

function parseNumber(value) {
  if (typeof value !== "string") return value;
  const cleaned = value.replace(/[^0-9,.-]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? value : num;
}

async function fetchGoogleSheetData(sheetId, sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error al cargar CSV: ${res.status}`);
  const text = await res.text();

  // Saltar filas vacías o encabezados iniciales (primeras 6)
  const lines = text.split(/\r?\n/).slice(6);
  const rows = parseCSV(lines.join("\n"));
  if (!rows.length) return [];

  const headers = rows[0].map(normalizeKey);
  const data = rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = parseNumber(r[i] ?? null));
    return obj;
  })
  .filter(r => r.indicador && !r.indicador.toUpperCase().includes("INDICADOR DE"));

  console.log(`✅ Datos cargados (${sheetName}):`, data.length, "filas");
  return data;
}

// --- Inicialización completa ---
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

    // Si tu script principal define initializeApp(), se ejecuta aquí
    if (typeof initializeApp === "function") {
      initializeApp(indicadores, barrios);
    } else {
      console.warn("⚠️ No se encontró initializeApp(). Verificá que esté definido.");
    }
  } catch (e) {
    console.error("❌ Error al cargar datos:", e);
  } finally {
    if (loader) loader.style.display = "none";
  }
});
