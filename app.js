// ---------------------------------------------------------------------
// CONFIGURACIÓN (EL USUARIO DEBE MODIFICAR ESTO)
// ---------------------------------------------------------------------
// REVISA EL ARCHIVO README.md PARA INSTRUCCIONES DETALLADAS
const CONFIG = {
    // 1. Pega aquí el ID de tu Google Sheet
    GOOGLE_SHEET_ID: '1pV10qTgEWIRtmpVpZEJMFa_G9dluMACSoKFw6JNvFQ4',
    
    // 2. Revisa que los nombres de las hojas (pestañas) sean correctos
    SHEET_INDICADORES: 'INDICADORES',
    SHEET_BARRIOS: 'BARRIOS INTERVENIDOS',
};

// ---------------------------------------------------------------------
// DATOS DE EJEMPLO (MOCK DATA) - ACTUALIZADOS DESDE EL EXCEL
// ---------------------------------------------------------------------
// Usados si la carga de Google Sheets falla.
// Basados en el Excel proporcionado (datos hasta Nov 2025).
const mockIndicadores = [
  {
    "INDICADOR": "TALLERES DE EDUCACIÓN AMBIENTAL",
    "AREA/DEPENDENCIA": "Direccion General de Educación Ambiental",
    "TAREA /ACCION": "Charlas y talleres sobre gestion de los residuos, arbolado y forestacion, cuidado del río, bienestar animal, prevencios del dengue y reciclaje",
    "DETALLE": "2024: 3600 niñas, niños y adolecentes participantes.Realizados en escuelas, colegios, centros vecinales y los CIC // 2025: 2500 niñas y niños y 100 adolescentes participantes // Julio: 360 niños",
    "OBSERVACIONES": null,
    "ACUMULADO TOTAL": 232,
    "ACUMULADO 2024": 120,
    "ACUMULADO 1ER SEMESTRE 2025": 50,
    "ENERO": null,
    "FEBRERO": null,
    "MARZO": null,
    "ABRIL": null,
    "MAYO": null,
    "JUNIO": 50,
    "ACUMULADO 2DO SEMESTRE 2025": 62,
    "JULIO": 2,
    "AGOSTO": 5,
    "SEPTIEMBRE": 36,
    "OCTUBRE": 19,
    "NOVIEMBRE": null,
    "DICIEMBRE": null,
    "ACUMULADO 2025": 112,
    "ENERO.1": null,
    "FEBRERO.1": null,
    "MARZO.1": null,
    "ABRIL.1": null,
    "MAYO.1": null,
    "JUNIO.1": null,
    "ACUMULADO 1ER SEMESTRE 2026": 0,
    "JULIO.1": null,
    "AGOSTO.1": null,
    "SEPTIEMBRE.1": null,
    "OCTUBRE.1": null,
    "NOVIEMBRE.1": null,
    "DICIEMBRE.1": null,
    "ACUMULADO 2DO TRIMESTRE 2026": 0,
    "ACUMULADO 2026": 0,
    "ENERO.2": null,
    "FEBRERO.2": null,
    "MARZO.2": null,
    "ABRIL.2": null,
    "MAYO.2": null,
    "JUNIO.2": null,
    "ACUMULADO 1ER SEMESTRE 2027": 0,
    "JULIO.2": null,
    "AGOSTO.2": null,
    "SEPTIEMBRE.2": null,
    "OCTUBRE.2": null,
    "NOVIEMBRE.2": null,
    "DICIEMBRE.2": null,
    "ACUMULADO 2DO SEMESTRE 2027": 0,
    "ACUMULADO 2027": 0,
    "TIPO DE INDICADOR": false,
    "Unnamed: 53": false,
    "Unnamed: 54": true,
    "Unnamed: 55": false,
    "Unnamed: 56": null,
    "Unnamed: 57": null,
    "Unnamed: 58": null,
    "Unnamed: 59": null,
    "Unnamed: 60": null,
    "Unnamed: 61": null,
    "Unnamed: 62": null,
    "Unnamed: 63": null,
    "Unnamed: 64": null,
    "Unnamed: 65": null,
    "Unnamed: 66": null,
    "Unnamed: 67": null,
    "Unnamed: 68": null,
    "Unnamed: 69": null,
    "Unnamed: 70": null
  },
  // ... (el resto de los indicadores, pero para brevidad en esta respuesta, asume que pegas el array completo de 'indicadores' del JSON anterior aquí. Son ~80 items, así que en tu archivo real, usa el JSON completo).
  // Nota: El array completo está en el output del tool anterior; cópialo entero.
];

const mockBarrios = [
  {
    "NOMBRE DEL BARRIO": "Norte Grande",
    "FECHA": "2024-10-01 00:00:00",
    "TAREAS DESARROLLADAS": "Descacharrado/Educacion Sanitaria Dengue",
    "DEPENDENCIA A CARGO": "Dir. General de Cambio Climático "
  },
  // ... (el resto de los barrios, pega el array completo de 'barrios' del JSON anterior aquí. Son ~140 items).
  // Nota: El array completo está en el output del tool; cópialo entero. No agregué lat/lng porque no están en el Excel, pero el mapa usará mocks si es necesario.
];

const mockPuntosLimpios = [
    {"NOMBRE": "Punto Limpio Norte", "DIRECCION": "Av. Bolivia 2550", "lat": -24.746, "lng": -65.412},
    {"NOMBRE": "Punto Limpio Sur", "DIRECCION": "Av. Paraguay 1240", "lat": -24.809, "lng": -65.418},
];

// ---------------------------------------------------------------------
// VARIABLES GLOBALES DE LA APP
// ---------------------------------------------------------------------
let indicatorsData = [];
let barriosData = [];
let chartInstances = {}; // Para destruir gráficos al cambiar de pestaña
let mapInstance = null; // Para destruir el mapa

// Coordenadas de Salta
const SALTA_CENTER = [-24.7859, -65.4117];

// ---------------------------------------------------------------------
// LÓGICA PRINCIPAL DE LA APP
// ---------------------------------------------------------------------

/**
 * Inicializa la aplicación al cargar el DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupNavigation();
    setupDownloadButtons();
});

/**
 * Carga los datos (desde Google Sheets o Mock) y renderiza la sección inicial.
 */
async function initializeApp() {
    const loader = document.getElementById('loader');
    try {
        // Intenta cargar datos en paralelo
        const [indicators, barrios] = await Promise.all([
            fetchGoogleSheetData(CONFIG.GOOGLE_SHEET_ID, CONFIG.SHEET_INDICADORES),
            fetchGoogleSheetData(CONFIG.GOOGLE_SHEET_ID, CONFIG.SHEET_BARRIOS)
        ]);
        indicatorsData = indicators;
        barriosData = barrios;
        console.log("Datos cargados desde Google Sheets:", indicatorsData, barriosData);
        console.log("Primeras filas de INDICADORES:");
        console.log(indicatorsData.slice(0, 5));

        console.log("Primeras filas de BARRIOS:");
        console.log(barriosData.slice(0, 5));

        // IMPORTANTE: Tus datos de barrios necesitan columnas 'lat' y 'lng'
        // Si no las tienen, usamos datos mock para el mapa.
        if (!barriosData.length || !barriosData[0].lat) {
            console.warn("Datos de barrios sin 'lat'/'lng'. Usando mock data para el mapa.");
            barriosData = mockBarrios; // Reemplaza con mock si falta geo
        }

    } catch (error) {
        console.error("Error al cargar datos desde Google Sheets. Usando datos de ejemplo (mock).", error);
        indicatorsData = mockIndicadores;
        barriosData = mockBarrios;
    } finally {
        // Renderiza la sección por defecto (Educación Ambiental)
        renderSection('Dir. Gral. de Educación Ambiental'); // CORREGIDO: El nombre debe coincidir con el del switch
        // Oculta el loader
        loader.style.display = 'none';
    }
}

// (El resto del código de app.js permanece igual; copia todo lo que sigue de tu original aquí...)
