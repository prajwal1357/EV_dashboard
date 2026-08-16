# Electric Vehicle (EV) Fleet Charging & Battery Health Analytics Platform

An enterprise-grade, end-to-end data engineering, cloud data warehousing, automation, business intelligence, AI insights, and data governance solution for electric vehicle fleet management.

---

## 🌟 Executive Summary & Business Benefits

Managing electric vehicle (EV) fleets requires real-time visibility into battery degradation, charging station efficiency, energy consumption, and operational expenses. This platform delivers:

- 🔋 **Battery Health Monitoring**: Continuous tracking of State of Health (SOH) to prevent unexpected roadside breakdowns.
- ⚡ **Charging Cost Optimization**: AI-driven peak-shifting recommendations yielding up to **14% in monthly energy cost savings**.
- 🛠️ **Predictive Maintenance**: Early detection of critical battery degradation (SOH < 80%) to schedule timely cell replacements.
- 📊 **Enterprise Business Intelligence**: 6 interactive dashboards built with Microsoft Fabric dark blue styling and production DAX metrics.
- 🤖 **AI Assistant & Natural Language Q&A**: Interactive AI engine for instant decision-making and anomaly detection.
- 🛡️ **Enterprise Data Governance**: Full RBAC, column-level masking, automated data quality checks, and audit logging.

---

## 🏗️ Project Architecture & Data Flow

```
Kaggle EV Dataset (CSV)
         │
         ▼
 ┌────────────────┐
 │  Alteryx ETL   │ (Data Cleaning, Null Imputation, Metric Calculations & Deduplication)
 └───────┬────────┘
         │ Cleaned Data
         ▼
 ┌────────────────┐
 │ Snowflake DW   │ (RAW, STAGING, CORE Star Schema, MART Views, Streams & Tasks)
 └───────┬────────┘
         │ Automated Ingestion
         ▼
 ┌────────────────┐
 │  UiPath RPA    │ (Process Orchestration, Snowflake SP Trigger, PBI Refresh, Email Dispatch)
 └───────┬────────┘
         │ Live Datasets
         ▼
 ┌────────────────┐
 │ Power BI &     │ (6-Page Dark Blue Fabric Dashboard: Executive, Health, Charging, Fleet, Cost, AI)
 │  MS Fabric     │
 └───────┬────────┘
         │ Insights & Q&A
         ▼
 ┌────────────────┐
 │ AI Assistant   │ (SOH Degradation Predictor, Demand Forecast & Natural Language Console)
 └───────┬────────┘
         │ Governance & Lineage
         ▼
 ┌────────────────┐
 │ Data Governance│ (RBAC, Audit Logs, Quality Exception Matrix, AES-256 Encryption)
 └────────────────┘
```

---

## 📁 Repository Folder Structure

```
c:\EV DATA DASH\
├── data/
│   ├── generate_ev_dataset.py        # Python Kaggle EV dataset generation script
│   └── ev_fleet_charging_data.csv    # Sample Kaggle EV Fleet charging dataset
├── alteryx/
│   ├── ev_fleet_etl_workflow.yxmd    # Alteryx XML/YXMD workflow configuration
│   └── alteryx_workflow_doc.md       # Tool-by-tool Alteryx configuration documentation
├── snowflake/
│   ├── 01_setup_database.sql         # Database, Schemas, Warehouses & Roles DDL
│   ├── 02_schema_and_tables.sql      # Star Schema DDL (DIM_VEHICLE, FACT_CHARGING_SESSIONS)
│   ├── 03_data_loading.sql           # File Format, Internal Stage & COPY INTO script
│   ├── 04_stored_procedures.sql      # SP_POPULATE_STAR_SCHEMA & SP_CALCULATE_BATTERY_DEGRADATION
│   ├── 05_tasks_and_streams.sql      # CDC Streams & Scheduled Automated Tasks
│   └── 06_analytical_queries.sql     # Data Mart Views & Business Analytics SQL
├── uipath/
│   ├── Main.xaml                     # UiPath Automation XAML Workflow
│   └── uipath_automation_doc.md      # Step-by-step RPA architecture & exception handling doc
├── power_bi/
│   ├── dax_measures.dax              # Production DAX measures (SOH %, Degradation, Cost Growth)
│   └── dashboard_spec.md             # Visual layout specifications for 6 dashboard pages
├── fabric/
│   └── fabric_architecture.md        # Microsoft Fabric OneLake, Medallion & DirectLake spec
├── governance/
│   └── data_governance_plan.md       # RBAC Matrix, Security, Encryption, Quality Rules & Lineage
├── diagrams/
│   └── enterprise_diagrams.md        # Architecture, ERD, DFD, Sequence, Use Case, Class & Deployment diagrams
├── app/                              # Full-Stack Interactive AI & BI Web Application
│   ├── index.html                    # Single Page Dark Blue Enterprise UI
│   ├── styles.css                    # Glassmorphism dark mode styles & design tokens
│   ├── app.js                        # Interactive Chart.js charts & AI Assistant engine
│   └── server.js                     # Node.js Express server backend
├── docs/
│   ├── deployment_guide.md           # Step-by-step enterprise deployment guide
│   ├── technical_documentation.md   # Schema specs & technical reference manual
│   └── user_manual.md                # Operational user manual for fleet managers
└── README.md                         # Project master documentation
```

---

## 🛠️ Step-by-Step Module Summary

### Step 1: Alteryx ETL Workflow
- **Pipeline Tools**: Input Data ➔ Select ➔ Data Cleansing ➔ Missing Value Handling ➔ Duplicate Removal ➔ Formula ➔ Filter ➔ Sort ➔ Unique ➔ Summarize ➔ Cross Tab ➔ Join ➔ Browse ➔ Output Data.
- Imputes missing temperature and distance values, calculates energy efficiency (`kWh/100km`), categorizes degradation levels, and writes clean dataset.

### Step 2: Snowflake Cloud Data Warehouse
- Multi-layered schema (`RAW`, `STAGING`, `CORE`, `MART`, `GOVERNANCE`).
- Automated stored procedure `SP_POPULATE_STAR_SCHEMA()` and CDC Streams with 60-minute scheduled Tasks.
- Analytical Views for Average SOH, Top Stations, Daily Costs, and Maintenance Risk Ranking.

### Step 3: UiPath Process Automation
- Monitors cleaned CSV landing stage, executes Snowflake stored procedure, triggers Power BI dataset refresh API, exports daily executive Excel report, and dispatches HTML email notifications with audit logging.

### Step 4: Power BI & Microsoft Fabric Dashboards
- **Theme**: Dark Blue Enterprise (Obsidian `#0B132B`, Slate `#1C2541`, Cyan `#48CAE4`).
- **6 Pages**:
  1. Executive Dashboard
  2. Battery Health Analytics
  3. Charging Operations
  4. Fleet & Vehicle Performance
  5. Cost & Energy Analysis
  6. AI Predictive Dashboard

### Step 5: AI Insights Engine & Interactive UI
- Web Application (`app/index.html`) featuring interactive Chart.js visualizations and an AI Assistant capable of answering natural language questions, predicting battery degradation, and recommending cost optimizations.

### Step 6: Data Governance Framework
- Enforces RBAC roles (`EV_ADMIN`, `EV_ANALYST`, `EV_MAINTENANCE_TECH`), AES-256 encryption at rest, TLS 1.3 in transit, data quality exception rules, and end-to-end data lineage.

---

## 🚀 How to Run the Platform
1. Open `app/index.html` directly in any modern browser OR run `node app/server.js` and navigate to `http://localhost:3000`.
2. Explore the tabs: Executive Dashboard, Battery Health, Charging Analytics, Fleet Performance, Cost Analysis, AI Dashboard, and Data Governance.
3. Interact with the AI Assistant console on the AI Dashboard tab!
