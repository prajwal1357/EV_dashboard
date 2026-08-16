# Step 1: Alteryx ETL Workflow Documentation

## Workflow Overview
The **Alteryx EV Fleet ETL Workflow** ingests raw Kaggle EV Fleet Charging data, cleans bad/missing records, standardizes datatypes, calculates battery health & efficiency metrics, categorizes degradation levels, pivots charging profiles, and outputs optimized enterprise datasets for Snowflake loading.

```
[Input Data] 
     │
[Select Tool] (Type Casting & Renaming)
     │
[Data Cleansing] (Trim spaces, fix casing)
     │
[Missing Value Handling] (Impute Nulls using Formula)
     │
[Duplicate Removal] (Filter out duplicate record IDs)
     │
[Formula Tool] (Efficiency_kWh_per_100km, Degradation_Category, Total_Cost_With_Tax)
     │
[Filter Tool] (Filter out invalid SOH < 50% or negative energy values)
     │
[Sort Tool] (Sort by Vehicle_ID ASC, Charging_Start_Time DESC)
     │
[Unique Tool] (Ensure unique session entries per vehicle timestamp)
     │
[Summarize Tool] (Aggregate Avg_SOH, Total_Energy, Total_Cost by Fleet_ID)
     │
[Cross Tab] (Pivot Energy_Consumed by Charging_Type per Fleet)
     │
[Join Tool] (Re-join aggregated fleet metrics with transactional records)
     │
[Browse Tool] (Data Quality Audit & Visual Verification)
     │
[Output Data] (Export clean_ev_fleet_data.csv & Snowflake DB OLEDB Connection)
```

---

## Detailed Tool Configurations

| Tool Order | Tool Name | Purpose & Configuration |
|---|---|---|
| **1** | **Input Data** | Ingests `ev_fleet_charging_data.csv` from local/cloud storage or direct Kaggle API stream. |
| **2** | **Select** | Converts `Charging_Start_Time` and `Charging_End_Time` to DateTime; `Battery_State_of_Health`, `Energy_Consumed`, `Charging_Cost` to FixedDecimal (12.2). |
| **3** | **Data Cleansing** | Removes leading/trailing whitespaces, replaces null string columns (`Location`, `Charging_Status`) with `'UNKNOWN'`. |
| **4** | **Missing Value Handling** | Uses conditional logic to impute missing `Temperature` with Fleet Location seasonal average (default 22.5°C) and missing `Distance_Travelled` with `Energy_Consumed * 3.8`. |
| **5** | **Duplicate Removal** | Evaluates composite key `[Vehicle_ID] + [Charging_Start_Time]` to drop exact session duplicates. |
| **6** | **Formula Tool** | Computes 3 enterprise fields:<br>1. `Efficiency_kWh_100km` = `([Energy_Consumed] / [Distance_Travelled]) * 100`<br>2. `Degradation_Status` = `IF [Battery_State_of_Health] >= 90 THEN 'Healthy' ELSEIF [Battery_State_of_Health] >= 80 THEN 'Moderate' ELSE 'Critical' ENDIF`<br>3. `Cost_Per_kWh` = `[Charging_Cost] / [Energy_Consumed]` |
| **7** | **Filter Tool** | Keeps valid records where `[Battery_State_of_Health] >= 50 AND [Energy_Consumed] > 0`. |
| **8** | **Sort Tool** | Orders records by `Fleet_ID` ASC, `Vehicle_ID` ASC, `Charging_Start_Time` DESC. |
| **9** | **Unique Tool** | Ensures unicity across `[Vehicle_ID]` and `[Charging_Start_Time]`. Outputs clean records to 'Unique' anchor. |
| **10** | **Summarize** | Group By `Fleet_ID`, `Manufacturer` -> Measures: `Avg(Battery_State_of_Health)`, `Sum(Energy_Consumed)`, `Sum(Charging_Cost)`, `Count(Vehicle_ID)`. |
| **11** | **Cross Tab** | Group By `Fleet_ID`, Header: `Charging_Type`, Values: `Energy_Consumed` (Sum). Pivots charging level breakdown across fleets. |
| **12** | **Join Tool** | Joins summarized fleet metrics back to session-level records using `Fleet_ID` as join key. |
| **13** | **Browse Tool** | Interactive data quality dashboard inside Alteryx for null checks, histogram distributions, and outlier detection. |
| **14** | **Output Data** | Writes clean data to `cleaned_ev_fleet_charging_data.csv` and streams directly to Snowflake `EV_FLEET_DB.RAW.RAW_EV_CHARGING_SESSIONS`. |

---

## Optimization & Execution Notes
- **Performance**: Enable Alteryx AMP Engine (Multi-threaded processing) for >1M records.
- **Error Handling**: Configure Workflow Settings to stop on 5 data errors and log errors to `alteryx_execution_log.txt`.
