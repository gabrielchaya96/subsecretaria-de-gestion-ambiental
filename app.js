// ---------------------------------------------------------------------
        // CONFIGURACIÓN (EL USUARIO DEBE MODIFICAR ESTO)
        // ---------------------------------------------------------------------
        // REVISA EL ARCHIVO README.md PARA INSTRUCCIONES DETALLADAS
        const CONFIG = {
            // 1. Pega aquí el ID de tu Google Sheet
            GOOGLE_SHEET_ID: '1pV10qTgEWIRtmpVpZEJMFa_G9dluMACSoKFw6JNvFQ4',
            
            // 2. Revisa que los nombres de las hojas (pestañas) sean correctos
            SHEET_INDICADORES: 'INDICADORES',
            SHEET_BARRIOS: 'INDICADORES, BARRIOS INTERVENIDOS',
        };

        // ---------------------------------------------------------------------
        // DATOS DE EJEMPLO (MOCK DATA)
        // ---------------------------------------------------------------------
        // Usados si la carga de Google Sheets falla.
        // Basados en los archivos CSV proporcionados.
        const mockIndicadores = [
            {"INDICADOR": "TALLERES DE EDUCACIÓN AMBIENTAL", "AREA/DEPENDENCIA": "Dir. Gral. de Educación Ambiental", "ACUMULADO TOTAL": 3600, "ACUMULADO 2024": 3600, "ACUMULADO 2025": 2500, "ACUMULADO 2026": 0},
            {"INDICADOR": "PROMESA DE LEALTAD AL AMBIENTE", "AREA/DEPENDENCIA": "Dir. Gral. de Educación Ambiental", "ACUMULADO TOTAL": 5800, "ACUMULADO 2024": 5800, "ACUMULADO 2025": 0, "ACUMULADO 2026": 0},
            {"INDICADOR": "NEUMATÓN", "AREA/DEPENDENCIA": "Dir. Gral. de Economía Circular", "ACUMULADO TOTAL": 2072, "ACUMULADO 2024": 2072, "ACUMULADO 2025": 0, "ACUMULADO 2026": 0},
            {"INDICADOR": "RAEETÓN", "AREA/DEPENDENCIA": "Dir. Gral. de Economía Circular", "ACUMULADO TOTAL": 95.98, "ACUMULADO 2024": 95.98, "ACUMULADO 2025": 0, "ACUMULADO 2026": 0},
            {"INDICADOR": "PUNTOS LIMPIOS INSTALADOS", "AREA/DEPENDENCIA": "Dir. Gral. de Economía Circular", "ACUMULADO TOTAL": 2, "ACUMULADO 2024": 2, "ACUMULADO 2025": 0, "ACUMULADO 2026": 0},
            {"INDICADOR": "MEDICIONES DE CALIDAD DEL AIRE", "AREA/DEPENDENCIA": "Dir. Gral. de Cambio Climático", "ACUMULADO TOTAL": 54, "ACUMULADO 2024": 54, "ACUMULADO 2025": 0, "ACUMULADO 2026": 0},
            {"INDICADOR": "ACCIONES DE DESCACHARRADO", "AREA/DEPENDENCIA": "Dir. Gral. de Cambio Climático", "ACUMULADO TOTAL": 45, "ACUMULADO 2024": 45, "ACUMULADO 2025": 0, "ACUMULADO 2026": 0},
            {"INDICADOR": "CONVENIOS FIRMADOS", "AREA/DEPENDENCIA": "Subsecretaría de Gestión Ambiental", "ACUMULADO TOTAL": 18, "ACUMULADO 2024": 13, "ACUMULADO 2025": 5, "ACUMULADO 2026": 0},
            {"INDICADOR": "CAMPAÑAS DE COMUNICACIÓN", "AREA/DEPENDENCIA": "Subsecretaría de Gestión Ambiental", "ACUMULADO TOTAL": 12, "ACUMULADO 2024": 12, "ACUMULADO 2025": 0, "ACUMULADO 2026": 0},
            {"INDICADOR": "HUERTAS COMUNITARIAS", "AREA/DEPENDENCIA": "Dir. Gral. de Desarrollo Sostenible", "ACUMULADO TOTAL": 5, "ACUMULADO 2024": 5, "ACUMULADO 2025": 0, "ACUMULADO 2026": 0},
        ];

        const mockBarrios = [
            {"NOMBRE DEL BARRIO": "Norte Grande", "TAREAS DESARROLLADAS": "Descacharrado/Educacion Sanitaria Dengue", "lat": -24.819, "lng": -65.422},
            {"NOMBRE DEL BARRIO": "Villa Floresta Alta", "TAREAS DESARROLLADAS": "Descacharrado/Educacion Sanitaria Dengue", "lat": -24.786, "lng": -65.389},
            {"NOMBRE DEL BARRIO": "Bº San Calixto", "TAREAS DESARROLLADAS": "Descacharrado/Educacion Sanitaria Dengue", "lat": -24.825, "lng": -65.435},
            {"NOMBRE DEL BARRIO": "B° VILLA ESMERALDA", "TAREAS DESARROLLADAS": "OPERATIVO MILAGRO", "lat": -24.820, "lng": -65.441},
            {"NOMBRE DEL BARRIO": "B° LIMACHE", "TAREAS DESARROLLADAS": "OPERATIVO MILAGRO", "lat": -24.836, "lng": -65.451},
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

        /**
         * Configura los listeners de clic para la navegación lateral.
         */
        function setupNavigation() {
            const navLinks = document.querySelectorAll('#main-nav .nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Quita 'active' de todos los links
                    navLinks.forEach(l => l.classList.remove('active'));
                    // Añade 'active' al clickeado
                    e.currentTarget.classList.add('active');
                    
                    const sectionName = e.currentTarget.getAttribute('data-section');
                    renderSection(sectionName);
                });
            });
        }

        /**
         * Configura los botones de descarga (CSV y PDF).
         */
        function setupDownloadButtons() {
            document.getElementById('download-csv').addEventListener('click', exportToCSV);
            document.getElementById('download-pdf').addEventListener('click', () => {
                window.print(); // Usa la función de impresión del navegador
            });
        }

        // ---------------------------------------------------------------------
        // FUNCIONES DE RENDERIZADO
        // ---------------------------------------------------------------------

        /**
         * Renderiza la sección solicitada en el área de contenido principal.
         * @param {string} sectionName - El nombre de la sección a renderizar.
         */
        function renderSection(sectionName) {
            const container = document.getElementById('main-content-area');
            container.innerHTML = ''; // Limpia el contenido anterior
            destroyCharts(); // Limpia gráficos anteriores
            destroyMap(); // Limpia mapa anterior

            // Título de la sección
            const title = document.createElement('h2');
            title.className = 'section-title';
            title.textContent = sectionName;
            container.appendChild(title);

            // Router para renderizar la sección correcta
            switch (sectionName) {
                case 'Dir. Gral. de Educación Ambiental':
                    renderEducacion(container);
                    break;
                case 'Dir. Gral. de Desarrollo Sostenible':
                    renderEconomia(container); // Re-usada para Neumatón/RAEE
                    break;
                case 'Dir. Gral. de Cambio Climático':
                    renderCambioClimatico(container);
                    break;
                case 'Dirección de Desarrollo Sostenible':
                    renderDesarrollo(container); // Re-usada para Huertas
                    break;
                case 'Dirección de Inspecciones':
                    renderInspecciones(container);
                    break;
                case 'Dirección de Impacto Ambiental':
                    renderImpacto(container);
                    break;
                case 'Direccion de Patrulla Ambiental':
                    renderPatrulla(container);
                    break;
                case 'Coordinación de Proyectos Ambientales':
                    renderProyectos(container);
                    break;
                case 'Subsecretaría (Articulación)':
                    renderComunicacion(container); // Re-usada para Convenios/Campañas
                    break;
                default:
                    container.innerHTML = '<p>Sección en construcción.</p>';
            }
        }

        /**
         * Renderiza la sección "Educación Ambiental"
         */
        function renderEducacion(container) {
            // 0. Add Description
            container.innerHTML += `
                <div class="section-description">
                    <p>Esta área se encarga de actividades como talleres de educación ambiental, operativos puerta a puerta, la conformación de la mesa intersectorial de Educación Ambiental, eventos de siembra de árboles, capacitación de docentes, y la difusión de contenido ambiental en redes y medios.</p>
                </div>
            `;

            // 1. Filtrar datos
            const data = indicatorsData.filter(row => matchesArea(row, "EDUCACION"));
            const talleres = findIndicator(data, 'TALLERES');
            const promesa = findIndicator(data, 'PROMESA');

            // 2. Crear HTML (KPIs y Gráficos)
            container.innerHTML += `
                <div class="row g-4 mb-4">
                    <!-- KPI Talleres -->
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Niños en Talleres', talleres['ACUMULADO TOTAL'], '🏫', 'kpi-icon-green')}
                    </div>
                    <!-- KPI Promesa -->
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Alumnos en "Promesa al Ambiente"', promesa['ACUMULADO TOTAL'], '👧👦', 'kpi-icon-blue')}
                    </div>
                </div>
                
                <div class="row g-4">
                    <!-- Gráfico de Barras -->
                    <div class="col-lg-12">
                        <div class="chart-container">
                            <h5>Comparativa Anual de Talleres</h5>
                            <!-- Añadido div wrapper con altura fija -->
                <div class="chart-wrapper" style="position: relative; height: 350px;">
                                <!-- Para cumplir con la CSP de GitHub Pages, reemplazamos el <canvas> por un <div>.  -->
                                <!-- El contenedor se identifica por ID y createBarChart insertará en él la gráfica generada con divs -->
                                <div id="chart-talleres"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // 3. Animar contadores
            // Usa getKpiId() para coincidir con los IDs generados dinámicamente
            animateCounter(getKpiId('Niños en Talleres'), talleres['ACUMULADO TOTAL']);
            animateCounter(getKpiId('Alumnos en "Promesa al Ambiente"'), promesa['ACUMULADO TOTAL']);

            // 4. Crear gráfico
            createBarChart(
                'chart-talleres',
                ['2024', '2025', '2026 (Meta)'],
                'Niños capacitados',
                [talleres['ACUMULADO 2024'], talleres['ACUMULADO 2025'], talleres['ACUMULADO 2026']],
                '#009a44'
            );
        }

        /**
         * Renderiza la sección "Economía Circular"
         */
        function renderEconomia(container) {
            // 0. Add Description
            container.innerHTML += `
                <div class="section-description">
                    <p>Participa en actividades como el Neumatón (recolección de Neumáticos Fuera de Uso), la RAEETÓN (recolección de Residuos Electrónicos y Eléctricos en Desuso), la formulación de proyectos, la instalación de Ecopuntos y Puntos Limpios, y la coordinación de retiros masivos de NFU.</p>
                    <p class="fw-bold small text-muted mb-0">Nota: Los indicadores (Neumatón, RAEETÓN, Puntos Limpios) provienen de los datos de "Dir. Gral. de Economía Circular" y se muestran aquí según la nueva estructura de áreas.</p>
                </div>
            `;

            const data = indicatorsData.filter(row => matchesArea(row, "DESARROLLO_SOSTENIBLE"));
            const neumaticos = findIndicator(data, 'NEUMATÓN');
            const raee = findIndicator(data, 'RAEETÓN');
            const puntosLimpios = findIndicator(data, 'PUNTOS LIMPIOS');

            container.innerHTML += `
                <div class="row g-4 mb-4">
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Neumáticos (Tn)', neumaticos['ACUMULADO TOTAL'], '🚚', 'kpi-icon-orange')}
                    </div>
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('RAEE (Tn)', raee['ACUMULADO TOTAL'], '💻', 'kpi-icon-purple')}
                    </div>
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Puntos Limpios Instalados', puntosLimpios['ACUMULADO TOTAL'], '📍', 'kpi-icon-green')}
                    </div>
                </div>
                
                <div class="row g-4">
                    <!-- Mapa de Puntos Limpios -->
                    <div class="col-lg-12">
                        <div class="chart-container">
                            <h5>Mapa de Puntos Limpios</h5>
                            <div id="map"></div>
                        </div>
                    </div>
                </div>
            `;
            
            animateCounter(getKpiId('Neumáticos (Tn)'), neumaticos['ACUMULADO TOTAL']);
            animateCounter(getKpiId('RAEE (Tn)'), raee['ACUMULADO TOTAL']);
            animateCounter(getKpiId('Puntos Limpios Instalados'), puntosLimpios['ACUMULADO TOTAL']);

            // Inicializar mapa con Puntos Limpios (usando mock data)
            initializeMap(mockPuntosLimpios, 'punto-limpio');
        }

        /**
         * Renderiza la sección "Cambio Climático"
         */
        function renderCambioClimatico(container) {
            // 0. Add Description
            container.innerHTML += `
                <div class="section-description">
                    <p>Colabora en la RAEETÓN, el Neumatón (a través de la certificación de disposición final), y se enfoca en el mapeo de calidad de aire y ruido ambiental, el relevamiento y toma de muestras de agua en los ríos Arias-Arenales, la implementación de Biobardas, y las actividades de descacharrado y retiro de chatarra.</p>
                </div>
            `;

            const data = indicatorsData.filter(row => matchesArea(row, "CAMBIO_CLIMATICO"));
            const medicionesAire = findIndicator(data, 'MEDICIONES DE CALIDAD');
            const descacharrado = findIndicator(data, 'DESCACHARRADO');
            
            // Filtrar barrios intervenidos para descacharrado
            const barriosIntervenidos = barriosData.filter(b => b['TAREAS DESARROLLADAS'].toLowerCase().includes('descacharrado'));

            container.innerHTML += `
                <div class="row g-4 mb-4">
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Mediciones Calidad de Aire', medicionesAire['ACUMULADO TOTAL'], '🌬️', 'kpi-icon-blue')}
                    </div>
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Barrios con Descacharrado', barriosIntervenidos.length, '🏠', 'kpi-icon-red')}
                    </div>
                </div>
                
                <div class="row g-4">
                    <!-- Mapa de Intervenciones -->
                    <div class="col-lg-12">
                        <div class="chart-container">
                            <h5>Mapa de Barrios Intervenidos (Descacharrado)</h5>
                            <div id="map"></div>
                        </div>
                    </div>
                </div>
            `;
            
            animateCounter(getKpiId('Mediciones Calidad de Aire'), medicionesAire['ACUMULADO TOTAL']);
            animateCounter(getKpiId('Barrios con Descacharrado'), barriosIntervenidos.length);

            // Inicializar mapa con barrios
            initializeMap(barriosIntervenidos, 'barrio');
        }

        /**
         * Renderiza la sección "Desarrollo Sostenible"
         */
        function renderDesarrollo(container) {
            // 0. Add Description
            container.innerHTML += `
                <div class="section-description">
                    <p>Se menciona en tareas de formulación de proyectos y relevamiento a plantas de tratamiento. El indicador de "Huertas" proviene de los datos de "Dir. Gral. de Desarrollo Sostenible".</p>
                </div>
            `;

            const data = indicatorsData.filter(row => matchesArea(row, "DESARROLLO_SOSTENIBLE"));
            const huertas = findIndicator(data, 'HUERTAS');

            container.innerHTML += `
                <div class="row g-4 mb-4">
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Huertas Comunitarias', huertas['ACUMULADO TOTAL'], '🥕', 'kpi-icon-orange')}
                    </div>
                </div>
                <div class="row g-4">
                    <div class="col-lg-12">
                        <div class="chart-container">
                            <h5>Comparativa Huertas Creadas</h5>
                            <!-- Añadido div wrapper con altura fija -->
                            <div class="chart-wrapper" style="position: relative; height: 350px;">
                                <!-- Para cumplir con la CSP de GitHub Pages, reemplazamos el <canvas> por un <div>.  -->
                                <div id="chart-huertas"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            animateCounter(getKpiId('Huertas Comunitarias'), huertas['ACUMULADO TOTAL']);
            
            createBarChart(
                'chart-huertas',
                ['2024', '2025', '2026 (Meta)'],
                'Huertas',
                [huertas['ACUMULADO 2024'], huertas['ACUMULADO 2025'], huertas['ACUMULADO 2026']],
                '#ff8c00'
            );
        }

        /**
         * Renderiza la sección "Comunicación y Articulación"
         */
        function renderComunicacion(container) {
            // 0. Add Description
            container.innerHTML += `
                <div class="section-description">
                    <p>Indicadores de alto nivel gestionados directamente por la Subsecretaría, incluyendo convenios interinstitucionales y campañas de comunicación masiva.</p>
                </div>
            `;

            const data = indicatorsData.filter(row => matchesArea(row, "SUBSECRETARIA"));
            const convenios = findIndicator(data, 'CONVENIOS');
            const campanas = findIndicator(data, 'CAMPAÑAS');

            container.innerHTML += `
                <div class="row g-4 mb-4">
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Convenios Firmados', convenios['ACUMULADO TOTAL'], '🤝', 'kpi-icon-purple')}
                    </div>
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Campañas de Comunicación', campanas['ACUMULADO TOTAL'], '🎤', 'kpi-icon-blue')}
                    </div>
                </div>
            `;
            
            animateCounter(getKpiId('Convenios Firmados'), convenios['ACUMULADO TOTAL']);
            animateCounter(getKpiId('Campañas de Comunicación'), campanas['ACUMULADO TOTAL']);
        }


        // ----- NUEVAS FUNCIONES PARA ÁREAS SIN DATOS -----
        function renderInspecciones(container) {
            // Descripción de la Dirección
            container.innerHTML += `
                <div class="section-description">
                    <p>Realiza inspecciones, inspecciones conjuntas (con la Dirección de Inspecciones Comerciales), labra actas de comprobación y actas de clausura, y ejecuta operativos de fiscalización.</p>
                </div>
            `;

            // Filtrar datos para la Dirección de Inspecciones (usando normalización de acentos)
            const data = indicatorsData.filter(row => matchesArea(row, "INSPECCIONES"));

            // Indicadores específicos de esta área
            const inspRealizadas   = findIndicator(data, 'INSPECCIONES REALIZADAS');
            const inspConjuntas    = findIndicator(data, 'INSPECCIONES CONJUNTAS');
            const actasComprobacion = findIndicator(data, 'ACTAS DE COMPROBACIÓN');
            const actasClausura    = findIndicator(data, 'ACTAS DE CLAUSURA');
            const operativos       = findIndicator(data, 'OPERATIVOS');

            // Verificar si hay algún indicador con valor > 0
            const hasData = [inspRealizadas, inspConjuntas, actasComprobacion, actasClausura, operativos].some(ind => ind['ACUMULADO TOTAL'] > 0);
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
                        ${createKpiCard('Inspecciones Realizadas',   inspRealizadas['ACUMULADO TOTAL'], '🔍', 'kpi-icon-green')}
                    </div>
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Inspecciones Conjuntas',    inspConjuntas['ACUMULADO TOTAL'], '👥', 'kpi-icon-blue')}
                    </div>
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Actas de Comprobación',     actasComprobacion['ACUMULADO TOTAL'], '📄', 'kpi-icon-orange')}
                    </div>
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Actas de Clausura',         actasClausura['ACUMULADO TOTAL'], '📑', 'kpi-icon-purple')}
                    </div>
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Operativos',                operativos['ACUMULADO TOTAL'], '🚨', 'kpi-icon-red')}
                    </div>
                </div>
            `;

            // Animar contadores
            animateCounter(getKpiId('Inspecciones Realizadas'), inspRealizadas['ACUMULADO TOTAL']);
            animateCounter(getKpiId('Inspecciones Conjuntas'), inspConjuntas['ACUMULADO TOTAL']);
            animateCounter(getKpiId('Actas de Comprobación'), actasComprobacion['ACUMULADO TOTAL']);
            animateCounter(getKpiId('Actas de Clausura'), actasClausura['ACUMULADO TOTAL']);
            animateCounter(getKpiId('Operativos'), operativos['ACUMULADO TOTAL']);
        }

        function renderImpacto(container) {
            // Descripción de la Dirección
            container.innerHTML += `
                <div class="section-description">
                    <p>Es responsable de la emisión de las Resoluciones de CAAM (Certificado de Aptitud Ambiental) y de la capacitación o asesoramiento para la obtención del mismo.</p>
                </div>
            `;

            // Filtrar datos para Impacto Ambiental
            const data = indicatorsData.filter(row => matchesArea(row, "IMPACTO_AMBIENTAL"));

            // Indicadores específicos
            const resoluciones = findIndicator(data, 'RESOLUCIONES DE CAAM');
            const capacitaciones = findIndicator(data, 'CAPACITACIONES');

            const hasData = [resoluciones, capacitaciones].some(ind => ind['ACUMULADO TOTAL'] > 0);
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
                        ${createKpiCard('Resoluciones de CAAM', resoluciones['ACUMULADO TOTAL'], '📜', 'kpi-icon-green')}
                    </div>
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Capacitaciones CAAM', capacitaciones['ACUMULADO TOTAL'], '🎓', 'kpi-icon-blue')}
                    </div>
                </div>
            `;

            animateCounter(getKpiId('Resoluciones de CAAM'), resoluciones['ACUMULADO TOTAL']);
            animateCounter(getKpiId('Capacitaciones CAAM'), capacitaciones['ACUMULADO TOTAL']);
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

            const operativos      = findIndicator(data, 'OPERATIVOS DE FIZCALIZACIÓN');
            const colaboraciones = findIndicator(data, 'COLABORACIONES ESPECIALES');
            const reportes       = findIndicator(data, 'REPORTES REALIZADOS');
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
                        ${createKpiCard('Reportes Realizados', reportes['ACUMULADO TOTAL'], '📈', 'kpi-icon-orange')}
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
            animateCounter(getKpiId('Reportes Realizados'), reportes['ACUMULADO TOTAL']);
            animateCounter(getKpiId('Actas de Infracción'), actasInfraccion['ACUMULADO TOTAL']);
            animateCounter(getKpiId('Cédulas de Notificación'), cedulas['ACUMULADO TOTAL']);
        }

        function renderProyectos(container) {
            container.innerHTML += `
                <div class="section-description">
                    <p>Se encarga de la puesta a punto, el enriquecimiento y el mantenimiento de espacios verdes (plazas, platabandas, rotondas, etc.).</p>
                </div>
            `;

            const data = indicatorsData.filter(row => matchesArea(row, "PROYECTOS_AMBIENTALES"));
            const puesta   = findIndicator(data, 'PUESTA A PUNTO');
            const enriquec = findIndicator(data, 'ENRIQUECIMIENTO');
            const manteni  = findIndicator(data, 'MANTENIMIENTO');

            const hasData = [puesta, enriquec, manteni].some(ind => ind['ACUMULADO TOTAL'] > 0);
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
                        ${createKpiCard('Puesta a Punto', puesta['ACUMULADO TOTAL'], '🌱', 'kpi-icon-green')}
                    </div>
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Enriquecimiento', enriquec['ACUMULADO TOTAL'], '🌿', 'kpi-icon-blue')}
                    </div>
                    <div class="col-md-6 col-lg-4">
                        ${createKpiCard('Mantenimiento', manteni['ACUMULADO TOTAL'], '🌳', 'kpi-icon-orange')}
                    </div>
                </div>
            `;

            animateCounter(getKpiId('Puesta a Punto'), puesta['ACUMULADO TOTAL']);
            animateCounter(getKpiId('Enriquecimiento'), enriquec['ACUMULADO TOTAL']);
            animateCounter(getKpiId('Mantenimiento'), manteni['ACUMULADO TOTAL']);
        }


        // ---------------------------------------------------------------------
        // FUNCIONES DE COMPONENTES (Generadores de HTML)
        // ---------------------------------------------------------------------

        /**
         * Crea el HTML para una tarjeta de KPI.
         * @param {string} label - El texto descriptivo.
         * @param {number} value - El valor numérico.
         * @param {string} iconClass - Clase de FontAwesome (ej. 'fa-solid fa-users').
         * @param {string} colorClass - Clase de color (ej. 'kpi-icon-green').
         */
        function createKpiCard(label, value, iconClass, colorClass) {
            const safeValue = value || 0;
            const kpiId = `kpi-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            
            return `
                <div class="kpi-card">
                    <div class="card-body">
                        <div class="kpi-card-icon ${colorClass}">
                            <span class="emoji-icon">${iconClass}</span>
                        </div>
                        <div class="kpi-card-content">
                            <div class="kpi-value" id="${kpiId}">0</div>
                            <p class="kpi-label">${label}</p>
                        </div>
                    </div>
                </div>
            `;
        }


        // ---------------------------------------------------------------------
        // FUNCIONES DE GRÁFICOS Y MAPAS
        // ---------------------------------------------------------------------

        /**
         * Crea un gráfico de barras.
         * @param {string} canvasId - ID del elemento <canvas>.
         * @param {string[]} labels - Etiquetas del eje X.
         * @param {string} dataLabel - Etiqueta para el dataset.
         * @param {number[]} data - Array de valores.
         * @param {string} color - Color de las barras.
         */
        function createBarChart(containerId, labels, dataLabel, data, color = '#02b3e4') {
            /**
             * Genera una gráfica de barras simple sin dependencias externas.
             * En lugar de usar Chart.js (que está bloqueado por la CSP de GitHub
             * Pages), esta función construye las barras con elementos <div> y
             * aplica estilos CSS para representar la proporción de cada valor.
             *
             * @param {string} containerId ID del elemento contenedor donde se dibujará la gráfica.
             * @param {string[]} labels Etiquetas de las barras (eje X).
             * @param {string} dataLabel Etiqueta descriptiva (no utilizada en esta versión).
             * @param {number[]} data Conjunto de valores a representar.
             * @param {string} color Color en formato CSS para las barras.
             */
            const container = document.getElementById(containerId);
            if (!container) return;

            // Limpia cualquier gráfico previo
            container.innerHTML = '';

            // Crea un contenedor para las barras
            const barChartEl = document.createElement('div');
            barChartEl.classList.add('simple-bar-chart');

            // Obtiene el valor máximo para escalar las alturas
            const maxValue = Math.max(...data, 1);

            data.forEach((value, index) => {
                const bar = document.createElement('div');
                bar.classList.add('bar');
                bar.style.backgroundColor = color;
                // Altura proporcional en porcentaje
                const heightPercent = (value / maxValue) * 100;
                bar.style.height = `${heightPercent}%`;

                // Valor mostrado encima de la barra
                const spanValue = document.createElement('span');
                spanValue.textContent = value.toLocaleString('es-AR');
                bar.appendChild(spanValue);

                // Etiqueta debajo de la barra
                const labelEl = document.createElement('div');
                labelEl.classList.add('label');
                labelEl.textContent = labels[index];
                bar.appendChild(labelEl);

                barChartEl.appendChild(bar);
            });

            container.appendChild(barChartEl);
        }

        /**
         * Destruye todas las instancias de Chart.js activas.
         */
        function destroyCharts() {
            Object.values(chartInstances).forEach(chart => chart.destroy());
            chartInstances = {};
        }

        /**
         * Inicializa una instancia de Leaflet Map.
         * @param {Array} markersData - Array de objetos con {lat, lng, ...}.
         * @param {string} type - 'barrio' o 'punto-limpio' para el popup.
         */
        function initializeMap(markersData, type) {
            if (mapInstance) {
                mapInstance.remove();
                mapInstance = null;
            }

            const mapEl = document.getElementById('map');
            if (!mapEl) return;

            mapInstance = L.map('map').setView(SALTA_CENTER, 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance);

            // Iconos personalizados
            const barrioIcon = L.icon({
                iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D90429" width="32px" height="32px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'),
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });
            
            const puntoLimpioIcon = L.icon({
                iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#009A44" width="32px" height="32px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'),
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });

            // Añadir marcadores
            markersData.forEach(d => {
                if (d.lat && d.lng) {
                    let popupContent = '';
                    let icon = barrioIcon;

                    if (type === 'barrio') {
                        popupContent = `<strong>${d['NOMBRE DEL BARRIO']}</strong><br>${d['TAREAS DESARROLLADAS']}`;
                        icon = barrioIcon;
                    } else if (type === 'punto-limpio') {
                        popupContent = `<strong>${d['NOMBRE']}</strong><br>${d['DIRECCION']}`;
                        icon = puntoLimpioIcon;
                    }
                    
                    L.marker([d.lat, d.lng], { icon: icon })
                        .addTo(mapInstance)
                        .bindPopup(popupContent);
                }
            });
            
            // Ajustar el zoom a los marcadores si hay datos
            if (markersData.length > 0) {
                const group = new L.featureGroup(markersData.map(d => L.marker([d.lat, d.lng])));
                mapInstance.fitBounds(group.getBounds().pad(0.1));
            }
        }
        
        /**
         * Destruye la instancia de Leaflet Map.
         */
        function destroyMap() {
            if (mapInstance) {
                mapInstance.remove();
                mapInstance = null;
            }
        }


        // ---------------------------------------------------------------------
        // FUNCIONES DE UTILIDAD
        // ---------------------------------------------------------------------

        /**
         * Anima un número contador de 0 hasta el valor final.
         * @param {string} id - ID del elemento HTML que contiene el número.
         * @param {number} endValue - El valor final.
         */
        function animateCounter(id, endValue) {
            const el = document.getElementById(id);
            if (!el) return;

            let startValue = 0;
            const duration = 1500; // 1.5 segundos
            const stepTime = 20; // ms
            const steps = duration / stepTime;
            const increment = endValue / steps;
            
            const isFloat = endValue % 1 !== 0;

            const timer = setInterval(() => {
                startValue += increment;
                if (startValue >= endValue) {
                    clearInterval(timer);
                    el.textContent = isFloat ? endValue.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : endValue.toLocaleString('es-AR');
                } else {
                    el.textContent = isFloat ? startValue.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : Math.ceil(startValue).toLocaleString('es-AR');
                }
            }, stepTime);
        }

        /**
         * Busca un indicador en el array de datos por su nombre.
         * @param {Array} data - Array de indicadores.
         * @param {string} nameSubstring - Substring del nombre a buscar.
         */
        function findIndicator(data, nameSubstring) {
                console.log("findIndicator buscando:", nameSubstring);
                console.log("Dentro de data:", data);

            /**
             * Busca un indicador dentro de un conjunto de datos. La comparación ignora
             * tildes/acentos y diferencia entre mayúsculas y minúsculas, para que
             * "neumaton" coincida tanto con "NEUMATÓN" como con "Neumaton".
             *
             * @param {Array} data Array de objetos con la propiedad INDICADOR.
             * @param {string} nameSubstring Substring a buscar dentro del nombre del indicador.
             * @returns {Object} El primer objeto que coincide, o un objeto con valores 0.
             */
            // Función para normalizar textos (elimina diacríticos y convierte a minúsculas)
            const normalize = (str) => {
                return (str || '')
                    .normalize('NFD') // Descompone caracteres acentuados en base + marca diacrítica
                    .replace(/[\u0300-\u036f]/g, '') // Elimina marcas diacríticas
                    .toLowerCase();
            };
            const target = normalize(nameSubstring);
            return data.find(d => d.INDICADOR && normalize(d.INDICADOR).includes(target)) ||
                   { "ACUMULADO TOTAL": 0, "ACUMULADO 2024": 0, "ACUMULADO 2025": 0, "ACUMULADO 2026": 0 };
        }

        /**
         * Genera el ID de un KPI a partir de su etiqueta, siguiendo la misma
         * transformación que se usa en createKpiCard(). Esta utilidad evita
         * discrepancias cuando las etiquetas contienen caracteres acentuados
         * o símbolos que se reemplazan por guiones.
         * @param {string} label Etiqueta original del KPI.
         * @returns {string} ID generado (prefijo kpi-).
         */
        function getKpiId(label) {
            return 'kpi-' + label
                .toLowerCase()
                // Reemplaza cualquier caracter que no sea a-z o 0-9 por guion
                .replace(/[^a-z0-9]/g, '-')
                // Sustituye múltiples guiones por uno solo
                .replace(/-+/g, '-')
                // Elimina guiones al inicio o fin
                .replace(/^-|-$/g, '');
        }

        /**
         * Filtra el array global de indicadores por área/dependencia. La comparación
         * ignora tildes y mayúsculas/minúsculas para que "Dirección de Inspecciones" coincida
         * con "Dir. Inspecciones" u otras variantes.
         *
         * @param {string} areaName Nombre (o parte) del área a buscar.
         * @returns {Array} Subconjunto de indicatorsData correspondiente al área.
         */
        function filterByArea(areaName) {
            const normalize = (str) => {
                return (str || '')
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase();
            };
            const target = normalize(areaName);
            return indicatorsData.filter(d => normalize(d['AREA/DEPENDENCIA']).includes(target));
        }
        
        /**
         * Exporta los datos de indicadores a un archivo CSV.
         */
        function exportToCSV() {
            if (!indicatorsData.length) {
                console.error("No hay datos de indicadores para exportar.");
                return;
            }

            const headers = Object.keys(indicatorsData[0]);
            let csvContent = "data:text/csv;charset=utf-8,";
            
            csvContent += headers.join(";") + "\r\n"; // Encabezados

            // Filas
            indicatorsData.forEach(row => {
                const values = headers.map(header => {
                    let cell = row[header] === null || row[header] === undefined ? '' : row[header];
                    cell = String(cell).replace(/"/g, '""'); // Escapar comillas dobles
                    if (cell.includes(';') || cell.includes(',')) {
                        cell = `"${cell}"`; // Envolver en comillas si contiene separador
                    }
                    return cell;
                });
                csvContent += values.join(";") + "\r\n";
            });

            // Crear y descargar el archivo
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "reporte_gestion_ambiental.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // ---------------------------------------------------------------------
        // LECTOR DE GOOGLE SHEETS (gviz)
        // ---------------------------------------------------------------------

        /**
         * Obtiene y parsea datos de una Google Sheet pública.
         * @param {string} sheetId - El ID de la Google Sheet.
         * @param {string} sheetName - El nombre de la pestaña (hoja).
         */
        async function fetchGoogleSheetData(sheetId, sheetName) {
            if (sheetId === 'REEMPLAZA_CON_TU_GOOGLE_SHEET_ID') {
                throw new Error("ID de Google Sheet no configurado.");
            }
            
            const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error al cargar datos de Google Sheet: ${response.statusText}`);
            }

            let text = await response.text();
            
            // El API gviz devuelve JSONP, no JSON. Hay que limpiarlo.
            // Respuesta: google.visualization.Query.setResponse({...});
            // 1. Encontrar el primer '(' y el último ')'
            const startIndex = text.indexOf('(') + 1;
            const endIndex = text.lastIndexOf(')');
            
            if (startIndex === 0 || endIndex === -1) {
                throw new Error("Respuesta de Google Sheet inválida.");
            }

            // 2. Extraer el JSON
            const jsonText = text.substring(startIndex, endIndex);
            
            // 3. Parsear el JSON
            const data = JSON.parse(jsonText);
            
            if (data.status === 'error') {
                throw new Error(`Error en API de Google Sheet: ${data.errors.map(e => e.detailed_message).join(', ')}`);
            }

            // 4. Convertir el formato de Google (cols/rows) a un array de objetos
            return parseGoogleSheetResponse(data.table);
        }
        
        /**
         * Convierte la respuesta de gviz en un array de objetos.
         * @param {object} table - El objeto 'table' de la respuesta gviz.
         */
        function parseGoogleSheetResponse(table) {
            const headers = table.cols.map(col => col.label || col.id);
            const rows = table.rows.map(row => {
                const obj = {};
                row.c.forEach((cell, i) => {
                    const header = headers[i];
                    let value = null;
                    if (cell) {
                        value = cell.f || cell.v; // 'f' es valor formateado, 'v' es valor crudo
                    }
                    // Intentar convertir números
                    if (typeof value === 'string' && !isNaN(parseFloat(value.replace(',', '.')))) {
                        obj[header] = parseFloat(value.replace(',', '.'));
                    } else {
                        obj[header] = value;
                    }
                });
                return obj;
            });
            return rows;
        }
// ----------------------------------------------------
// MAPPING OFICIAL DE ÁREAS (normalización unificada)
// ----------------------------------------------------

const areaMapping = {
    EDUCACION: [
        "direccion general de educacion ambiental",
        "direccion gral de educacion ambiental",
        "direccion general de educacion ambiental- direccion general de desarrollo sostenible",
        "direccion general de educacion ambiental- direccion general de desarrollo sostenible- direccion generla de cambio climatico"
    ],

    DESARROLLO_SOSTENIBLE: [
        "direccion general de desarrollo sostenible",
        "direccion gral de desarrollo sostenible",
        "direccion de desarrollo sostenible",
        "direccion general de desarrollo sostenible / direccion general de cambio climatico",
        "direccion de desarrollo sostenible / direccion de cambio climatico"
    ],

    CAMBIO_CLIMATICO: [
        "direccion de cambio climatico",
        "direccion general de cambio climatico",
        "direccion generla de cambio climatico",
        "direccion general de desarrollo sostenible- direccion generla de cambio climatico"
    ],

    INSPECCIONES: [
        "direccion de inspecciones",
        "direccion de inspecciones/direccion de inspecciones comerciales"
    ],

    IMPACTO_AMBIENTAL: [
        "direccion de impacto ambiental"
    ],

    PATRULLA_AMBIENTAL: [
        "direccion de patrulla ambiental"
    ],

    PROYECTOS_AMBIENTALES: [
        "coordinacion de proyectos ambientales"
    ],

    SUBSECRETARIA: [
        "subsecretaria de gestion ambiental"
    ]
};

/**
 * Normaliza si un registro pertenece al área seleccionada.
 */
function matchesArea(row, areaKey) {
    const rawValue =
        row["AREA/DEPENDENCIA"] ||
        row["AREA / DEPENDENCIA"] ||
        row["ÁREA/DEPENDENCIA"] ||
        row["SUBSECRETARIA/DIRECCION GRAL/DIRECCION/AREA"] ||
        "";

    const normalize = (str) =>
        (str || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();

    const normalizedRow = normalize(rawValue);

    return areaMapping[areaKey].some((pattern) =>
        normalizedRow.includes(normalize(pattern))
    );
}
// Parser CSV simple (comillas, comas y saltos de línea)
function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = text[i+1];
        if (inQuotes) {
            if (ch === '"' && next === '"') {
                cell += '"'; i++; // comilla escapada
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                cell += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                row.push(cell); cell = '';
            } else if (ch === '\n') {
                row.push(cell); rows.push(row); row = []; cell = '';
            } else if (ch === '\r') {
                // ignore CR
            } else {
                cell += ch;
            }
        }
    }
    row.push(cell); rows.push(row);
    // Limpia filas vacías al final
    while (rows.length && rows[rows.length-1].length === 1 && rows[rows.length-1][0] === '') rows.pop();
    return rows;
}
