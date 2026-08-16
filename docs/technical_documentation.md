# EV Fleet Analytics Platform - Technical Reference Manual

## System Architecture & Data Pipelines
The platform processes electric vehicle charging sessions, battery State of Health (SOH) telemetry, temperature logs, and operational energy costs through a multi-tier data pipeline:

1. **Ingestion & Data Cleansing (Alteryx)**: Cleans input CSV datasets, resolves missing values (temperature & distance), deduplicates records based on composite keys, and categorizes SOH degradation levels.
2. **Cloud Data Warehousing (Snowflake)**: Implements Star Schema (Dimension & Fact tables) with CDC Streams, Stored Procedures, and automated scheduled Tasks.
3. **Robotic Process Automation (UiPath)**: Orchestrates end-to-end processing, dataset refreshes via Power BI REST APIs, and automated email dispatching.
4. **Visual Intelligence (Power BI & Fabric)**: Serves 6 interactive analytics pages built using Microsoft Fabric dark blue design system and production DAX metrics.
5. **AI Assistant Module**: Offers Natural Language Query capabilities, anomaly detection, battery degradation forecasting, and charging optimization recommendations.

---

## Schema Reference

### `CORE.DIM_VEHICLE`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `Vehicle_SK` | INT | PRIMARY KEY AUTOINCREMENT | Surrogate key |
| `Vehicle_ID` | VARCHAR(50) | UNIQUE NOT NULL | Natural vehicle ID |
| `Vehicle_Model` | VARCHAR(100) | | EV model name |
| `Manufacturer` | VARCHAR(100) | | OEM vehicle manufacturer |
| `Manufacturing_Year` | INT | | Year of manufacture |
| `Battery_Capacity_kWh` | FLOAT | | Battery pack capacity |
| `Fleet_ID` | VARCHAR(50) | | Fleet association |
| `Home_Location` | VARCHAR(100) | | Depot location |

### `CORE.FACT_CHARGING_SESSIONS`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `Session_SK` | INT | PRIMARY KEY AUTOINCREMENT | Unique session identifier |
| `Vehicle_SK` | INT | FOREIGN KEY | Reference to DIM_VEHICLE |
| `Station_SK` | INT | FOREIGN KEY | Reference to DIM_CHARGING_STATION |
| `Charging_Start_Time` | TIMESTAMP | | Start timestamp |
| `Charging_End_Time` | TIMESTAMP | | End timestamp |
| `Charging_Duration_Hours` | FLOAT | | Duration in hours |
| `Battery_SOH` | FLOAT | | Battery State of Health percentage |
| `Energy_Consumed_kWh` | FLOAT | | Total energy delivered |
| `Charging_Cost_USD` | FLOAT | | Charging cost |
| `Efficiency_kWh_100km` | FLOAT | | Computed energy efficiency |
