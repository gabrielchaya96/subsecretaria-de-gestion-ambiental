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
    
    // NUEVA CORRECCIÓN: Filas de encabezado a saltar manualmente
    OFFSET_INDICADORES: 9, // La fila 10 es el encabezado real
    OFFSET_BARRIOS: 4,     // La fila 5 es el encabezado real
};

// URL de consulta de Google Sheets (vuelve a la forma simple)
const sheetUrl = (sheetName) => `https://docs.google.com/spreadsheets/d/${CONFIG.GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

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
    {"INDICADOR": "PUNTOS LIMPIOS INSTALADOS", "AREA/DEPENDENCIA": "Dir. Gral. de Residuos Urbanos", "ACUMULADO TOTAL": 80, "ACUMULADO 2024": 80, "ACUMULADO 2025": 40, "ACUMULADO 2ULADO 2026": 0},
    {"INDICADOR": "RECICLADO DE MATERIALES", "AREA/DEPENDENCIA": "Dir. Gral. de Residuos Urbanos", "ACUMULADO TOTAL": 50000, "ACUMULADO 2024": 50000, "ACUMULADO 2025": 30000, "ACUMULADO 2026": 0},
    {"INDICADOR": "MEDICIONES DE CALIDAD DEL AIRE", "AREA/DEPENDENCIA": "Dir. Gral. de Cambio Climático", "ACUMULADO TOTAL": 12, "ACUMULADO 2024": 12, "ACUMULADO 2025": 8, "ACUMULADO 2026": 0},
    {"INDICADOR": "PROYECTOS DE ENERGÍAS RENOVABLES", "AREA/DEPENDENCIA": "Dir. Gral. de Cambio Climático", "ACUMULADO TOTAL": 2, "ACUMULADO 2024": 2, "ACUMULADO 2025": 1, "ACUMULADO 2026": 0}
];

const mockBarrios = [
    // Datos de ejemplo para el mapa
    { nombre: 'Norte Grande', tareas: 'Descacharrado/Educación Sanitaria Dengue', lat: -24.7570, lng: -65.4243 },
    { nombre: 'Villa Floresta Baja', tareas: 'Descacharrado/Educación Sanitaria Dengue', lat: -24.7820, lng: -65.4340 },
    { nombre: 'San Calixto', tareas: 'Descacharrado/Educación Sanitaria Dengue', lat: -24.7650, lng: -65.4050 },
    { nombre: 'B° 14 de Mayo', tareas: 'Operativo integral', lat: -24.7930, lng: -65.4180 },
];

// ---------------------------------------------------------------------
// VARIABLES GLOBALES
// ---------------------------------------------------------------------
let indicatorsData = [];
let barriosData = [];
let map = null;

const areaMapping = {
    EDUCACION_AMBIENTAL: [
        'Dir. Gral. de Educación Ambiental',
        'Dirección General de Educación Ambiental'
    ],
    RESIDUOS_URBANOS: [
        'Dir. Gral. de Residuos Urbanos',
        'Dirección General de Residuos Urbanos'
    ],
    CAMBIO_CLIMATICO: [
        'Dir. Gral. de Cambio Climático',
        'Dirección General de Cambio Climático'
    ],
    PATRULLA_AMBIENTAL: [
        'Patrulla Ambiental',
        'Dirección de Inspecciones',
        'Dir. de Inspecciones'
    ]
};

// ---------------------------------------------------------------------
// LÓGICA PRINCIPAL (Carga y Renderizado)
// ---------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el sistema
    initSidebarNavigation();
    loadAllData()
        .then(() => {
            // Cargar la vista por defecto (Educación Ambiental)
            renderSection('educacion-ambiental');
            hideLoader();
        })
        .catch(error => {
            console.error("Error al cargar datos de Google Sheets. Usando mock data.", error);
            // Si la carga falla, usar datos de ejemplo y avisar al usuario
            indicatorsData = mockIndicadores;
            barriosData = mockBarrios;
            renderSection('educacion-ambiental');
            showDataWarning();
            hideLoader();
        });
});

/**
 * Carga todos los datos necesarios desde Google Sheets
 */
async function loadAllData() {
    showLoader();
    try {
        // 1. Cargar datos de INDICADORES
        const indicadoresPromise = fetchData(sheetUrl(CONFIG.SHEET_INDICADORES))
            .then(data => {
                // CORRECCIÓN: Saltar las primeras 9 filas (instrucciones) manualmente
                indicatorsData = data.slice(CONFIG.OFFSET_INDICADORES);
            });
        
        // 2. Cargar datos de BARRIOS INTERVENIDOS
        const barriosPromise = fetchData(sheetUrl(CONFIG.SHEET_BARRIOS))
            .then(data => {
                // CORRECCIÓN: Saltar las primeras 4 filas (instrucciones) manualmente
                const rawBarriosData = data.slice(CONFIG.OFFSET_BARRIOS);
                barriosData = transformBarriosData(rawBarriosData);
            });

        await Promise.all([indicadoresPromise, barriosPromise]);
    } catch (error) {
        // El error es manejado en el .catch principal en DOMContentLoaded
        throw error; 
    }
}

// ---------------------------------------------------------------------
// MANEJO DE LA INTERFAZ DE USUARIO (UI)
// ---------------------------------------------------------------------

function showLoader() {
    document.getElementById('loader').style.display = 'flex';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function showDataWarning() {
    const warning = document.createElement('div');
    warning.className = 'alert alert-danger fixed-top mx-auto mt-3 shadow-lg';
    warning.role = 'alert';
    warning.style.maxWidth = '600px';
    warning.innerHTML = `
        <i class="bi bi-exclamation-triangle-fill"></i> 
        <strong>Advertencia:</strong> No se pudo conectar a Google Sheets. Se están mostrando <strong>datos de ejemplo (mock data)</strong>.
    `;
    document.body.appendChild(warning);
}

/**
 * Inicializa la navegación lateral
 */
function initSidebarNavigation() {
    const navLinks = document.querySelectorAll('.nav-link-item');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.getAttribute('data-section');
            renderSection(section);
            
            // Actualizar estado activo
            navLinks.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });
}

/**
 * Renderiza la sección de contenido principal
 * @param {string} sectionKey - Clave de la sección a renderizar
 */
function renderSection(sectionKey) {
    const contentArea = document.getElementById('main-content-area');
    let title = '';
    let containerHTML = `
        <h2 class="mb-4 display-6 section-title"></h2>
        <div id="section-container"></div>
    `;

    contentArea.innerHTML = containerHTML;
    const container = document.getElementById('section-container');
    const titleElement = contentArea.querySelector('.section-title');

    // Destruir mapa anterior si existe
    if (map) {
        map.remove();
        map = null;
    }

    switch (sectionKey) {
        case 'educacion-ambiental':
            title = 'Dirección General de Educación Ambiental';
            renderEducacionAmbiental(container);
            break;
        case 'residuos-urbanos':
            title = 'Dirección General de Residuos Urbanos';
            renderResiduosUrbanos(container);
            break;
        case 'cambio-climatico':
            title = 'Dirección General de Cambio Climático';
            renderCambioClimatico(container);
            break;
        case 'patrulla-ambiental':
            title = 'Patrulla Ambiental';
            renderPatrulla(container);
            break;
        case 'intervenciones-territoriales':
            title = 'Intervenciones Territoriales (Mapa)';
            renderIntervencionesTerritoriales(container);
            break;
        default:
            title = 'Bienvenido';
            container.innerHTML = '<p>Selecciona una sección del menú lateral para comenzar.</p>';
            break;
    }
    
    titleElement.textContent = title;
}

// ---------------------------------------------------------------------
// MANEJO DE DATOS Y RENDERIZADO
// ---------------------------------------------------------------------

/**
 * Busca y normaliza los datos de Google Sheets (gviz)
 * @param {string} url - URL de la hoja de cálculo
 * @returns {Promise<Array<Object>>} - Promesa que resuelve con los datos
 */
async function fetchData(url) {
    const response = await fetch(url);
    const text = await response.text();
    
    // El texto viene con un prefijo '/*O_o*/ google.visualization.Query.setResponse(' y un sufijo ')'
    const jsonString = text.substring(
        text.indexOf('(') + 1, 
        text.lastIndexOf(')')
    );

    const json = JSON.parse(jsonString);
    if (json.status !== 'ok' || !json.table || !json.table.rows) {
        throw new Error('Formato de respuesta de Google Sheets inválido o vacío.');
    }

    const cols = json.table.cols;
    const rows = json.table.rows;
    const data = [];

    rows.forEach(row => {
        const item = {};
        row.c.forEach((cell, i) => {
            const colLabel = cols[i].label.trim().replace(/\s+/g, ' ');
            // Los encabezados suelen tener prefijos no deseados en el modo consulta
            // Intentamos limpiar la etiqueta para usarla como clave
            const cleanLabel = colLabel.replace(/.*?\s(INDICADOR|AREA\/DEPENDENCIA|ACUMULADO TOTAL|ACUMULADO 2024|ACUMULADO 2025|ACUMULADO 2026|LATITUD|LONGITUD|NOMBRE DEL BARRIO|TAREAS DESARROLLADAS|ZONA|ÁREA\/DEPENDENCIA|AREA \/ DEPENDENCIA)$/i, '$1').trim();

            if (cell && typeof cell.v !== 'undefined') {
                item[cleanLabel] = cell.v;
            } else if (cell && typeof cell.f === 'string') {
                // Usar el valor formateado si el valor 'v' no existe (ej. texto)
                item[cleanLabel] = cell.f;
            } else {
                item[cleanLabel] = '';
            }
        });
        // Filtrar filas completamente vacías
        if (Object.values(item).some(v => v !== '' && v !== null && v !== 0 && v !== '0')) {
             data.push(item);
        }
    });

    return data;
}

/**
 * Transforma los datos de barrios a un formato usable (incluye validación de lat/lng)
 * @param {Array<Object>} rawBarriosData - Array de datos de barrios sin filtrar offset
 */
function transformBarriosData(rawBarriosData) {
    // CORRECCIÓN: El script usa 'LATITUD' y 'LONGITUD' que son los nombres reales de la columna.
    const hasLatLong = rawBarriosData.some(row => row.LATITUD && row.LONGITUD);

    if (!hasLatLong) {
        // En este punto, 'rawBarriosData' debería ser el array de datos reales (sin encabezados de instrucciones)
        // Si no tiene coordenadas, retorna mock data o un array vacío.
        return mockBarrios;
    }

    return rawBarriosData.map(row => {
        // Usar los nombres de columna reales del sheet
        const lat = parseFloat(row.LATITUD);
        const lng = parseFloat(row.LONGITUD);

        if (isNaN(lat) || isNaN(lng)) {
            // Si las coordenadas son inválidas, se retorna un objeto no válido para filtrar más tarde
            return null;
        }

        return {
            nombre: row['NOMBRE DEL BARRIO'],
            tareas: row['TAREAS DESARROLLADAS'],
            lat: lat,
            lng: lng
        };
    }).filter(row => row !== null); // Eliminar filas con lat/lng inválidos
}

/**
 * Normaliza una cadena de texto para búsqueda (minúsculas, sin tildes ni caracteres especiales)
 * @param {string} text 
 * @returns {string}
 */
function normalize(text) {
    if (typeof text !== 'string') return '';
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Busca un indicador específico en el array de datos
 * @param {Array<Object>} data - Array de indicadores
 * @param {string} searchName - Nombre del indicador a buscar
 * @returns {Object} - El objeto indicador o un objeto vacío si no se encuentra
 */
function findIndicator(data, searchName) {
    const normalizedSearch = normalize(searchName);
    const result = data.find(row => 
        normalize(row.INDICADOR || '').includes(normalizedSearch)
    );
    // Si no lo encuentra, retorna un objeto con valores 0 para no romper los cálculos
    if (!result) {
        return { 'ACUMULADO TOTAL': 0, 'ACUMULADO 2024': 0, 'ACUMULADO 2025': 0, 'ACUMULADO 2026': 0 };
    }
    
    // Asegurar que los acumulados sean números (o 0 si no existen/son inválidos)
    return {
        ...result,
        'ACUMULADO TOTAL': Number(result['ACUMULADO TOTAL'] || 0),
        'ACUMULADO 2024': Number(result['ACUMULADO 2024'] || 0),
        'ACUMULADO 2025': Number(result['ACUMULADO 2025'] || 0),
        'ACUMULADO 2026': Number(result['ACUMULADO 2026'] || 0),
    };
}

/**
 * Comprueba si una fila de datos pertenece a una clave de área
 * @param {Object} row 
 * @param {string} areaKey - Clave del área (ej. 'EDUCACION_AMBIENTAL')
 * @returns {boolean}
 */
function matchesArea(row, areaKey) {
    const raw = (
        row["SUBSECRETARIA/DIRECCION GRAL/DIRECCION/AREA"] ||
        row["AREA/DEPENDENCIA"] ||
        row["AREA / DEPENDENCIA"] ||
        row["ÁREA/DEPENDENCIA"] ||
        ""
    ).trim();

    if (!raw) return false;

    return areaMapping[areaKey].some(
        entry => normalize(entry) === normalize(raw)
    );
}

// ---------------------------------------------------------------------
// FUNCIONES DE COMPONENTES UI (KPIs, Gráficos)
// ---------------------------------------------------------------------

function formatNumber(num) {
    if (typeof num !== 'number') return '0';
    return Math.round(num).toLocaleString('es-AR');
}

function getKpiId(name) {
    return `kpi-${normalize(name).replace(/\s/g, '-')}`;
}

function createKpiCard(title, value, emoji, iconClass) {
    const kpiId = getKpiId(title);
    return `
        <div class="kpi-card shadow-sm p-3 bg-white rounded">
            <div class="d-flex justify-content-between align-items-center">
                <div class="${iconClass} rounded-circle d-flex align-items-center justify-content-center me-3">
                    <span class="emoji-icon">${emoji}</span>
                </div>
                <div>
                    <div class="text-end text-muted small">${title}</div>
                    <div class="display-5 text-end fw-bold" id="${kpiId}">0</div>
                </div>
            </div>
        </div>
    `;
}

function createBarChart(title, data, labels, color, labelY) {
    // Generación de un gráfico de barras simple usando divs/CSS para evitar Chart.js
    const maxVal = Math.max(...data);

    const barsHTML = data.map((val, index) => {
        const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
        const barLabel = labels[index];
        const valText = formatNumber(val);

        return `
            <div class="bar-item" data-bs-toggle="tooltip" data-bs-placement="top" title="${barLabel}: ${valText}">
                <div class="bar" style="height: ${height}%; background-color: ${color};"></div>
                <div class="bar-label">${barLabel.split(' ')[0]}</div>
                <span class="bar-value">${valText}</span>
            </div>
        `;
    }).join('');

    return `
        <div class="chart-container shadow-sm p-3 bg-white rounded h-100">
            <h5 class="chart-title">${title}</h5>
            <div class="bar-chart">
                ${barsHTML}
            </div>
            <div class="chart-y-label text-muted small">${labelY}</div>
        </div>
    `;
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Si el valor es grande, no animar para evitar sobrecarga
    if (targetValue > 10000) {
        element.textContent = formatNumber(targetValue);
        return;
    }

    const duration = 1500; // milisegundos
    const start = 0;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const current = Math.min(targetValue, start + (targetValue * (progress / duration)));
        element.textContent = formatNumber(current);
        
        if (progress < duration) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = formatNumber(targetValue);
        }
    }

    window.requestAnimationFrame(step);
}

// ---------------------------------------------------------------------
// RENDERIZADO POR SECCIÓN
// ---------------------------------------------------------------------

function renderEducacionAmbiental(container) {
    // Descripción
    container.innerHTML += `
        <div class="section-description">
            <p>Se encarga de concientizar a la comunidad sobre la importancia del cuidado ambiental y la sostenibilidad, a través de talleres, eventos masivos y la implementación de programas educativos permanentes.</p>
        </div>
    `;

    // Filtrar datos para Educación Ambiental
    const data = indicatorsData.filter(row => matchesArea(row, "EDUCACION_AMBIENTAL"));

    const talleres = findIndicator(data, 'TALLERES DE EDUCACIÓN AMBIENTAL');
    const promesaLealtad = findIndicator(data, 'PROMESA DE LEALTAD AL AMBIENTE');

    const hasData = [talleres, promesaLealtad].some(ind => ind['ACUMULADO TOTAL'] > 0);
    if (!hasData) {
        container.innerHTML += `
            <div class="alert alert-info" role="alert">
                <span class="emoji-icon">ℹ️</span>
                No hay indicadores numéricos (KPIs) disponibles en la hoja de datos para esta Dirección.
            </div>
        `;
        return;
    }

    // KPIs
    container.innerHTML += `
        <div class="row g-4 mb-4">
            <div class="col-md-6">
                ${createKpiCard('Participantes en Talleres', talleres['ACUMULADO TOTAL'], '🧑‍🎓', 'kpi-icon-green')}
            </div>
            <div class="col-md-6">
                ${createKpiCard('Participantes en Promesa', promesaLealtad['ACUMULADO TOTAL'], '🤝', 'kpi-icon-blue')}
            </div>
        </div>
    `;

    // Gráfico de Proyección
    const labels = ['Total', '2024', '2025', '2026'];
    const tallerData = [
        talleres['ACUMULADO TOTAL'], 
        talleres['ACUMULADO 2024'], 
        talleres['ACUMULADO 2025'], 
        talleres['ACUMULADO 2026']
    ];
    
    container.innerHTML += `
        <div class="row">
            <div class="col-12">
                ${createBarChart('Proyección de Participantes en Talleres', tallerData, labels, 'var(--color-gestion)', 'Cantidad de Personas')}
            </div>
        </div>
    `;

    // Animaciones
    animateCounter(getKpiId('Participantes en Talleres'), talleres['ACUMULADO TOTAL']);
    animateCounter(getKpiId('Participantes en Promesa'), promesaLealtad['ACUMULADO TOTAL']);

    // Inicializar tooltips
    setTimeout(() => {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }, 100);
}

function renderResiduosUrbanos(container) {
    // Descripción
    container.innerHTML += `
        <div class="section-description">
            <p>Encargada de la recolección, disposición y tratamiento de residuos urbanos, promoviendo la reducción, reutilización y el reciclaje (3R), así como la gestión de puntos limpios y jornadas de limpieza.</p>
        </div>
    `;

    // Filtrar datos para Residuos Urbanos
    const data = indicatorsData.filter(row => matchesArea(row, "RESIDUOS_URBANOS"));
    
    const jornadasLimpieza = findIndicator(data, 'JORNADAS DE LIMPIEZA / RECOLECCIÓN');
    const puntosLimpios = findIndicator(data, 'PUNTOS LIMPIOS INSTALADOS');
    const reciclado = findIndicator(data, 'RECICLADO DE MATERIALES');

    const hasData = [jornadasLimpieza, puntosLimpios, reciclado].some(ind => ind['ACUMULADO TOTAL'] > 0);
    if (!hasData) {
        container.innerHTML += `
            <div class="alert alert-info" role="alert">
                <span class="emoji-icon">ℹ️</span>
                No hay indicadores numéricos (KPIs) disponibles en la hoja de datos para esta Dirección.
            </div>
        `;
        return;
    }

    // KPIs
    container.innerHTML += `
        <div class="row g-4 mb-4">
            <div class="col-md-6 col-lg-4">
                ${createKpiCard('Jornadas de Limpieza', jornadasLimpieza['ACUMULADO TOTAL'], '🧹', 'kpi-icon-green')}
            </div>
            <div class="col-md-6 col-lg-4">
                ${createKpiCard('Puntos Limpios', puntosLimpios['ACUMULADO TOTAL'], '♻️', 'kpi-icon-blue')}
            </div>
            <div class="col-lg-4">
                ${createKpiCard('Material Reciclado (Kg)', reciclado['ACUMULADO TOTAL'], '📦', 'kpi-icon-orange')}
            </div>
        </div>
    `;

    // Gráfico de Proyección
    const labels = ['Total', '2024', '2025', '2026'];
    const recicladoData = [
        reciclado['ACUMULADO TOTAL'], 
        reciclado['ACUMULADO 2024'], 
        reciclado['ACUMULADO 2025'], 
        reciclado['ACUMULADO 2026']
    ];
    
    container.innerHTML += `
        <div class="row">
            <div class="col-12">
                ${createBarChart('Proyección de Material Reciclado', recicladoData, labels, 'var(--color-secundario)', 'Kilogramos')}
            </div>
        </div>
    `;

    // Animaciones
    animateCounter(getKpiId('Jornadas de Limpieza'), jornadasLimpieza['ACUMULADO TOTAL']);
    animateCounter(getKpiId('Puntos Limpios'), puntosLimpios['ACUMULADO TOTAL']);
    animateCounter(getKpiId('Material Reciclado (Kg)'), reciclado['ACUMULADO TOTAL']);
    
    // Inicializar tooltips
    setTimeout(() => {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }, 100);
}

function renderCambioClimatico(container) {
    // Descripción
    container.innerHTML += `
        <div class="section-description">
            <p>Coordina acciones para mitigar los efectos del cambio climático, monitorea la calidad del aire y promueve la implementación de proyectos de energías renovables en el ámbito municipal.</p>
        </div>
    `;

    // Filtrar datos para Cambio Climático
    const data = indicatorsData.filter(row => matchesArea(row, "CAMBIO_CLIMATICO"));
    
    const calidadAire = findIndicator(data, 'MEDICIONES DE CALIDAD DEL AIRE');
    const proyectosRenovables = findIndicator(data, 'PROYECTOS DE ENERGÍAS RENOVABLES');

    const hasData = [calidadAire, proyectosRenovables].some(ind => ind['ACUMULADO TOTAL'] > 0);
    if (!hasData) {
        container.innerHTML += `
            <div class="alert alert-info" role="alert">
                <span class="emoji-icon">ℹ️</span>
                No hay indicadores numéricos (KPIs) disponibles en la hoja de datos para esta Dirección.
            </div>
        `;
        return;
    }

    // KPIs
    container.innerHTML += `
        <div class="row g-4 mb-4">
            <div class="col-md-6">
                ${createKpiCard('Mediciones de Calidad de Aire', calidadAire['ACUMULADO TOTAL'], '💨', 'kpi-icon-purple')}
            </div>
            <div class="col-md-6">
                ${createKpiCard('Proyectos Renovables', proyectosRenovables['ACUMULADO TOTAL'], '☀️', 'kpi-icon-red')}
            </div>
        </div>
    `;

    // Gráfico de Proyección
    const labels = ['Total', '2024', '2025', '2026'];
    const proyectosData = [
        proyectosRenovables['ACUMULADO TOTAL'], 
        proyectosRenovables['ACUMULADO 2024'], 
        proyectosRenovables['ACUMULADO 2025'], 
        proyectosRenovables['ACUMULADO 2026']
    ];
    
    container.innerHTML += `
        <div class="row">
            <div class="col-12">
                ${createBarChart('Proyección de Proyectos Renovables', proyectosData, labels, 'var(--color-primario)', 'Cantidad de Proyectos')}
            </div>
        </div>
    `;

    // Animaciones
    animateCounter(getKpiId('Mediciones de Calidad de Aire'), calidadAire['ACUMULADO TOTAL']);
    animateCounter(getKpiId('Proyectos Renovables'), proyectosRenovables['ACUMULADO TOTAL']);

    // Inicializar tooltips
    setTimeout(() => {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }, 100);
}

function renderPatrulla(container) {
    // Descripción
    container.innerHTML += `
        <div class="section-description">
            <p>Sus funciones incluyen operativos de fiscalización y control de microbasurales, colaboraciones especiales con otras áreas municipales, la generación de reportes diarios/denuncias, y la emisión de actas de infracción y cédulas de notificación.</p>
        </div>
    `;

    // Filtrar datos para Patrulla Ambiental
    const data = indicatorsData.filter(row => matchesArea(row, "PATRULLA_AMBIENTAL"));

    // CORRECCIÓN: Ajuste de nombres de indicadores para coincidir con el Sheet
    const operativos      = findIndicator(data, 'OPERATIVOS DE FISCALIZACIÓN'); // Corregido FIZCALIZACIÓN -> FISCALIZACIÓN
    const colaboraciones = findIndicator(data, 'COLABORACIONES ESPECIALES');
    const reportes       = findIndicator(data, 'REPORTES DIARIOS'); // Buscamos por "REPORTES DIARIOS"
    const actasInfraccion = findIndicator(data, 'ACTAS DE INFRACCIÓN');
    const cedulas        = findIndicator(data, 'CÉDULAS DE NOTIFICACIÓN');


    const hasData = [operativos, colaboraciones, reportes, actasInfraccion, cedulas].some(ind => ind['ACUMULADO TOTAL'] > 0);
    if (!hasData) {
        container.innerHTML += `
            <div class="alert alert-info" role="alert">
                <span class="emoji-icon">ℹ️</span>
                No hay indicadores numéricos (KPIs) disponibles en la hoja de datos para esta Dirección.
            </div>
        `;
        return;
    }

    container.innerHTML += `
        <div class="row g-4 mb-4">
            <div class="col-md-6 col-lg-4">
                ${createKpiCard('Operativos', operativos['ACUMULADO TOTAL'], '🚓', 'kpi-icon-green')}
            </div>
            <div class="col-md-6 col-lg-4">
                ${createKpiCard('Colaboraciones Especiales', colaboraciones['ACUMULADO TOTAL'], '🤝', 'kpi-icon-blue')}
            </div>
            <div class="col-md-6 col-lg-4">
                ${createKpiCard('Reportes Diarios / Denuncias', reportes['ACUMULADO TOTAL'], '📈', 'kpi-icon-orange')}
            </div>
            <div class="col-md-6 col-lg-4">
                ${createKpiCard('Actas de Infracción', actasInfraccion['ACUMULADO TOTAL'], '📝', 'kpi-icon-purple')}
            </div>
            <div class="col-md-6 col-lg-4">
                ${createKpiCard('Cédulas de Notificación', cedulas['ACUMULADO TOTAL'], '📮', 'kpi-icon-red')}
            </div>
        </div>
    `;

    animateCounter(getKpiId('Operativos'), operativos['ACUMULADO TOTAL']);
    animateCounter(getKpiId('Colaboraciones Especiales'), colaboraciones['ACUMULADO TOTAL']);
    animateCounter(getKpiId('Reportes Diarios / Denuncias'), reportes['ACUMULADO TOTAL']);
    animateCounter(getKpiId('Actas de Infracción'), actasInfraccion['ACUMULADO TOTAL']);
    animateCounter(getKpiId('Cédulas de Notificación'), cedulas['ACUMULADO TOTAL']);
}


function renderIntervencionesTerritoriales(container) {
    // Descripción
    container.innerHTML += `
        <div class="section-description">
            <p>Visualización de los barrios de Salta donde se han realizado intervenciones ambientales, incluyendo descacharrado, educación sanitaria o operativos de fiscalización. Haz clic en los marcadores para ver los detalles.</p>
        </div>
    `;

    // Contenedor del mapa y Leyenda
    container.innerHTML += `
        <div id="map-container" class="shadow-sm bg-white rounded">
            <div id="map"></div>
            <div id="map-legend">
                <h5>Barrios Intervenidos</h5>
                <p>Marcadores: Intervenciones puntuales</p>
                <p class="text-muted small">Fuente: Hoja "BARRIOS INTERVENIDOS"</p>
            </div>
        </div>
    `;

    if (barriosData.length === 0 || (barriosData.length === 1 && barriosData[0].nombre === 'Norte Grande')) {
        // Muestra advertencia si solo hay mock data o datos vacíos
        container.querySelector('#map-container').innerHTML = `
            <div class="alert alert-info" role="alert" style="margin: 20px;">
                <span class="emoji-icon">ℹ️</span>
                No hay datos de barrios disponibles para el mapa (o las coordenadas son inválidas).
            </div>
        `;
        return;
    }

    // Inicializar el mapa
    // Coordenadas aproximadas del centro de Salta
    const initialLat = barriosData.length > 0 ? barriosData[0].lat : -24.7821;
    const initialLng = barriosData.length > 0 ? barriosData[0].lng : -65.4116;

    map = L.map('map').setView([initialLat, initialLng], 12);

    // Añadir capa de tiles (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Añadir marcadores
    barriosData.forEach(barrio => {
        const popupContent = `
            <strong>${barrio.nombre}</strong><br>
            Tareas: ${barrio.tareas}
        `;
        L.marker([barrio.lat, barrio.lng])
            .bindPopup(popupContent)
            .addTo(map);
    });
}
