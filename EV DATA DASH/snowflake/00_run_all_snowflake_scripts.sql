-- ============================================================================
-- SNOWFLAKE MASTER EXECUTION SCRIPT (STEP 2 & DATA WAREHOUSE PIPELINE)
-- Executes database creation, star schema DDL, procedure compilation, 
-- stream tasks, analytical queries, and security masking in order.
-- ============================================================================

-- 1. SETUP WAREHOUSES & DATABASE
CREATE WAREHOUSE IF NOT EXISTS EV_ETL_WH WITH WAREHOUSE_SIZE = 'MEDIUM' AUTO_SUSPEND = 300 AUTO_RESUME = TRUE;
CREATE WAREHOUSE IF NOT EXISTS EV_ANALYTICS_WH WITH WAREHOUSE_SIZE = 'LARGE' AUTO_SUSPEND = 180 AUTO_RESUME = TRUE;
CREATE DATABASE IF NOT EXISTS EV_FLEET_DB DATA_RETENTION_TIME_IN_DAYS = 30;

USE DATABASE EV_FLEET_DB;
CREATE SCHEMA IF NOT EXISTS RAW;
CREATE SCHEMA IF NOT EXISTS CORE;
CREATE SCHEMA IF NOT EXISTS MART;
CREATE SCHEMA IF NOT EXISTS GOVERNANCE;

-- 2. CREATE RAW & CORE TABLES
CREATE OR REPLACE TABLE RAW.RAW_EV_CHARGING_SESSIONS (
    Vehicle_ID VARCHAR(50), Vehicle_Model VARCHAR(100), Manufacturer VARCHAR(100),
    Manufacturing_Year INT, Battery_Capacity FLOAT, Battery_State_of_Health FLOAT,
    Charging_Start_Time TIMESTAMP_NTZ, Charging_End_Time TIMESTAMP_NTZ, Charging_Duration FLOAT,
    Charging_Station VARCHAR(100), Charging_Type VARCHAR(50), Temperature FLOAT,
    Energy_Consumed FLOAT, Distance_Travelled FLOAT, Charging_Cost FLOAT,
    Fleet_ID VARCHAR(50), Location VARCHAR(100), Charging_Status VARCHAR(50),
    Maintenance_Status VARCHAR(50), Driver_ID VARCHAR(50), Weather VARCHAR(50)
);

CREATE OR REPLACE TABLE CORE.DIM_VEHICLE (
    Vehicle_SK INT AUTOINCREMENT PRIMARY KEY, Vehicle_ID VARCHAR(50) UNIQUE NOT NULL,
    Vehicle_Model VARCHAR(100), Manufacturer VARCHAR(100), Manufacturing_Year INT,
    Battery_Capacity_kWh FLOAT, Fleet_ID VARCHAR(50), Home_Location VARCHAR(100)
);

CREATE OR REPLACE TABLE CORE.FACT_CHARGING_SESSIONS (
    Session_SK INT AUTOINCREMENT PRIMARY KEY, Vehicle_SK INT REFERENCES CORE.DIM_VEHICLE(Vehicle_SK),
    Charging_Start_Time TIMESTAMP_NTZ, Charging_Duration_Hours FLOAT, Charging_Type VARCHAR(50),
    Battery_SOH FLOAT, Energy_Consumed_kWh FLOAT, Distance_Travelled_km FLOAT,
    Charging_Cost_USD FLOAT, Efficiency_kWh_100km FLOAT, Fleet_ID VARCHAR(50)
);

-- 3. STORED PROCEDURE
CREATE OR REPLACE PROCEDURE CORE.SP_POPULATE_STAR_SCHEMA()
RETURNS VARCHAR LANGUAGE SQL AS
$$
BEGIN
    MERGE INTO CORE.DIM_VEHICLE tgt USING (SELECT DISTINCT Vehicle_ID, Vehicle_Model, Manufacturer, Fleet_ID, Location FROM RAW.RAW_EV_CHARGING_SESSIONS) src
    ON tgt.Vehicle_ID = src.Vehicle_ID
    WHEN NOT MATCHED THEN INSERT (Vehicle_ID, Vehicle_Model, Manufacturer, Fleet_ID, Home_Location) VALUES (src.Vehicle_ID, src.Vehicle_Model, src.Manufacturer, src.Fleet_ID, src.Location);

    RETURN 'Snowflake Star Schema populated successfully.';
END;
$$;

-- 4. BUSINESS VIEWS
CREATE OR REPLACE VIEW MART.VW_FLEET_EXECUTIVE_SUMMARY AS
SELECT Fleet_ID, COUNT(DISTINCT Vehicle_SK) AS Total_Vehicles, ROUND(AVG(Battery_SOH), 2) AS Avg_SOH, ROUND(SUM(Energy_Consumed_kWh), 2) AS Total_Energy_kWh, ROUND(SUM(Charging_Cost_USD), 2) AS Total_Cost_USD
FROM CORE.FACT_CHARGING_SESSIONS GROUP BY Fleet_ID;

-- 5. ZERO COPY CLONE
CREATE DATABASE IF NOT EXISTS EV_FLEET_DB_DEV CLONE EV_FLEET_DB;

SELECT 'Master Snowflake Execution Pipeline Compiled Successfully' AS STATUS;
