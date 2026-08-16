const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../app')));

// Sample API Endpoints simulating Snowflake DW Data Mart
app.get('/api/fleet/summary', (req, res) => {
    res.json({
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        kpis: {
            total_vehicles: 150,
            healthy_batteries: 128,
            critical_batteries: 7,
            average_soh: 91.4,
            total_energy_mwh: 128.4,
            total_cost_usd: 24850.0,
            avg_charging_duration_hrs: 1.85,
            fleet_efficiency_kwh_100km: 23.4
        }
    });
});

app.get('/api/fleet/critical-vehicles', (req, res) => {
    res.json([
        { vehicle_id: 'EV-F009', model: 'FM Electric', mfr: 'Volvo', soh: 72.1, location: 'Los Angeles Port', risk: 'HIGH RISK' },
        { vehicle_id: 'EV-F004', model: 'FH Electric', mfr: 'Volvo', soh: 79.4, location: 'Los Angeles Port', risk: 'MEDIUM RISK' },
        { vehicle_id: 'EV-F027', model: 'E-Transit', mfr: 'Ford', soh: 78.2, location: 'San Francisco', risk: 'MEDIUM RISK' }
    ]);
});

// AI Query Endpoint
app.post('/api/ai/query', (req, res) => {
    const { query } = req.body;
    let answer = `AI Engine Response for query: "${query}"`;
    
    if (query.toLowerCase().includes('soh')) {
        answer = "Global Fleet SOH is currently at 91.4%. 7 vehicles require urgent battery health inspections.";
    }
    
    res.json({ query, answer, timestamp: new Date().toISOString() });
});

// Serve Main UI
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`⚡ EV Fleet Analytics Web Server running at http://localhost:${PORT}`);
});
