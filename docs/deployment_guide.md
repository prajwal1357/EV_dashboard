# EV Fleet Analytics Platform - Enterprise Deployment Guide

## Prerequisites & Infrastructure Requirements
- **Cloud Warehousing**: Snowflake Account (ENTERPRISE Edition or higher)
- **ETL Software**: Alteryx Designer 2023.2+
- **RPA Platform**: UiPath Studio / Orchestrator 2023.10+
- **BI Platform**: Power BI Desktop / Microsoft Fabric Capacity (F64 SKU recommended)
- **Runtime**: Python 3.9+ / Node.js 18+ (For web application host)

---

## Deployment Steps

### Step 1: Snowflake Cloud Warehouse Provisioning
1. Log into your Snowflake Console.
2. Execute `snowflake/01_setup_database.sql` to initialize database `EV_FLEET_DB`, schemas (`RAW`, `CORE`, `MART`, `GOVERNANCE`), warehouses (`EV_ETL_WH`, `EV_ANALYTICS_WH`), and RBAC roles.
3. Execute `snowflake/02_schema_and_tables.sql` to create DDL tables.
4. Execute `snowflake/03_data_loading.sql` to create stages and file formats.
5. Execute `snowflake/04_stored_procedures.sql` to compile procedures `SP_POPULATE_STAR_SCHEMA` and `SP_CALCULATE_BATTERY_DEGRADATION`.
6. Execute `snowflake/05_tasks_and_streams.sql` to resume CDC stream and automated scheduled tasks.
7. Execute `snowflake/06_analytical_queries.sql` to create data mart views.

### Step 2: Alteryx ETL Pipeline Setup
1. Open Alteryx Designer.
2. Open `alteryx/ev_fleet_etl_workflow.yxmd`.
3. Configure the Input Data tool to reference the target Kaggle EV CSV dataset path `.\data\ev_fleet_charging_data.csv`.
4. Configure the Output Data tool with Snowflake ODBC Connection string.
5. Run the workflow and verify `cleaned_ev_fleet_charging_data.csv` is produced.

### Step 3: UiPath Process Automation Setup
1. Open UiPath Studio and import `uipath/Main.xaml`.
2. Configure credentials asset `Snowflake_EV_Credentials` in UiPath Orchestrator.
3. Configure target email address in `Send Mail` activity.
4. Publish process to Orchestrator and schedule trigger.

### Step 4: Microsoft Fabric & Power BI Deployment
1. Connect Power BI Desktop to Snowflake `MART` schema using DirectLake / Import mode.
2. Import DAX measures from `power_bi/dax_measures.dax`.
3. Build visuals following layout specifications in `power_bi/dashboard_spec.md`.
4. Publish report to Microsoft Fabric Premium Workspace.

### Step 5: Web Application & AI Assistant Deployment
1. Open terminal in project root.
2. Serve static files from `app/index.html` or run `node app/server.js`.
3. Navigate to `http://localhost:3000` to interact with the full-stack enterprise analytics application.
