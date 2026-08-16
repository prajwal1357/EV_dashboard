// ============================================================================
// EV FLEET ANALYTICS PLATFORM - WORLD-CLASS FULL-STACK WEB APP LOGIC
// Team EcoPulse - Capstone Project Submission
// ============================================================================

let chartInstances = {};
let fleetMapInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initTabs();
    initFilterListeners();
    initTableSearch();
    initTableSortingAndExport();
    initBatteryCellVisualizer();
    initChargingPhysicsSimulator();
    initRouteEstimator();
    renderCharts();
    initAIAssistant();
    startLiveTelemetryStream();
});

// 1. Theme Toggle Logic (Light / Dark Mode Switcher)
function initThemeToggle() {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (!themeBtn) return;

    const currentTheme = localStorage.getItem('ev_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeButtonUI(currentTheme);

    themeBtn.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('ev_theme', nextTheme);
        updateThemeButtonUI(nextTheme);
        
        // Re-render Chart.js colors for theme
        if (typeof Chart !== 'undefined') {
            Chart.defaults.color = nextTheme === 'light' ? '#475569' : '#94A3B8';
            Object.values(chartInstances).forEach(chart => chart.update());
        }
    });
}

function updateThemeButtonUI(theme) {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (!themeBtn) return;

    if (theme === 'light') {
        themeBtn.innerHTML = '<span class="theme-icon">☀️</span> <span class="theme-text">Light Mode</span>';
    } else {
        themeBtn.innerHTML = '<span class="theme-icon">🌙</span> <span class="theme-text">Dark Mode</span>';
    }
}

// 2. Tab Router Switcher Logic & Map Initialization
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const target = btn.getAttribute('data-tab');
            const targetEl = document.getElementById(target);
            if (targetEl) targetEl.classList.add('active');

            // If user clicked the Map tab, initialize or resize Leaflet Map
            if (target === 'tab-map') {
                setTimeout(() => {
                    initFleetMap();
                }, 100);
            }
        });
    });
}

// 3. Leaflet Interactive Fleet Location Map (Karnataka EV Hubs)
function initFleetMap() {
    const mapContainer = document.getElementById('fleetMap');
    if (!mapContainer || typeof L === 'undefined') return;

    if (fleetMapInstance) {
        fleetMapInstance.invalidateSize();
        return;
    }

    // Coordinates for Karnataka EV Fleet City Hubs
    const hubs = [
        { name: "Bengaluru EV Hub (HQ)", lat: 12.9716, lng: 77.5946, fleet: "Premium Fleet & EcoPulse", ports: 48, activeEVs: 1420, soh: "95.2%" },
        { name: "Mangalore Coastal Hub", lat: 12.9141, lng: 74.8560, fleet: "Premium Fleet & Express Logistics", ports: 26, activeEVs: 850, soh: "94.8%" },
        { name: "Belagavi Northern Depot", lat: 15.8497, lng: 74.4977, fleet: "Green Mobility & EcoPulse", ports: 22, activeEVs: 720, soh: "89.1%" },
        { name: "Mysuru Royal Station", lat: 12.2958, lng: 76.6394, fleet: "Green Mobility", ports: 24, activeEVs: 810, soh: "96.4%" },
        { name: "Hubballi Transport Hub", lat: 15.3647, lng: 75.1240, fleet: "Express Logistics", ports: 22, activeEVs: 1200, soh: "88.9%" }
    ];

    fleetMapInstance = L.map('fleetMap').setView([14.2, 75.8], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | EV Fleet Analytics'
    }).addTo(fleetMapInstance);

    hubs.forEach(hub => {
        const marker = L.marker([hub.lat, hub.lng]).addTo(fleetMapInstance);
        const popupContent = `
            <div class="map-popup-card">
                <h4>⚡ ${hub.name}</h4>
                <p><strong>Operating Fleets:</strong> ${hub.fleet}</p>
                <p><strong>Fast Charging Ports:</strong> <span class="popup-stat">${hub.ports} Active</span></p>
                <p><strong>Active Fleet Vehicles:</strong> <span class="popup-stat">${hub.activeEVs.toLocaleString()}</span></p>
                <p><strong>Depot Average SOH:</strong> <span class="popup-stat" style="color: #10B981;">${hub.soh}</span></p>
                <button onclick="filterByCity('${hub.name.split(' ')[0]}')" style="margin-top: 0.5rem; background: #00F0FF; border: none; color: #040817; padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%;">Filter Fleet Analytics</button>
            </div>
        `;
        marker.bindPopup(popupContent);
    });
}

function filterByCity(cityName) {
    const citySel = document.getElementById('citySelect');
    if (citySel) {
        citySel.value = cityName;
        citySel.dispatchEvent(new Event('change'));
        // Switch to Executive tab to view results
        const execTabBtn = document.querySelector('[data-tab="tab-executive"]');
        if (execTabBtn) execTabBtn.click();
    }
}

// 4. Global Interactive Filter Listeners & Dynamic KPI Calculation
function initFilterListeners() {
    const fleetSel = document.getElementById('fleetSelect');
    const citySel = document.getElementById('citySelect');
    const modelSel = document.getElementById('modelSelect');
    const statusSel = document.getElementById('statusSelect');
    const typeSel = document.getElementById('typeSelect');

    const updateFilterHandler = () => {
        const fleetVal = fleetSel ? fleetSel.value : 'ALL';
        const cityVal = citySel ? citySel.value : 'ALL';
        const modelVal = modelSel ? modelSel.value : 'ALL';
        const statusVal = statusSel ? statusSel.value : 'ALL';
        const typeVal = typeSel ? typeSel.value : 'ALL';

        console.log(`[Web App Filter] Fleet: ${fleetVal}, City: ${cityVal}, Model: ${modelVal}, Status: ${statusVal}, Type: ${typeVal}`);
        updateKPIValues(fleetVal, cityVal, modelVal, statusVal, typeVal);
    };

    if (fleetSel) fleetSel.addEventListener('change', updateFilterHandler);
    if (citySel) citySel.addEventListener('change', updateFilterHandler);
    if (modelSel) modelSel.addEventListener('change', updateFilterHandler);
    if (statusSel) statusSel.addEventListener('change', updateFilterHandler);
    if (typeSel) typeSel.addEventListener('change', updateFilterHandler);
}

function updateKPIValues(fleet, city, model, status, type) {
    let baseCount = 5000;
    let baseEnergy = 184.2;
    let baseCost = 1842500;
    let baseSOH = 93.8;

    if (fleet !== 'ALL') { baseCount = Math.round(baseCount * 0.28); baseEnergy = +(baseEnergy * 0.28).toFixed(1); baseCost = Math.round(baseCost * 0.28); }
    if (city !== 'ALL') { baseCount = Math.round(baseCount * 0.35); baseEnergy = +(baseEnergy * 0.35).toFixed(1); baseCost = Math.round(baseCost * 0.35); }
    if (model !== 'ALL') { baseCount = Math.round(baseCount * 0.22); baseEnergy = +(baseEnergy * 0.22).toFixed(1); baseCost = Math.round(baseCost * 0.22); }
    if (status !== 'ALL') {
        if (status === 'Critical') baseSOH = 76.5;
        if (status === 'Moderate') baseSOH = 85.2;
        if (status === 'Healthy') baseSOH = 95.8;
    }

    const kpiCount = document.getElementById('kpiTotalCount');
    const kpiEnergy = document.getElementById('kpiTotalEnergy');
    const kpiCost = document.getElementById('kpiTotalCost');
    const kpiSOH = document.getElementById('kpiAvgSOH');

    if (kpiCount) animateValue('kpiTotalCount', baseCount);
    if (kpiEnergy) kpiEnergy.innerText = `${baseEnergy} MWh`;
    if (kpiCost) kpiCost.innerText = `₹${baseCost.toLocaleString()}`;
    if (kpiSOH) kpiSOH.innerText = `${baseSOH}%`;
}

// Number Count-Up Animation Helper
function animateValue(id, end, duration = 800) {
    const obj = document.getElementById(id);
    if (!obj) return;
    const start = parseInt(obj.innerText.replace(/,/g, '')) || 0;
    if (start === end) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        obj.innerText = current.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// 5. Table Search, Multi-Column Sorting & Export to CSV
function initTableSearch() {
    const searchInput = document.getElementById('tableSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('keyup', () => {
        const query = searchInput.value.toLowerCase();
        const rows = document.querySelectorAll('#fleetDataTable tbody tr');

        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

function initTableSortingAndExport() {
    const table = document.getElementById('fleetDataTable');
    const exportBtn = document.getElementById('exportCsvBtn');

    if (table) {
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.title = 'Click to sort column';
            header.addEventListener('click', () => {
                sortTableByColumn(table, index);
            });
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportTableToCSV('EV_Fleet_Operations_Report.csv');
        });
    }
}

function sortTableByColumn(table, columnIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const isAscending = table.getAttribute('data-sort-col') === String(columnIndex) && table.getAttribute('data-sort-order') === 'asc';

    rows.sort((a, b) => {
        const cellA = a.children[columnIndex].innerText.trim();
        const cellB = b.children[columnIndex].innerText.trim();

        const numA = parseFloat(cellA.replace(/[^0-9.-]+/g, ""));
        const numB = parseFloat(cellB.replace(/[^0-9.-]+/g, ""));

        if (!isNaN(numA) && !isNaN(numB)) {
            return isAscending ? numB - numA : numA - numB;
        }
        return isAscending ? cellB.localeCompare(cellA) : cellA.localeCompare(cellB);
    });

    rows.forEach(row => tbody.appendChild(row));
    table.setAttribute('data-sort-col', columnIndex);
    table.setAttribute('data-sort-order', isAscending ? 'desc' : 'asc');
}

function exportTableToCSV(filename) {
    const table = document.getElementById('fleetDataTable');
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        if (row.style.display !== 'none') {
            const cols = row.querySelectorAll('th, td');
            let rowData = [];
            cols.forEach(col => {
                rowData.push('"' + col.innerText.replace(/"/g, '""').trim() + '"');
            });
            csv.push(rowData.join(','));
        }
    });

    const csvFile = new Blob([csv.join('\n')], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// 6. Live Telemetry Stream Ticker
function startLiveTelemetryStream() {
    let tick = 5000;
    const telemetryBadge = document.getElementById('liveStreamBadge');
    setInterval(() => {
        tick += Math.floor(Math.random() * 3) + 1;
        if (telemetryBadge) {
            telemetryBadge.innerHTML = `<span class="pulse-dot"></span> Live Telemetry Active (${tick.toLocaleString()} Real-Time Ticks)`;
        }
    }, 2500);
}

// 7. Render Chart.js Visuals
function renderCharts() {
    if (typeof Chart === 'undefined') return;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    Chart.defaults.color = isLight ? '#475569' : '#94A3B8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // 1. Daily Energy & Cost Trend Line Chart
    const ctxDaily = document.getElementById('chartDailyTrend')?.getContext('2d');
    if (ctxDaily) {
        chartInstances.daily = new Chart(ctxDaily, {
            type: 'line',
            data: {
                labels: ['Jan 01', 'Jan 05', 'Jan 10', 'Jan 15', 'Jan 20', 'Jan 25', 'Jan 30', 'Feb 04', 'Feb 08', 'Feb 12'],
                datasets: [
                    {
                        label: 'Energy Consumed (MWh)',
                        data: [142.8, 168.4, 155.2, 189.5, 210.2, 178.9, 195.1, 224.4, 240.0, 218.8],
                        borderColor: '#00F0FF',
                        backgroundColor: 'rgba(0, 240, 255, 0.12)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Charging Cost (₹K)',
                        data: [28.5, 33.6, 31.0, 37.9, 42.0, 35.7, 39.0, 44.8, 48.0, 43.7],
                        borderColor: '#6366F1',
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0.4
                    }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // 2. Battery SOH Distribution Donut Chart
    const ctxSOH = document.getElementById('chartSOHDist')?.getContext('2d');
    if (ctxSOH) {
        chartInstances.soh = new Chart(ctxSOH, {
            type: 'doughnut',
            data: {
                labels: ['Healthy (SOH >= 90%)', 'Moderate (80-89%)', 'Critical (< 80%)'],
                datasets: [{
                    data: [4120, 715, 165],
                    backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    }

    // 3. Charging Type Breakdown Pie Chart
    const ctxType = document.getElementById('chartChargingType')?.getContext('2d');
    if (ctxType) {
        chartInstances.type = new Chart(ctxType, {
            type: 'pie',
            data: {
                labels: ['Fast Charge', 'Normal Charge', 'Ultra Fast DC'],
                datasets: [{
                    data: [2650, 1850, 500],
                    backgroundColor: ['#00F0FF', '#14B8A6', '#6366F1'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    }

    // 4. Peak Charging Hours Bar Chart
    const ctxHours = document.getElementById('chartPeakHours')?.getContext('2d');
    if (ctxHours) {
        chartInstances.hours = new Chart(ctxHours, {
            type: 'bar',
            data: {
                labels: ['00-04h', '04-08h', '08-12h', '12-16h', '16-20h', '20-24h'],
                datasets: [{
                    label: 'Charging Sessions Count',
                    data: [320, 850, 1240, 1410, 880, 300],
                    backgroundColor: '#00F0FF',
                    borderRadius: 6
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // 5. Vehicle Model Comparison Bar Chart
    const ctxMfr = document.getElementById('chartMfrComparison')?.getContext('2d');
    if (ctxMfr) {
        chartInstances.mfr = new Chart(ctxMfr, {
            type: 'bar',
            data: {
                labels: ['Tata Nexon EV', 'Kia EV6', 'Mahindra XUV400', 'MG ZS EV', 'Hyundai Ioniq 5', 'BYD Atto 3'],
                datasets: [
                    {
                        label: 'Average SOH %',
                        data: [94.5, 95.8, 93.2, 92.8, 96.1, 95.0],
                        backgroundColor: '#10B981',
                        borderRadius: 4
                    },
                    {
                        label: 'Avg Efficiency (kWh/100km)',
                        data: [18.2, 21.4, 19.5, 20.1, 17.8, 18.9],
                        backgroundColor: '#F59E0B',
                        borderRadius: 4
                    }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

// 8. AI Assistant Natural Language Console Logic
function initAIAssistant() {
    const aiBtn = document.getElementById('aiSubmitBtn');
    const aiInput = document.getElementById('aiInput');
    const aiResponse = document.getElementById('aiResponse');

    if (!aiBtn || !aiInput || !aiResponse) return;

    aiBtn.addEventListener('click', () => {
        const query = aiInput.value.trim().toLowerCase();
        if (!query) return;

        aiResponse.style.display = 'block';
        aiResponse.innerHTML = '⚡ <em>AI Engine scanning 5,000 telemetry logs & running predictive degradation model...</em>';

        setTimeout(() => {
            let responseText = '';

            if (query.includes('critical') || query.includes('replacement') || query.includes('soh')) {
                responseText = `<strong>[AI Health Diagnosis]</strong> Analyzed 5,000 EV sessions. Identified <strong>165 critical vehicles</strong> with Battery SOH < 80%. 
                <br>• <strong>Highest Risk Target:</strong> EV0009 (Tata Nexon EV) at <strong>Belagavi Hub</strong> (SOH: 72.1%, Odometer: 59,266 km).
                <br>• <strong>Remaining Useful Life (RUL):</strong> 4.2 months. 
                <br>• <strong>Recommendation:</strong> Schedule cell balancing & liquid cooling inspection within 7 days.`;
            } else if (query.includes('peak') || query.includes('hour') || query.includes('schedule') || query.includes('cost')) {
                responseText = `<strong>[AI Peak Tariff Optimizer]</strong> Peak charging demand across <strong>Bengaluru, Mangalore, Belagavi, Mysuru, Hubballi</strong> occurs between <strong>12:00 - 16:00</strong> (1,410 sessions). 
                <br>• <strong>Optimization Strategy:</strong> Shift 30% of fast charging to off-peak night slots (23:00 - 05:00). 
                <br>• <strong>Estimated Financial Savings:</strong> <strong>₹170,000 ($2,050) / month</strong> across all 4 fleets.`;
            } else if (query.includes('fleet') || query.includes('model') || query.includes('city') || query.includes('efficiency')) {
                responseText = `<strong>[AI Fleet Diagnostic Summary]</strong> Operating 5,000 sessions across 4 major fleets: <strong>Premium Fleet, Green Mobility, Express Logistics, EcoPulse</strong>.
                <br>• <strong>Most Efficient EV Model:</strong> Hyundai Ioniq 5 (17.8 kWh/100km).
                <br>• <strong>Highest Battery Health:</strong> Kia EV6 (95.8% Avg SOH).
                <br>• <strong>City with Lowest Degradation:</strong> Mysuru Hub (Avg SOH 95.4%).`;
            } else {
                responseText = `<strong>[AI Telemetry Overview]</strong> 5,000 telemetry records verified cleanly. 
                <br>• <strong>Global Average SOH:</strong> 93.8% (Target > 90.0%)
                <br>• <strong>Total Energy Delivered:</strong> 184.2 MWh
                <br>• <strong>Overall System Health:</strong> Optimal operating status.`;
            }

            aiResponse.innerHTML = responseText;
        }, 500);
    });

    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') aiBtn.click();
    });
}

// 9. Interactive 8-Cell Battery Module Visualizer Logic
function initBatteryCellVisualizer() {
    const cellButtons = document.querySelectorAll('.cell-btn');
    if (!cellButtons.length) return;

    const cellData = {
        1: { voltage: '3.72 V', temp: '31.4 °C', res: '1.4 mΩ', status: 'Optimal', badgeClass: 'badge-good' },
        2: { voltage: '3.71 V', temp: '32.1 °C', res: '1.5 mΩ', status: 'Optimal', badgeClass: 'badge-good' },
        3: { voltage: '3.69 V', temp: '33.0 °C', res: '1.6 mΩ', status: 'Optimal', badgeClass: 'badge-good' },
        4: { voltage: '3.48 V', temp: '42.8 °C', res: '2.8 mΩ', status: 'Thermal Stress', badgeClass: 'badge-warning' },
        5: { voltage: '3.73 V', temp: '31.0 °C', res: '1.3 mΩ', status: 'Optimal', badgeClass: 'badge-good' },
        6: { voltage: '3.70 V', temp: '32.5 °C', res: '1.5 mΩ', status: 'Optimal', badgeClass: 'badge-good' },
        7: { voltage: '3.12 V', temp: '54.2 °C', res: '5.2 mΩ', status: 'Critical Cell Imbalance', badgeClass: 'badge-danger' },
        8: { voltage: '3.72 V', temp: '31.2 °C', res: '1.4 mΩ', status: 'Optimal', badgeClass: 'badge-good' }
    };

    cellButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            cellButtons.forEach(b => b.classList.remove('active-cell'));
            btn.classList.add('active-cell');

            const id = btn.getAttribute('data-cell');
            const info = cellData[id];
            if (!info) return;

            document.getElementById('cellTitle').innerText = `Cell #${id} Telemetry Details`;
            document.getElementById('cellVoltage').innerText = info.voltage;
            document.getElementById('cellTemp').innerText = info.temp;
            document.getElementById('cellRes').innerText = info.res;
            
            const statusEl = document.getElementById('cellStatus');
            statusEl.className = `status-badge ${info.badgeClass}`;
            statusEl.innerText = info.status;
        });
    });
}

// 10. Interactive Fast-Charging Physics Simulator Logic
function initChargingPhysicsSimulator() {
    const simAmps = document.getElementById('simAmps');
    const simTemp = document.getElementById('simTemp');
    const simSoc = document.getElementById('simSoc');

    if (!simAmps || !simTemp || !simSoc) return;

    const updatePhysicsSim = () => {
        const amps = parseInt(simAmps.value);
        const temp = parseInt(simTemp.value);
        const soc = parseInt(simSoc.value);

        document.getElementById('simAmpsVal').innerText = `${amps} A`;
        document.getElementById('simTempVal').innerText = `${temp} °C`;
        document.getElementById('simSocVal').innerText = `${soc}%`;

        // Physics Calculation: P (kW) = (Current * 400V) / 1000
        const power = (amps * 400) / 1000;
        document.getElementById('simPower').innerText = `${power.toFixed(1)} kW`;

        // Remaining energy needed to reach 80% (assuming 60 kWh battery pack)
        const remainingPercentage = Math.max(0, 80 - soc);
        const energyNeededKwh = (remainingPercentage / 100) * 60;
        const timeHours = energyNeededKwh / (power || 1);
        const timeMins = Math.round(timeHours * 60);
        document.getElementById('simTimeTo80').innerText = `${timeMins} mins`;

        // Thermal Risk Index
        const thermalRiskEl = document.getElementById('simThermalRisk');
        if (temp > 44 || (amps > 220 && temp > 38)) {
            thermalRiskEl.innerText = 'HIGH (Overheat Warning!)';
            thermalRiskEl.style.color = '#EF4444';
        } else if (temp > 35 || amps > 180) {
            thermalRiskEl.innerText = 'MODERATE (Cooling Active)';
            thermalRiskEl.style.color = '#F59E0B';
        } else {
            thermalRiskEl.innerText = 'LOW (Normal)';
            thermalRiskEl.style.color = '#10B981';
        }
    };

    simAmps.addEventListener('input', updatePhysicsSim);
    simTemp.addEventListener('input', updatePhysicsSim);
    simSoc.addEventListener('input', updatePhysicsSim);
}

// 11. Interactive Karnataka Route Energy & Charging Cost Estimator
function initRouteEstimator() {
    const calcBtn = document.getElementById('calcRouteBtn');
    if (!calcBtn) return;

    const distances = {
        "Bengaluru-Mangalore": 350,
        "Bengaluru-Mysuru": 145,
        "Bengaluru-Belagavi": 505,
        "Bengaluru-Hubballi": 410,
        "Mangalore-Belagavi": 380,
        "Mangalore-Mysuru": 255,
        "Belagavi-Hubballi": 95
    };

    const efficiencies = {
        "Tata Nexon EV": 18.2,
        "Kia EV6": 21.4,
        "Mahindra XUV400": 19.5,
        "Hyundai Ioniq 5": 17.8
    };

    calcBtn.addEventListener('click', () => {
        const origin = document.getElementById('routeOrigin').value;
        const dest = document.getElementById('routeDest').value;
        const model = document.getElementById('routeModel').value;

        if (origin === dest) {
            alert('Please select different Start and Destination depots.');
            return;
        }

        const routeKey1 = `${origin}-${dest}`;
        const routeKey2 = `${dest}-${origin}`;
        const dist = distances[routeKey1] || distances[routeKey2] || 280;

        const eff = efficiencies[model] || 19.0;
        const energyKwh = (dist / 100) * eff;

        // Charging stops (range ~300km)
        const stops = dist > 300 ? (dist > 450 ? 2 : 1) : 0;
        const cost = energyKwh * 10.0; // ₹10 per kWh

        document.getElementById('routeDistVal').innerText = `${dist} km`;
        document.getElementById('routeEnergyVal').innerText = `${energyKwh.toFixed(1)} kWh`;
        document.getElementById('routeStopsVal').innerText = stops > 0 ? `${stops} Stop (${stops === 1 ? 'En-route Hub' : '2 Depots'})` : 'Direct Range (0 Stops)';
        document.getElementById('routeCostVal').innerText = `₹${cost.toFixed(2)}`;
    });
}

// ============================================================================
// 12. DUAL-ROLE PERSONA SWITCHER (COMPANY FLEET MANAGER VS EV DRIVER USER)
// ============================================================================
let currentPersona = 'COMPANY';

function initDualRoleSwitcher() {
    const roleCompanyBtn = document.getElementById('roleCompanyBtn');
    const roleDriverBtn = document.getElementById('roleDriverBtn');
    const roleBannerIcon = document.getElementById('roleBannerIcon');
    const roleBannerText = document.getElementById('roleBannerText');
    const btnBookDepot = document.getElementById('btnBookDepot');
    const btnDispatchTicket = document.getElementById('btnDispatchTicket');

    if (!roleCompanyBtn || !roleDriverBtn) return;

    roleCompanyBtn.addEventListener('click', () => {
        currentPersona = 'COMPANY';
        roleCompanyBtn.classList.add('active-role');
        roleDriverBtn.classList.remove('active-role');

        if (roleBannerIcon) roleBannerIcon.innerText = '🏢';
        if (roleBannerText) roleBannerText.innerText = 'Enterprise Fleet Manager Mode: Monitoring 5,000 EV Fleet Telemetry & Battery Health Logs';
        
        if (btnDispatchTicket) btnDispatchTicket.style.display = 'inline-block';
        if (btnBookDepot) btnBookDepot.style.display = 'inline-block';
    });

    roleDriverBtn.addEventListener('click', () => {
        currentPersona = 'DRIVER';
        roleDriverBtn.classList.add('active-role');
        roleCompanyBtn.classList.remove('active-role');

        if (roleBannerIcon) roleBannerIcon.innerText = '🚗';
        if (roleBannerText) roleBannerText.innerText = 'EV Driver Cockpit Mode: Vehicle Telemetry #KA-04-EV-2024 (Tata Nexon EV Max)';
        
        if (btnDispatchTicket) btnDispatchTicket.style.display = 'none';
        if (btnBookDepot) btnBookDepot.style.display = 'inline-block';
    });

    if (btnBookDepot) {
        btnBookDepot.addEventListener('click', () => {
            const depot = prompt('🚗 EV Driver Booking: Select Depot Station (Bengaluru / Mysuru / Mangalore / Belagavi / Hubballi):', 'Bengaluru Hub');
            if (depot) {
                alert(`✅ Fast Charging Slot Successfully Reserved at ${depot}!\n\nDetails:\n• Slot ID: FAST-CHARGER-04\n• Max Speed: 150 kW DC Fast Charge\n• Tariff: ₹10.00 / kWh\n• Reservation Code: EV-RESERV-${Math.floor(1000 + Math.random() * 9000)}`);
            }
        });
    }

    if (btnDispatchTicket) {
        btnDispatchTicket.addEventListener('click', () => {
            alert(`🏢 Enterprise Maintenance Dispatch:\n\n• Automated Ticket #MNT-8842 Issued!\n• Target Vehicle: Tata Nexon EV (#KA-04-EV-2024)\n• Issue: Battery Cell #7 Voltage Anomaly (3.12V)\n• Assigned Technician: Tech Team Karnataka Hub #2\n• Status: Scheduled for Replacement at Depot.`);
        });
    }
}


// ============================================================================
// 14. REAL-TIME LIVE PERFORMANCE TELEMETRY STREAMING ENGINE
// ============================================================================
let liveStreamTimer = null;
let isStreaming = false;
let chartLiveTelemetry = null;

function initLiveTelemetryStream() {
    const ctx = document.getElementById('chartLiveTelemetry');
    const btnToggle = document.getElementById('btnToggleLiveStream');
    const btnFastCharge = document.getElementById('btnSimFastCharge');
    const btnOverheat = document.getElementById('btnSimOverheat');

    if (!ctx) return;

    // Initialize Chart.js Real-time Chart
    const timeLabels = ['10:40:01', '10:40:02', '10:40:03', '10:40:04', '10:40:05', '10:40:06', '10:40:07', '10:40:08', '10:40:09', '10:40:10'];
    const voltsData = [395, 396, 398, 397, 399, 398, 400, 399, 401, 398];
    const tempData = [27.5, 27.8, 28.0, 28.2, 28.1, 28.3, 28.5, 28.4, 28.6, 28.5];

    chartLiveTelemetry = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: 'Battery Voltage (V)',
                    data: voltsData,
                    borderColor: '#00F0FF',
                    backgroundColor: 'rgba(0, 240, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.35,
                    yAxisID: 'y'
                },
                {
                    label: 'Battery Temp (°C)',
                    data: tempData,
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.35,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            scales: {
                x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { type: 'linear', position: 'left', min: 380, max: 420, ticks: { color: '#00F0FF' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y1: { type: 'linear', position: 'right', min: 20, max: 60, ticks: { color: '#F59E0B' }, grid: { display: false } }
            },
            plugins: {
                legend: { labels: { color: '#F8FAFC' } }
            }
        }
    });

    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            isStreaming = !isStreaming;
            if (isStreaming) {
                btnToggle.innerText = '⏸ PAUSE TELEMETRY STREAM';
                btnToggle.style.background = 'var(--status-warning)';

                liveStreamTimer = setInterval(() => {
                    const now = new Date();
                    const timeStr = now.toTimeString().split(' ')[0];

                    const newVolt = (396 + Math.random() * 8).toFixed(1);
                    const newTemp = (28 + Math.random() * 1.5).toFixed(1);
                    const newAmps = Math.round(115 + Math.random() * 20);

                    document.getElementById('liveVoltsVal').innerText = `${newVolt} V`;
                    document.getElementById('liveAmpsVal').innerText = `${newAmps} A`;

                    chartLiveTelemetry.data.labels.shift();
                    chartLiveTelemetry.data.labels.push(timeStr);

                    chartLiveTelemetry.data.datasets[0].data.shift();
                    chartLiveTelemetry.data.datasets[0].data.push(parseFloat(newVolt));

                    chartLiveTelemetry.data.datasets[1].data.shift();
                    chartLiveTelemetry.data.datasets[1].data.push(parseFloat(newTemp));

                    chartLiveTelemetry.update('quiet');
                }, 1000);
            } else {
                btnToggle.innerText = '▶ START REAL-TIME TELEMETRY STREAM';
                btnToggle.style.background = 'var(--status-healthy)';
                clearInterval(liveStreamTimer);
            }
        });
    }

    if (btnFastCharge) {
        btnFastCharge.addEventListener('click', () => {
            cockpitChargeCycles += 1;
            setCockpitPercentage(Math.min(100, currentCockpitSOH + 2));
            alert('⚡ 150 kW DC Fast Charge Pulse Triggered!\n\n• Voltage spiked to 415.2 V\n• Current output: 280 A\n• Charge Cycles Incremented: ' + cockpitChargeCycles);
        });
    }

    if (btnOverheat) {
        btnOverheat.addEventListener('click', () => {
            triggerCarAlert('OVERHEAT');
        });
    }
}

// ============================================================================
// 15. CAR DRIVER AUDIO & VISUAL ALERTING HUD CONTROLLER
// ============================================================================
function playCarAudioChime(freq = 880, type = 'sine') {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
        console.log('Audio chime unavailable:', e);
    }
}

window.triggerCarAlert = function(type) {
    const banner = document.getElementById('carAlertBanner');
    const icon = document.getElementById('carAlertIcon');
    const msg = document.getElementById('carAlertMsg');
    const ambientStrip = document.getElementById('ambientLightStrip');
    const bezelFrame = document.getElementById('carBezelFrame');

    if (!banner || !icon || !msg) return;

    if (type === 'LOW_BATTERY') {
        playCarAudioChime(660, 'sawtooth');
        setTimeout(() => playCarAudioChime(880, 'sawtooth'), 150);

        setCockpitPercentage(38);
        banner.className = 'car-alert-banner alert-warning';
        icon.innerText = '🚨';
        msg.innerHTML = '<strong>LOW BATTERY RESERVE WARNING:</strong> 138 km Remaining Range. Auto-routing engaged to nearest Fast Charging Depot (Bengaluru Hub - 4.2 km).';
        
        if (ambientStrip) {
            ambientStrip.style.background = 'linear-gradient(90deg, transparent 0%, #F59E0B 50%, transparent 100%)';
            ambientStrip.style.boxShadow = '0 0 25px #F59E0B';
        }
        if (bezelFrame) bezelFrame.style.borderColor = '#F59E0B';

    } else if (type === 'OVERHEAT') {
        playCarAudioChime(1046, 'square');
        setTimeout(() => playCarAudioChime(1244, 'square'), 180);

        setCockpitPercentage(45);
        document.getElementById('cockpitTempVal').innerText = '52 °C DANGER';
        document.getElementById('cockpitTempVal').style.color = '#EF4444';

        banner.className = 'car-alert-banner alert-danger';
        icon.innerText = '⚠️';
        msg.innerHTML = '<strong>CRITICAL THERMAL STRESS DETECTED:</strong> Battery Cell Temperature 52°C! Automated Thermal Throttling Engaged. Reduce vehicle speed.';
        
        if (ambientStrip) {
            ambientStrip.style.background = 'linear-gradient(90deg, transparent 0%, #EF4444 50%, transparent 100%)';
            ambientStrip.style.boxShadow = '0 0 35px #EF4444';
        }
        if (bezelFrame) bezelFrame.style.borderColor = '#EF4444';

    } else if (type === 'SERVICE') {
        playCarAudioChime(587, 'sine');

        banner.className = 'car-alert-banner alert-warning';
        icon.innerText = '🛠️';
        msg.innerHTML = '<strong>CELL DEGRADATION ALERT:</strong> Battery Cell #7 Voltage Anomaly (3.12V). Repair Ticket #MNT-8842 dispatched to Service Hub.';

        if (ambientStrip) {
            ambientStrip.style.background = 'linear-gradient(90deg, transparent 0%, #6366F1 50%, transparent 100%)';
            ambientStrip.style.boxShadow = '0 0 25px #6366F1';
        }

    } else if (type === 'RESET') {
        playCarAudioChime(880, 'sine');

        setCockpitPercentage(55);
        banner.className = 'car-alert-banner';
        icon.innerText = '🟢';
        msg.innerHTML = '<strong>VEHICLE STATUS NOMINAL:</strong> 200 km Range Available. Battery State of Health at 55% (Good).';

        if (ambientStrip) {
            ambientStrip.style.background = 'linear-gradient(90deg, transparent 0%, var(--accent-cyan) 30%, var(--accent-blue) 70%, transparent 100%)';
            ambientStrip.style.boxShadow = '0 0 20px var(--accent-cyan)';
        }
        if (bezelFrame) bezelFrame.style.borderColor = '#151C2C';
    }
};

// ============================================================================
// COCKPIT VIEW MODE SWITCHER & BOTTOM DOCK TABS
// ============================================================================
window.switchCockpitView = function(mode) {
    const viewBar = document.getElementById('cockpitViewBar');
    const viewRadial = document.getElementById('cockpitViewRadial');
    const btnBar = document.getElementById('viewModeBarBtn');
    const btnRadial = document.getElementById('viewModeRadialBtn');

    if (!viewBar || !viewRadial) return;

    if (mode === 'BAR') {
        viewBar.style.display = 'block';
        viewRadial.style.display = 'none';
        if (btnBar) btnBar.classList.add('active-mode');
        if (btnRadial) btnRadial.classList.remove('active-mode');
    } else {
        viewBar.style.display = 'none';
        viewRadial.style.display = 'block';
        if (btnRadial) btnRadial.classList.add('active-mode');
        if (btnBar) btnBar.classList.remove('active-mode');
        initSparklineCharts();
    }
};

window.selectDockTab = function(el, name) {
    const dockItems = document.querySelectorAll('.nav-dock-item');
    dockItems.forEach(item => item.classList.remove('active-dock'));
    if (el) el.classList.add('active-dock');

    const bannerMsg = document.getElementById('carAlertMsg');
    if (bannerMsg) {
        bannerMsg.innerHTML = `<strong>${name} MODE ACTIVE:</strong> Viewing real-time EV Cockpit system diagnostic metrics.`;
    }
};

// ============================================================================
// DYNAMIC BATTERY COCKPIT GAUGE & SLIDER CONTROLLER
// ============================================================================
let currentCockpitSOH = 55;
let cockpitChargeCycles = 412;

function initBatteryCockpitGauge() {
    const slider = document.getElementById('cockpitPercentSlider');
    if (slider) {
        slider.addEventListener('input', (e) => {
            setCockpitPercentage(parseInt(e.target.value, 10));
        });
    }
    // Initialize default percentage at 55% as per user_battery_reference.jpg
    setCockpitPercentage(55);
}

window.setCockpitPercentage = function(pct) {
    currentCockpitSOH = pct;

    const pinBadge = document.getElementById('gaugePinBadge');
    const pinLine = document.getElementById('gaugePinLine');
    const sliderVal = document.getElementById('sliderPercentVal');
    const sliderInput = document.getElementById('cockpitPercentSlider');

    if (sliderInput) sliderInput.value = pct;

    if (pinBadge) {
        pinBadge.style.left = `${pct}%`;
        pinBadge.innerText = `${pct}%`;
    }
    if (pinLine) {
        pinLine.style.left = `${pct}%`;
    }

    let statusText = 'Good';
    let statusColor = '#10B981';
    if (pct < 40) {
        statusText = 'Low Reserve';
        statusColor = '#EF4444';
        if (pinBadge) {
            pinBadge.style.borderColor = '#EF4444';
            pinBadge.style.color = '#EF4444';
            pinBadge.style.boxShadow = '0 0 18px rgba(239, 68, 68, 0.6)';
        }
        if (pinLine) pinLine.style.backgroundColor = '#EF4444';
    } else if (pct > 85) {
        statusText = 'High Charge';
        statusColor = '#F59E0B';
        if (pinBadge) {
            pinBadge.style.borderColor = '#F59E0B';
            pinBadge.style.color = '#F59E0B';
            pinBadge.style.boxShadow = '0 0 18px rgba(245, 158, 11, 0.6)';
        }
        if (pinLine) pinLine.style.backgroundColor = '#F59E0B';
    } else {
        statusText = 'Optimal';
        statusColor = '#10B981';
        if (pinBadge) {
            pinBadge.style.borderColor = '#10B981';
            pinBadge.style.color = '#10B981';
            pinBadge.style.boxShadow = '0 0 18px rgba(16, 185, 129, 0.6)';
        }
        if (pinLine) pinLine.style.backgroundColor = '#10B981';
    }

    if (sliderVal) {
        sliderVal.innerText = `${pct}% ${statusText} Status`;
        sliderVal.style.color = statusColor;
    }

    const statusValEl = document.getElementById('cockpitStatusVal');
    const rangeValEl = document.getElementById('cockpitRangeVal');
    const cyclesValEl = document.getElementById('cockpitCyclesVal');
    const tempValEl = document.getElementById('cockpitTempVal');

    const estRange = Math.round(pct * 3.637);
    const estTemp = Math.round(20 + (100 - pct) * 0.15);

    if (statusValEl) {
        statusValEl.innerText = statusText;
        statusValEl.style.color = statusColor;
    }
    if (rangeValEl) rangeValEl.innerText = `${estRange} km`;
    if (cyclesValEl) cyclesValEl.innerText = `${cockpitChargeCycles}`;
    if (tempValEl) {
        tempValEl.innerText = `${estTemp} °C`;
        tempValEl.style.color = estTemp > 40 ? '#EF4444' : '#F59E0B';
    }

    const radialPctEl = document.getElementById('radialPercentVal');
    const radialStatusEl = document.getElementById('radialStatusVal');
    const radialEstRangeEl = document.getElementById('radialEstRangeVal');
    const radialSubChargeEl = document.getElementById('radialSubCharge');
    const radialTempEl = document.getElementById('radialTempVal');

    if (radialPctEl) {
        radialPctEl.innerText = `${pct}%`;
        radialPctEl.style.color = statusColor;
    }
    if (radialStatusEl) {
        radialStatusEl.innerText = `STATUS: ${statusText.toUpperCase()}`;
        radialStatusEl.style.color = statusColor;
    }
    if (radialEstRangeEl) radialEstRangeEl.innerText = `${estRange} km`;
    if (radialSubChargeEl) radialSubChargeEl.innerText = `${pct}% CHARGE`;
    if (radialTempEl) radialTempEl.innerText = `${estTemp}°C`;

    const lowBlocks = document.querySelectorAll('.gauge-section.low .gauge-block');
    const optBlocks = document.querySelectorAll('.gauge-section.optimal .gauge-block');
    const highBlocks = document.querySelectorAll('.gauge-section.high .gauge-block');

    const totalBlocks = 20;
    const activeBlockCount = Math.round((pct / 100) * totalBlocks);

    let idx = 0;
    lowBlocks.forEach(block => {
        idx++;
        if (idx <= activeBlockCount) block.classList.add('active');
        else block.classList.remove('active');
    });
    optBlocks.forEach(block => {
        idx++;
        if (idx <= activeBlockCount) block.classList.add('active');
        else block.classList.remove('active');
    });
    highBlocks.forEach(block => {
        idx++;
        if (idx <= activeBlockCount) block.classList.add('active');
        else block.classList.remove('active');
    });
};

let sparklinePowerChart = null;
let sparklineTempChart = null;

function initSparklineCharts() {
    if (typeof Chart === 'undefined') return;

    const powerCtx = document.getElementById('chartPowerFlow');
    if (powerCtx && !sparklinePowerChart) {
        sparklinePowerChart = new Chart(powerCtx, {
            type: 'line',
            data: {
                labels: ['AM', '60M', '90M', '120M', 'NOW'],
                datasets: [{
                    label: 'Power Flow (kW)',
                    data: [15, -10, 25, 48, 18],
                    borderColor: '#10B981',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    }

    const tempCtx = document.getElementById('chartTempTrend');
    if (tempCtx && !sparklineTempChart) {
        sparklineTempChart = new Chart(tempCtx, {
            type: 'line',
            data: {
                labels: ['AM', '60M', '90M', '120M', 'NOW'],
                datasets: [{
                    label: 'Temp Trend (°C)',
                    data: [22, 24, 26, 27, 28],
                    borderColor: '#00F0FF',
                    backgroundColor: 'rgba(0, 240, 255, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    }
}

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
    initDualRoleSwitcher();
    initBatteryCockpitGauge();
    initLiveTelemetryStream();
});






