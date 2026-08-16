# Microsoft Fabric Solution Architecture & Data Factory Integration

## Overview
Microsoft Fabric provides an all-in-one SaaS analytical data platform for the EV Fleet Analytics Platform. It unifies compute, storage (OneLake), data engineering (Lakehouse), data warehousing, real-time analytics, and Power BI visual intelligence under a cohesive Medallion Architecture.

```
                           ┌───────────────────────────────────────┐
                           │          OneLake Delta Format         │
                           └──────────────────┬────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         │                                    │                                    │
         ▼                                    ▼                                    ▼
┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
│  Bronze (Raw)    │ ─────────────►│  Silver (Stage)  │ ─────────────►│   Gold (Mart)    │
│ Raw Ingested CSV │ Data Pipelines│  Clean Parquet   │  Spark / SQL  │  DirectLake PBI  │
└──────────────────┘               └──────────────────┘               └──────────────────┘
```

---

## 1. OneLake & Medallion Architecture Strategy

### Bronze Layer (Raw Storage)
- **Store Path**: `Tables/Bronze/raw_ev_charging_sessions`
- Ingests raw data from Kaggle/Alteryx in original CSV format without modification.
- Configured with file retention policies and raw schema preservation.

### Silver Layer (Cleaned & Curated Lakehouse)
- **Store Path**: `Tables/Silver/silver_ev_sessions`
- Processed via Fabric Data Factory Pipelines & PySpark notebooks.
- Delta Parquet format with Z-Ordering on `Vehicle_ID` and `Charging_Start_Time`.
- Applies schema enforcement, null handling, and type normalization.

### Gold Layer (Fabric Data Warehouse / Data Mart)
- **Store Path**: `Tables/Gold/fact_charging_sessions` and `dim_vehicle`
- Dimensional Star Schema aggregated for analytical querying and Power BI DirectLake mode.

---

## 2. Fabric Components Breakdown

| Component | Role in EV Analytics Solution |
|---|---|
| **Fabric Data Factory Pipeline** | Orchestrates scheduled data ingestion from external cloud buckets into OneLake Bronze layer. |
| **Fabric Lakehouse (PySpark)** | Performs high-throughput data cleaning, battery SOH degradation calculations, and Delta table optimization. |
| **Fabric Data Warehouse** | Enables cross-database T-SQL queries across fleet transactions, financial costs, and vehicle logs. |
| **DirectLake Semantic Model** | Connects Power BI directly to Delta tables in OneLake without requiring data duplication or DirectQuery lag. |
| **Real-Time Eventstream** | Ingests live telemetry (Temperature, SOH, Battery Voltage) from IoT-connected EV fleets into KQL Database. |
