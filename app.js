// === subsecretaria_app_fixed_headers.js ===
// Versión robusta para INDICADORES DE GESTIÓN - GESTIÓN AMBIENTAL.xlsx

// --- Normalizador de encabezados ---
function normalizeKey(key) {
    if (!key) return "";
    return key
        .toString()
        .toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "") // elimina tildes
        .replace(/[^\w\s]/g, "_") // reemplaza símbolos por "_"
        .replace(/\s+/g, "_") // espacios por "_"
        .trim();
}

// --- Fetch CSV directo desde Google Sheets ---
async function fetchGoogleSheetData(sheetId, sheetName) {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error(`Error al cargar CSV: ${res.status}`);
    const text = await res.text();
    const rows = parseCSV(text);
    const headers = rows[0].map(normalizeKey);
    const data = rows.slice(1).map(r => {
        const obj = {};
        headers.forEach((h, i) => {
            let v = r[i] ?? null;
            if (typeof v === "string" && !isNaN(v.replace(",", "."))) v = parseFloat(v.replace(",", "."));
            obj[h] = v;
        });
        return obj;
    });
    return data.filter(r => Object.values(r).some(v => v !== null && v !== ""));
}

// --- CSV parser simple ---
function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
    return lines.map(line => {
        const cells = [];
        let current = "", inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i], n = line[i+1];
            if (inQuotes) {
                if (c === '"' && n === '"') { current += '"'; i++; }
                else if (c === '"') inQuotes = false;
                else current += c;
            } else {
                if (c === '"') inQuotes = true;
                else if (c === ",") { cells.push(current); current = ""; }
                else current += c;
            }
        }
        cells.push(current);
        return cells;
    });
}

// --- Inicialización ---
(async () => {
    const SHEET_ID = "1pV10qTgEWIRtmpVpZEJMFa_G9dluMACSoKFw6JNvFQ4";
    const SHEET_INDICADORES = "INDICADORES";
    const SHEET_BARRIOS = "BARRIOS INTERVENIDOS";

    try {
        const indicadores = await fetchGoogleSheetData(SHEET_ID, SHEET_INDICADORES);
        console.log("Indicadores cargados:", indicadores.slice(0, 5));
        const barrios = await fetchGoogleSheetData(SHEET_ID, SHEET_BARRIOS);
        console.log("Barrios cargados:", barrios.slice(0, 5));

        // --- Mostrar ejemplo de agrupación ---
        const porArea = {};
        for (const row of indicadores) {
            const area = row["area_dependencia"] || "sin_area";
            const valor = row["acumulado_total"] || 0;
            porArea[area] = (porArea[area] || 0) + Number(valor);
        }
        console.log("Totales por área:", porArea);
        // Aquí podés integrar la lógica para mostrar los KPI
    } catch (e) {
        console.error("Error cargando datos:", e);
    }
})();
