# Enterprise System Architecture & UML Diagrams

This document contains full visual diagrams representing the architecture, data flow, entity relationships, sequence execution, use cases, classes, and deployment topology of the **EV Fleet Charging & Battery Health Analytics Platform**.

---

## 1. Solution Architecture Diagram

```mermaid
graph TD
    subgraph Data Sources
        DS[Kaggle EV Fleet Dataset CSV]
    end

    subgraph Data Processing & ETL
        ALT[Alteryx Designer Workflow<br/>Clean, Dedupe, Impute & Formula]
    end

    subgraph Cloud Data Warehouse
        subgraph Snowflake
            RAW[RAW Schema<br/>Landing Table]
            CORE[CORE Schema<br/>Star Schema DIM/FACT]
            MART[MART Schema<br/>Business Views]
            SP[Stored Procedures<br/>SP_POPULATE_STAR_SCHEMA]
            TASKS[Streams & Scheduled Tasks]
        end
    end

    subgraph Process Automation
        UI[UiPath RPA Orchestrator<br/>Ingest, Trigger, Export, Mail]
    end

    subgraph Analytics & Business Intelligence
        FAB[Microsoft Fabric Lakehouse & OneLake]
        PBI[Power BI Enterprise Dashboards<br/>Dark Blue Fabric Theme]
    end

    subgraph Intelligence & Security
        AI[AI Insights & NLP Assistant]
        GOV[Data Governance & Security<br/>RBAC, Quality, Audit Logs]
    end

    DS --> ALT
    ALT --> RAW
    RAW --> TASKS
    TASKS --> SP
    SP --> CORE
    CORE --> MART
    MART --> FAB
    FAB --> PBI
    UI -->|Trigger Pipeline & Refresh| PBI
    PBI --> AI
    GOV -.->|Enforce Security & Quality| Snowflake
    GOV -.->|Audit Logs| PBI
```

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    DIM_VEHICLE ||--o{ FACT_CHARGING_SESSIONS : "undergoes session"
    DIM_CHARGING_STATION ||--o{ FACT_CHARGING_SESSIONS : "hosts session"

    DIM_VEHICLE {
        int Vehicle_SK PK
        string Vehicle_ID UK
        string Vehicle_Model
        string Manufacturer
        int Manufacturing_Year
        float Battery_Capacity_kWh
        string Fleet_ID
        string Home_Location
    }

    DIM_CHARGING_STATION {
        int Station_SK PK
        string Station_ID UK
        string Location
        string Supported_Types
        float Max_Power_kW
    }

    FACT_CHARGING_SESSIONS {
        int Session_SK PK
        int Vehicle_SK FK
        int Station_SK FK
        datetime Charging_Start_Time
        datetime Charging_End_Time
        float Charging_Duration_Hours
        string Charging_Type
        float Battery_SOH
        float Temperature_C
        float Energy_Consumed_kWh
        float Distance_Travelled_km
        float Charging_Cost_USD
        float Efficiency_kWh_100km
        string Charging_Status
        string Maintenance_Status
    }
```

---

## 3. Data Flow Diagram (DFD - Level 1)

```mermaid
flowchart LR
    ExternalData((Kaggle EV Dataset)) -->|Raw Data| P1[1. Alteryx ETL Pipeline]
    P1 -->|Cleaned CSV| P2[2. Snowflake Stage Ingestion]
    P2 -->|Copy Command| DB_RAW[(RAW Database)]
    DB_RAW -->|Stream CDC| P3[3. Stored Procedure Transformation]
    P3 --> DB_CORE[(CORE Star Schema)]
    DB_CORE --> P4[4. Data Mart Aggregation]
    P4 --> DB_MART[(MART Business Views)]
    DB_MART -->|DirectLake| P5[5. Power BI & Fabric Dashboards]
    P5 --> P6[6. AI Insights Engine & NLP]
    P6 --> Users((Fleet Managers & Executives))
```

---

## 4. Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    participant Kaggle as Kaggle / Raw CSV
    participant Alteryx as Alteryx ETL Workflow
    participant UiPath as UiPath RPA Robot
    participant Snowflake as Snowflake Cloud DW
    participant PowerBI as Power BI / Fabric
    participant FleetManager as Fleet Manager

    Kaggle->>Alteryx: Ingest raw EV charging sessions
    Alteryx->>Alteryx: Clean, impute nulls, compute metrics
    Alteryx->>UiPath: Save cleaned_ev_fleet_data.csv
    UiPath->>Snowflake: Trigger COPY INTO & SP_POPULATE_STAR_SCHEMA()
    Snowflake->>Snowflake: Refresh CORE Facts & MART Views
    UiPath->>PowerBI: Call REST API /datasets/refresh
    PowerBI->>PowerBI: Update 6-Page Dark Blue Dashboard
    UiPath->>FleetManager: Dispatch Executive Email with Excel Attachment
    FleetManager->>PowerBI: View Dashboard & Ask AI Assistant Questions
```

---

## 5. Use Case Diagram

```mermaid
graph TD
    FleetMgr((Fleet Manager))
    MaintEng((Maintenance Engineer))
    Analyst((Data Analyst))
    DataEng((Data Engineer))

    subgraph EV Fleet Analytics Platform
        UC1(Monitor Battery Health & SOH)
        UC2(Optimize Charging Schedules & Peak Costs)
        UC3(Predict Battery Replacement Dates)
        UC4(View Executive KPI Dashboards)
        UC5(Query AI Assistant with Natural Language)
        UC6(Manage ETL Pipelines & Snowflake Warehouses)
        UC7(Audit Data Quality & Security Logs)
    end

    FleetMgr --> UC1
    FleetMgr --> UC2
    FleetMgr --> UC4
    FleetMgr --> UC5
    MaintEng --> UC1
    MaintEng --> UC3
    Analyst --> UC2
    Analyst --> UC4
    DataEng --> UC6
    DataEng --> UC7
```

---

## 6. Class Diagram

```mermaid
classDiagram
    class Vehicle {
        +String vehicleId
        +String model
        +String manufacturer
        +int year
        +double batteryCapacity
        +double calculateDegradation()
    }

    class ChargingSession {
        +String sessionId
        +DateTime startTime
        +DateTime endTime
        +double energyConsumed
        +double cost
        +double calculateEfficiency()
    }

    class BatteryHealthMonitor {
        +double currentSOH
        +String healthStatus
        +boolean isCritical()
        +Date forecastReplacementDate()
    }

    class AIInsightsEngine {
        +String detectAnomalies()
        +String predictMaintenanceSchedule()
        +String answerNaturalLanguageQuery(String query)
    }

    Vehicle "1" -- "*" ChargingSession : logs
    Vehicle "1" -- "1" BatteryHealthMonitor : tracks
    BatteryHealthMonitor ..> AIInsightsEngine : analyzes
```

---

## 7. Deployment Diagram

```mermaid
graph TB
    subgraph Client Environment
        UserBrowser[Web Browser / Power BI Desktop]
    end

    subgraph Cloud Infrastructure (AWS / Azure)
        subgraph Snowflake Cloud Data Platform
            SF_ETL[EV_ETL_WH - Medium]
            SF_BI[EV_ANALYTICS_WH - Large]
            SF_STORAGE[(EV_FLEET_DB Storage)]
        end

        subgraph Microsoft Fabric Cloud
            OneLake[(OneLake Lakehouse)]
            FabricPipeline[Fabric Data Factory]
            PBIServer[Power BI Service Workspace]
        end

        subgraph Automation Cloud
            UiPathOrch[UiPath Orchestrator Server]
        end
    end

    UserBrowser -->|HTTPS / WSS| PBIServer
    PBIServer -->|DirectLake| OneLake
    OneLake <-->|Zero-Copy / Mirroring| SF_STORAGE
    UiPathOrch -->|REST API & ODBC| SF_ETL
    FabricPipeline -->|Ingest| OneLake
```
