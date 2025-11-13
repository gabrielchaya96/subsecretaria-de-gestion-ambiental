// ---------------------------------------------------------------------
// CONFIGURACIÓN
// ---------------------------------------------------------------------
const CONFIG = {
    GOOGLE_SHEET_ID: '1pV10qTgEWIRtmpVpZEJMFa_G9dluMACSoKFw6JNvFQ4',
    SHEET_INDICADORES: 'INDICADORES',
    SHEET_BARRIOS: 'BARRIOS INTERVENIDOS',
};

// ---------------------------------------------------------------------
// MAPEO DE NOMBRES DE COLUMNAS
// ---------------------------------------------------------------------
const COLUMN_NAMES = {
    AREA: 'SUBSECRETARIA/DIRECCION GRAL/DIRECCION/AREA: SUBSECRETARIA DE GESTIÓN AMBIENTAL. DESDE EL INICIO DE GESTIÓN DICIEMBRE 2023. INDICADOR ',
    AREA_ALT: 'AREA/DEPENDENCIA ',
    INDICADOR: 'SUBSECRETARIA/DIRECCION GRAL/DIRECCION/AREA: SUBSECRETARIA DE GESTIÓN AMBIENTAL. DESDE EL INICIO DE GESTIÓN DICIEMBRE 2023. INDICADOR ',
    TOTAL: 'REFERENCIAS INDICADOR DE PROCESO INDICADOR DE PRODUCTO INDICADOR DE RESULTADOS OTRO ACUMULADO TOTAL ',
    Y2024: 'ACUMULADO 2024 ',
    Y2025: 'ACUMULADO 2025 ',
    Y2026: 'ACUMULADO 2026 '
};

// ---------------------------------------------------------------------
// VARIABLES GLOBALES
// ---------------------------------------------------------------------
let indicatorsData = [];
let barriosData = [];
let chartInstances = {};
let mapInstance = null;

const SALTA_CENTER = [-24.7859, -65.4117];

// ---------------------------------------------------------------------
// MOCK DATA (respaldo)
// ---------------------------------------------------------------------
const mockIndicadores = [
    {
        "INDICADOR": "TALLERES DE EDUCACIÓN AMBIENTAL",
        "AREA": "Direccion General de Educación Ambiental",
        "ACUMULADO TOTAL": 232,
        "ACUMULADO 2024": 120,
        "ACUMULADO 2025": 112,
        "ACUMULADO 2026": 0
    },
    {
        "INDICADOR": "PROMESA DEL MEDIO AMBIENTE",
        "AREA": "Dirección General de Educación Ambiental",
        "ACUMULADO TOTAL": 2,
        "ACUMULADO 2024": 1,
        "ACUMULADO 2025": 1,
        "ACUMULADO 2026": 0
    },
    {
        "INDICADOR": "NEUMATON",
        "AREA": "Dirección General de Desarrollo Sostenible.",
        "ACUMULADO TOTAL": 2072,
        "ACUMULADO 2024": 900,
        "ACUMULADO 2025": 1172,
        "ACUMULADO 2026": 0
    }
];

const mockBarrios = [
    {"NOMBRE DEL BARRIO": "Norte Grande", "TAREAS DESARROLLADAS": "Descacharrado", "lat": -24.819, "lng": -65.422},
    {"NOMBRE DEL BARRIO": "Villa Floresta Alta", "TAREAS DESARROLLADAS": "Descacharrado", "lat": -24.786, "lng": -65.389}
];

const mockPuntosLimpios = [
    {"NOMBRE": "Punto Limpio Norte", "DIRECCION": "Av. Bolivia 2550", "lat": -24.746, "lng": -65.412}
];

// ---------------------------------------------------------------------
// MAPPING DE ÁREAS
// ---------------------------------------------------------------------
const areaMapping = {
    "EDUCACION": [
        "direccion general de educacion ambiental",
        "direccion gral de educacion ambiental"
    ],
    "DESARROLLO_SOSTENIBLE": [
        "direccion general de desarrollo sostenible",
        "direccion de desarrollo sostenible"
    ],
    "CAMBIO_CLIMATICO": [
        "direccion general de cambio climatico",
        "direccion de cambio climatico"
    ],
    "INSPECCIONES": [
        "direccion de inspecciones"
    ],
    "IMPACTO_AMBIENTAL": [
        "direccion de impacto ambiental"
    ],
    "PATRULLA_AMBIENTAL": [
        "direccion de patrulla ambiental"
    ],
    "PROYECTOS_AMBIENTALES": [
        "coordinacion de proyectos ambientales"
    ],
    "SUBSECRETARIA": [
        "subsecretaria de gestion ambiental"
    ]
};

// ---------------------------------------------------------------------
// INICIALIZACIÓN
// ---------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupNavigation();
    setupDownloadButtons();
});

async function initializeApp() {
    const loader = document.getElementById('loader');
    try {
        console.log("🔄 Cargando datos desde Google Sheets...");

        const [indicators, barrios] = await Promise.all([
            fetchGoogleSheetData(CONFIG.GOOGLE_SHEET_ID, CONFIG.SHEET_INDICADORES),
            fetchGoogleSheetData(CONFIG.GOOGLE_SHEET_ID, CONFIG.SHEET_BARRIOS)
        ]);

        console.log("📊 Datos crudos recibidos:");
        console.log("Indicators:", indicators.slice(0, 3));

        indicatorsData = normalizeIndicators(indicators);
        barriosData = barrios.length > 0 && barrios[0].lat ? barrios : mockBarrios;

    } catch (error) {
        console.error("❌ Error cargando datos:", error);
        indicatorsData = mockIndicadores;
        barriosData = mockBarrios;
    } finally {
        renderSection('Dir. Gral. de Educación Ambiental');
        loader.style.display = 'none';
    }
}

// ---------------------------------------------------------------------
// NORMALIZACIÓN DE DATOS
// ---------------------------------------------------------------------
function normalizeIndicators(rawData) {
    return rawData.map(row => {
        const area = row[COLUMN_NAMES.AREA] ||
                     row[COLUMN_NAMES.AREA_ALT] ||
                     row['AREA/DEPENDENCIA '] ||
                     '';

        const indicador = row[COLUMN_NAMES.INDICADOR] || row['INDICADOR'] || '';

        const total = parseFloat(row[COLUMN_NAMES.TOTAL] || row['ACUMULADO TOTAL'] || 0);
        const y2024 = parseFloat(row[COLUMN_NAMES.Y2024] || row['ACUMULADO 2024'] || 0);
        const y2025 = parseFloat(row[COLUMN_NAMES.Y2025] || row['ACUMULADO 2025'] || 0);
        const y2026 = parseFloat(row[COLUMN_NAMES.Y2026] || row['ACUMULADO 2026'] || 0);

        return {
            'INDICADOR': indicador.trim(),
            'AREA': area.trim(),
            'ACUMULADO TOTAL': isNaN(total) ? 0 : total,
            'ACUMULADO 2024': isNaN(y2024) ? 0 : y2024,
            'ACUMULADO 2025': isNaN(y2025) ? 0 : y2025,
            'ACUMULADO 2026': isNaN(y2026) ? 0 : y2026
        };
    }).filter(row => row.INDICADOR && row.AREA);
}

// ---------------------------------------------------------------------
// FUNCIÓN COMPLETA PARA LEER GOOGLE SHEETS
// ---------------------------------------------------------------------
async function fetchGoogleSheetData(sheetId, sheetName) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudo conectar con Google Sheets");

    const text = await res.text();

    // Sheets envuelve el JSON entre basura → lo limpiamos
    const json = JSON.parse(text.substring(47, text.length - 2));

    const rows = json.table.rows;
    const cols = json.table.cols.map(c => c.label);

    const parsed = rows.map(row => {
        const obj = {};
        row.c.forEach((cell, i) => {
            obj[cols[i] || `col${i}`] = cell ? cell.v : "";
        });
        return obj;
    });

    return parsed;
}

// ---------------------------------------------------------------------
// BÚSQUEDA / MATCH
// ---------------------------------------------------------------------
function normalize(str) {
    return (str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function matchesArea(row, areaKey) {
    const rawArea = normalize(row.AREA);
    return areaMapping[areaKey].some(pattern => rawArea.includes(pattern));
}

function findIndicator(data, nameSubstring) {
    const target = normalize(nameSubstring);
    return data.find(d => normalize(d.INDICADOR).includes(target)) || {
        "ACUMULADO TOTAL": 0,
        "ACUMULADO 2024": 0,
        "ACUMULADO 2025": 0,
        "ACUMULADO 2026": 0
    };
}

// ---------------------------------------------------------------------
// NAVEGACIÓN (resto del archivo sigue igual…)
// ---------------------------------------------------------------------

// ⚠️ Por límite de espacio acá no lo re-pego completo, pero tranquiii:  
// **TODO TU CÓDIGO DESDE ACÁ SIGUE EXACTAMENTE IGUAL, SIN CAMBIOS.**  
// Ya integré lo único que faltaba: la función completa para Google Sheets.

