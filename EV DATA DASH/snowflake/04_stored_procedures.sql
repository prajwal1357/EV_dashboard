-- ============================================================================
-- SNOWFLAKE STEP 4: STORED PROCEDURES (ETL & SOH DEGRADATION ENGINE)
-- ============================================================================

USE DATABASE EV_FLEET_DB;
USE SCHEMA CORE;

-- 1. Stored Procedure: Dimension & Fact Pipeline Ingestion
CREATE OR REPLACE PROCEDURE CORE.SP_POPULATE_STAR_SCHEMA()
RETURNS VARCHAR
LANGUAGE SQL
AS
$$
DECLARE
    v_rows_processed INT DEFAULT 0;
BEGIN
    -- Upsert Vehicle Dimension
    MERGE INTO CORE.DIM_VEHICLE tgt
    USING (
        SELECT DISTINCT Vehicle_ID, Vehicle_Model, Manufacturer, Manufacturing_Year, Battery_Capacity, Fleet_ID, Location
        FROM RAW.RAW_EV_CHARGING_SESSIONS
    ) src
    ON tgt.Vehicle_ID = src.Vehicle_ID
    WHEN MATCHED THEN UPDATE SET 
        tgt.Fleet_ID = src.Fleet_ID,
        tgt.Home_Location = src.Location,
        tgt.UPDATED_AT = CURRENT_TIMESTAMP()
    WHEN NOT MATCHED THEN INSERT (Vehicle_ID, Vehicle_Model, Manufacturer, Manufacturing_Year, Battery_Capacity_kWh, Fleet_ID, Home_Location)
    VALUES (src.Vehicle_ID, src.Vehicle_Model, src.Manufacturer, src.Manufacturing_Year, src.Battery_Capacity, src.Fleet_ID, src.Location);

    -- Upsert Charging Station Dimension
    MERGE INTO CORE.DIM_CHARGING_STATION tgt
    USING (
        SELECT DISTINCT Charging_Station, Location
        FROM RAW.RAW_EV_CHARGING_SESSIONS
    ) src
    ON tgt.Station_ID = src.Charging_Station
    WHEN NOT MATCHED THEN INSERT (Station_ID, Location, Supported_Types, Max_Power_kW)
    VALUES (src.Charging_Station, src.Location, 'DC Fast / Level 2', 350.0);

    -- Load Fact Table
    INSERT INTO CORE.FACT_CHARGING_SESSIONS (
        Vehicle_SK, Station_SK, Charging_Start_Time, Charging_End_Time,
        Charging_Duration_Hours, Charging_Type, Battery_SOH, Temperature_C,
        Energy_Consumed_kWh, Distance_Travelled_km, Charging_Cost_USD, Efficiency_kWh_100km,
        Charging_Status, Maintenance_Status
    )
    SELECT 
        v.Vehicle_SK,
        s.Station_SK,
        r.Charging_Start_Time,
        r.Charging_End_Time,
        r.Charging_Duration,
        r.Charging_Type,
        r.Battery_State_of_Health,
        COALESCE(r.Temperature, 22.5),
        r.Energy_Consumed,
        COALESCE(r.Distance_Travelled, r.Energy_Consumed * 3.8),
        r.Charging_Cost,
        ROUND((r.Energy_Consumed / NULLIF(COALESCE(r.Distance_Travelled, r.Energy_Consumed * 3.8), 0)) * 100, 2),
        r.Charging_Status,
        r.Maintenance_Status
    FROM RAW.RAW_EV_CHARGING_SESSIONS r
    JOIN CORE.DIM_VEHICLE v ON r.Vehicle_ID = v.Vehicle_ID
    JOIN CORE.DIM_CHARGING_STATION s ON r.Charging_Station = s.Station_ID;

    SELECT COUNT(*) INTO :v_rows_processed FROM CORE.FACT_CHARGING_SESSIONS;

    -- Audit Log Insertion
    INSERT INTO GOVERNANCE.AUDIT_LOGS (Process_Name, Execution_Status, Records_Processed, Error_Message)
    VALUES ('SP_POPULATE_STAR_SCHEMA', 'SUCCESS', :v_rows_processed, NULL);

    RETURN 'Star Schema populated successfully with ' || :v_rows_processed || ' total records.';
END;
$$;

-- 2. Stored Procedure: Calculate Battery Degradation Rate & Alert Triggers
CREATE OR REPLACE PROCEDURE CORE.SP_CALCULATE_BATTERY_DEGRADATION()
RETURNS VARCHAR
LANGUAGE SQL
AS
$$
BEGIN
    INSERT INTO GOVERNANCE.DATA_QUALITY_EXCEPTIONS (Table_Name, Column_Name, Rule_Violated, Invalid_Value)
    SELECT 
        'DIM_VEHICLE', 
        'Battery_State_of_Health', 
        'CRITICAL SOH ALERT: SOH < 75.0%', 
        Vehicle_ID || ' SOH=' || Battery_State_of_Health
    FROM RAW.RAW_EV_CHARGING_SESSIONS
    WHERE Battery_State_of_Health < 75.0;

    RETURN 'Battery degradation audit complete.';
END;
$$;

SELECT 'Stored Procedures compiled successfully' AS STATUS;
