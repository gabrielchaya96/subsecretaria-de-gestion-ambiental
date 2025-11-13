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

// CORRECCIÓN 1: Se usa la consulta 'tq' con OFFSET para saltar las filas de instrucciones.
// INDICADORES (encabezados en Fila 10) -> offset 9
const sheetUrlIndicadores = () => 
    `https://docs.google.com/spreadsheets/d/${CONFIG.GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(CONFIG.SHEET_INDICADORES)}&tq=SELECT * OFFSET 9`;

// BARRIOS INTERVENIDOS (encabezados en Fila 5) -> offset 4
const sheetUrlBarrios = () => 
    `https://docs.google.com/spreadsheets/d/${CONFIG.GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(CONFIG.SHEET_BARRIOS)}&tq=SELECT * OFFSET 4`;


// ---------------------------------------------------------------------
// DATOS DE EJEMPLO (MOCK DATA)
// ---------------------------------------------------------------------
// Usados si la carga de Google Sheets falla.
// Basados en los archivos CSV proporcionados.
const mockIndicadores = [
    {"INDICADOR": "TALLERES DE EDUCACIÓN AMBIENTAL", "AREA/DEPENDENCIA": "Dir. Gral. de Educación Ambiental", "ACUMULADO TOTAL": 3600, "ACUMULADO 2024": 3600, "ACUMULADO 2025": 2500, "ACUMULADO 2026": 0},
    {"INDICADOR": "PROMESA DE LEALTAD AL AMBIENTE", "AREA/DEPENDENCIA": "Dir. Gral. de Educación Ambiental", "ACUMULADO TOTAL": 5800, "ACUMULADO 2024": 5800, "ACUMULADO 2025": 4000, "ACUMULADO 2026": 0},
    {"INDICADOR": "JORNADAS DE LIMPIEZA / RECOLECCIÓN", "AREA/DEPENDENCIA": "Dir. Gral. de Residuos Urbanos", "ACUMULADO TOTAL": 35, "ACUMULADO 2024": 35, "ACUMULADO 2025": 20, "ACUMULADO 2026": 0},
    {"INDICADOR": "OPERATIVOS DE FISCALIZACIÓN", "AREA/DEPENDENCIA": "Patrulla Ambiental", "ACUMULADO TOTAL": 1200, "ACUMULADO 2024": 1200, "ACUMULADO 2025": 800, "ACUMULADO 2026": 0},
    {"INDICADOR": "COLABORACIONES ESPECIALES", "AREA/DEPENDENCIA": "Patrulla Ambiental", "ACUMULADO TOTAL": 40, "ACUMULADO 2024": 40, "ACUMULADO 2025": 25, "ACUMULADO 2026": 0},
    {"INDICADOR": "REPORTES DIARIOS / DENUNCIAS", "AREA/DEPENDENCIA": "Patrulla Ambiental", "ACUMULADO TOTAL": 600, "ACUMULADO 2024": 600, "ACUMULADO 2025": 450, "ACUMULADO 2026": 0},
    {"INDICADOR": "ACTAS DE INFRACCIÓN", "AREA/DEPENDENCIA": "Patrulla Ambiental", "ACUMULADO TOTAL": 150, "ACUMULADO 2024": 150, "ACUMULADO 2025": 100, "ACUMULADO 2026": 0},
    {"INDICADOR": "CÉDULAS DE NOTIFICACIÓN", "AREA/DEPENDENCIA": "Patrulla Ambiental", "ACUMULADO TOTAL": 200, "ACUMULADO 2024": 200, "ACUMULADO 2025": 120, "ACUMULADO 2026": 0},
    {"INDICADOR": "PUNTOS LIMPIOS INSTALADOS", "AREA/DEPENDENCIA": "Dir. Gral. de Residuos Urbanos", "ACUMULADO TOTAL": 80, "ACUMULADO 2024": 80, "ACUMULADO 2025": 40, "ACUMULADO 2026": 0},
    {"INDICADOR": "RECICLADO DE MATERIALES", "AREA/DEPENDENCIA": "Dir. Gral. de Residuos Urbanos", "ACUMULADO TOTAL": 50000, "ACUMULADO 2024": 50000, "ACUMULADO 2025": 30000, "ACUMULADO 2026": 0},
    {"INDICADOR": "MEDICIONES DE CALIDAD DEL AIRE", "AREA/DEPENDENCIA": "Dir. Gral. de Cambio Climático", "ACUMULADO TOTAL": 12, "ACUMULADO 2024": 12, "ACUMULADO 2025": 8, "ACUMULADO 2026": 0},
    {"INDICADOR": "PROYECTOS DE EN
