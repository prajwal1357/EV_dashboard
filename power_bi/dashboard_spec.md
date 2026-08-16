# Power BI Dashboard Visual Design Specification

## Visual Identity & Design Tokens
- **Theme Name**: Microsoft Fabric Enterprise Dark Blue
- **Background Color**: `#0B132B` (Deep Obsidian Blue)
- **Container / Card Fill**: `#1C2541` (Navy Slate) with 1px border `#3A506B`
- **Primary Accent**: `#48CAE4` (Electric Cyan)
- **Secondary Accent**: `#5BC0BE` (Neon Teal)
- **Status Green (Healthy)**: `#06D6A0` (Emerald Green)
- **Status Yellow (Warning)**: `#FFD166` (Amber Gold)
- **Status Red (Critical)**: `#EF476F` (Vibrant Coral Red)
- **Typography**: Segoe UI / Inter (Headers: Bold 18pt, KPIs: Bold 28pt, Body: 11pt)

---

## 6-Page Layout Breakdown

### Page 1: Executive Dashboard
- **Header Header**: Enterprise Navigation Bar with Fleet Slicer, Date Range Picker, Location Selector.
- **Top Row KPI Cards**: Total Vehicles (150), Healthy Batteries (128), Critical Batteries (7), Avg SOH (91.4%), Total Energy (128.4 MWh), Total Cost ($24.8K).
- **Visual 1 (Line & Clustered Bar)**: Daily Energy Consumption (kWh) vs Charging Cost ($).
- **Visual 2 (Donut Chart)**: Fleet SOH Category Distribution (Healthy, Moderate, Critical).
- **Visual 3 (Map Visual)**: Interactive Location Map showing Active Depot Stations (Seattle, LA, SF, Chicago, Austin).
- **Visual 4 (Table Visual)**: Fleet Summary Table ranking fleets by efficiency and critical alert counts.

### Page 2: Battery Health Analytics
- **Visual 1 (Radial Gauge)**: Overall Average Battery State of Health (Target: >90%).
- **Visual 2 (Histogram / Bar)**: SOH Distribution by Vehicle Age & Manufacturing Year (2021-2025).
- **Visual 3 (Scatter Plot)**: Battery Degradation SOH % vs Total Distance Travelled (km) with Trendline.
- **Visual 4 (Data Grid)**: Critical SOH Alert Table (Vehicles with SOH < 80% flagged with red badges for immediate maintenance).

### Page 3: Charging Analytics
- **Visual 1 (Donut / Treemap)**: Energy Consumed by Charging Type (Level 2 AC vs DC Fast Charge vs Ultra Fast DC 350kW).
- **Visual 2 (Heatmap / Area Chart)**: Hourly Station Utilization Rate across 24 hours (Highlighting Peak 14:00-19:00).
- **Visual 3 (Stacked Bar)**: Charging Station Revenue & Energy Delivered per Station (Station-01 through Station-15).
- **Visual 4 (Card Cluster)**: Avg Charging Duration per Type (Ultra Fast: 0.75h, DC Fast: 1.25h, Level 2: 4.5h).

### Page 4: Fleet & Vehicle Performance
- **Visual 1 (Horizontal Bar Chart)**: Top 10 Most Efficient Vehicles (kWh/100km ranking).
- **Visual 2 (Clustered Column)**: Manufacturer Comparison (Tesla vs Rivian vs Volvo vs BYD vs Ford) by SOH & Energy Efficiency.
- **Visual 3 (Decomposition Tree)**: Drill-down from Fleet_ID ➔ Manufacturer ➔ Model ➔ Vehicle_ID ➔ Maintenance Status.
- **Visual 4 (Card Grid)**: Maintenance Status Breakdown (Good, Scheduled, Needs Immediate Inspection).

### Page 5: Cost & Energy Analysis
- **Visual 1 (Waterfall Chart)**: Energy Expense Breakdown (Base Energy Rate + Peak Demand Tariff + Station Maintenance).
- **Visual 2 (Line Chart)**: Monthly Cost Trend & MoM Cost Growth % with forecasting line.
- **Visual 3 (Matrix Grid)**: Cost per Fleet by Location & Charging Type.
- **Visual 4 (KPI Card)**: Cost Savings Opportunity through Peak Shifting ($3.4K potential savings).

### Page 6: AI Predictive Dashboard
- **Visual 1 (Key Influencers Visual)**: Top Factors Driving Accelerated Battery Degradation (Temperature > 30°C, High DC Fast Charge Frequency).
- **Visual 2 (Line Forecast Visual)**: 12-Month SOH Predictive Decay Curves by Vehicle Cohort.
- **Visual 3 (Risk Matrix Table)**: Vehicle Replacement & Preventive Maintenance Schedule with AI Risk Score (0-100).
- **Visual 4 (Smart Narrative / AI Summary Card)**: Automated NL text summary dynamically generated based on active filters.
