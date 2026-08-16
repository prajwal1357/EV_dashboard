-- ============================================================================
-- SNOWFLAKE STEP 2: TABLE DDL CREATION (STAR SCHEMA & DATA WAREHOUSE LAYERS)
-- ============================================================================

USE DATABASE EV_FLEET_DB;

-- ----------------------------------------------------------------------------
-- RAW LAYER: Direct CSV Ingestion Table
-- ----------------------------------------------------------------------------
CREATE OR REPLACE TABLE RAW.RAW_EV_CHARGING_SESSIONS (
    Vehicle_ID VARCHAR(50),
    Vehicle_Model VARCHAR(100),
    Manufacturer VARCHAR(100),
    Manufacturing_Year INT,
    Battery_Capacity FLOAT,
    Battery_State_of_Health FLOAT,
    Charging_Start_Time TIMESTAMP_NTZ,
    Charging_End_Time TIMESTAMP_NTZ,
    Charging_Duration FLOAT,
    Charging_Station VARCHAR(100),
    Charging_Type VARCHAR(50),
    Temperature FLOAT,
    Energy_Consumed FLOAT,
    Distance_Travelled FLOAT,
    Charging_Cost FLOAT,
    Fleet_ID VARCHAR(50),
    Location VARCHAR(100),
    Charging_Status VARCHAR(50),
    Maintenance_Status VARCHAR(50),
    _LOADED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- ----------------------------------------------------------------------------
-- CORE LAYER: Dimensional Models (Star Schema)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE TABLE CORE.DIM_VEHICLE (
    Vehicle_SK INT AUTOINCREMENT PRIMARY KEY,
    Vehicle_ID VARCHAR(50) UNIQUE NOT NULL,
    Vehicle_Model VARCHAR(100),
    Manufacturer VARCHAR(100),
    Manufacturing_Year INT,
    Battery_Capacity_kWh FLOAT,
    Fleet_ID VARCHAR(50),
    Home_Location VARCHAR(100),
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    UPDATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE OR REPLACE TABLE CORE.DIM_CHARGING_STATION (
    Station_SK INT AUTOINCREMENT PRIMARY KEY,
    Station_ID VARCHAR(100) UNIQUE NOT NULL,
    Location VARCHAR(100),
    Supported_Types VARCHAR(255),
    Max_Power_kW FLOAT,
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE OR REPLACE TABLE CORE.FACT_CHARGING_SESSIONS (
    Session_SK INT AUTOINCREMENT PRIMARY KEY,
    Vehicle_SK INT REFERENCES CORE.DIM_VEHICLE(Vehicle_SK),
    Station_SK INT REFERENCES CORE.DIM_CHARGING_STATION(Station_SK),
    Charging_Start_Time TIMESTAMP_NTZ,
    Charging_End_Time TIMESTAMP_NTZ,
    Charging_Duration_Hours FLOAT,
    Charging_Type VARCHAR(50),
    Battery_SOH FLOAT,
    Temperature_C FLOAT,
    Energy_Consumed_kWh FLOAT,
    Distance_Travelled_km FLOAT,
    Charging_Cost_USD FLOAT,
    Efficiency_kWh_100km FLOAT,
    Charging_Status VARCHAR(50),
    Maintenance_Status VARCHAR(50),
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- ----------------------------------------------------------------------------
-- GOVERNANCE LAYER: Audit & Data Quality Logs
-- ----------------------------------------------------------------------------
CREATE OR REPLACE TABLE GOVERNANCE.AUDIT_LOGS (
    Log_ID INT AUTOINCREMENT PRIMARY KEY,
    Process_Name VARCHAR(100),
    Execution_Status VARCHAR(50),
    Records_Processed INT,
    Error_Message VARCHAR(1000),
    Executed_By VARCHAR(100) DEFAULT CURRENT_USER(),
    Executed_At TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE OR REPLACE TABLE GOVERNANCE.DATA_QUALITY_EXCEPTIONS (
    Exception_ID INT AUTOINCREMENT PRIMARY KEY,
    Table_Name VARCHAR(100),
    Column_Name VARCHAR(100),
    Rule_Violated VARCHAR(255),
    Invalid_Value VARCHAR(255),
    Detected_At TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

SELECT 'Core Star Schema and Governance Tables Created Successfully' AS STATUS;
