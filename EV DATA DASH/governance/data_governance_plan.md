# Enterprise Data Governance & Security Framework

## 1. Role-Based Access Control (RBAC) Matrix

| User Role | Target Audience | Data Access Scope | Permissions |
|---|---|---|---|
| **EV_ADMIN** | Executive Management, Enterprise Architects | All Databases, Schemas & Admin Controls | Full Control (CREATE, ALTER, DROP, SELECT, GRANT) |
| **EV_DATA_ENGINEER** | Data Engineers, ETL Developers | `RAW`, `STAGING`, `CORE`, `GOVERNANCE` Schemas | SELECT, INSERT, UPDATE, MERGE, EXECUTE PROCEDURE |
| **EV_ANALYST** | Fleet Analysts, BI Developers | `MART` Schema, Power BI DirectLake Model | SELECT only on Aggregate Views & Data Marts |
| **EV_MAINTENANCE_TECH**| Fleet Maintenance Engineers | `MART.VW_VEHICLE_BATTERY_DEGRADATION` | SELECT only on battery health & maintenance alerts |
| **EV_AUDITOR** | Compliance Officers | `GOVERNANCE.AUDIT_LOGS`, Data Lineage | SELECT only on Audit Logs & Exception Tables |

---

## 2. Data Quality Rules & Validation Framework
- **Rule 1 (SOH Bounds)**: `Battery_State_of_Health` MUST be between `50.0%` and `100.0%`. Out-of-bounds records are routed to `GOVERNANCE.DATA_QUALITY_EXCEPTIONS`.
- **Rule 2 (Energy Balance)**: `Energy_Consumed_kWh` MUST NOT exceed total `Battery_Capacity_kWh`.
- **Rule 3 (Null Checks)**: Key identifiers (`Vehicle_ID`, `Charging_Start_Time`, `Fleet_ID`) MUST NOT be NULL.
- **Rule 4 (Duplicate Check)**: Composite key `(Vehicle_ID, Charging_Start_Time)` MUST be strictly unique across all transactions.

---

## 3. Security, Encryption & Data Protection
- **Encryption in Transit**: TLS 1.3 encryption forced on all client connections (Snowflake, Fabric, Alteryx, UiPath).
- **Encryption at Rest**: AES-256 bit encryption applied across all Snowflake stages, tables, and Microsoft Fabric OneLake Delta storage.
- **Column-Level Masking**: Masking policy applied to driver/location sensitive data:
  ```sql
  CREATE OR REPLACE MASKING POLICY GOVERNANCE.MASK_LOCATION AS (val VARCHAR) RETURNS VARCHAR ->
    CASE WHEN CURRENT_ROLE() IN ('EV_ADMIN', 'EV_ANALYST') THEN val ELSE '*** REDACTED ***' END;
  ```
- **Row-Level Security (RLS)**: Power BI DAX RLS applied based on user domain (`[Fleet_ID] = USERPRINCIPALNAME()`).

---

## 4. Disaster Recovery & Backup Strategy
- **Snowflake Time Travel**: Configured to 30 days data retention across `CORE` and `MART` schemas for point-in-time recovery.
- **Failover / Disaster Recovery (DR)**: Multi-region replication between AWS US-West-2 and US-East-1.
- **Automated Snapshots**: Daily automated OneLake Delta snapshots stored with geo-redundancy.

---

## 5. End-to-End Data Lineage

```
┌─────────────────────────┐
│ Kaggle Raw EV CSV Data  │ (Source)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Alteryx ETL Workflow   │ (Data Cleaning & Imputation)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Snowflake RAW Schema    │ (RAW.RAW_EV_CHARGING_SESSIONS)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Snowflake CORE Schema   │ (Star Schema: DIM_VEHICLE, FACT_CHARGING_SESSIONS)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Snowflake MART Schema  │ (Business Views & Aggregations)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Power BI & Fabric Model │ (DirectLake / Import Dataset)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Executive Dashboards &  │ (Consumer Reporting)
│   AI Assistant Engine   │
└─────────────────────────┘
```
