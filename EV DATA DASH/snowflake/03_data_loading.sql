-- ============================================================================
-- SNOWFLAKE STEP 3: FILE FORMAT, INTERNAL STAGE & COPY INTO INGESTION
-- ============================================================================

USE DATABASE EV_FLEET_DB;
USE SCHEMA RAW;

-- 1. Create File Format for CSV
CREATE OR REPLACE FILE FORMAT RAW.EV_CSV_FORMAT
    TYPE = 'CSV'
    FIELD_DELIMITER = ','
    SKIP_HEADER = 1
    NULL_IF = ('', 'NULL', 'null', 'NaN')
    FIELD_OPTIONALLY_ENCLOSED_BY = '"'
    EMPTY_FIELD_AS_NULL = TRUE
    ERROR_ON_COLUMN_COUNT_MISMATCH = FALSE;

-- 2. Create Internal Snowflake Stage
CREATE OR REPLACE STAGE RAW.EV_LANDING_STAGE
    FILE_FORMAT = RAW.EV_CSV_FORMAT;

-- 3. Copy Ingest Script (Executed by UiPath or Automated Tasks)
COPY INTO RAW.RAW_EV_CHARGING_SESSIONS (
    Vehicle_ID, Vehicle_Model, Manufacturer, Manufacturing_Year,
    Battery_Capacity, Battery_State_of_Health, Charging_Start_Time,
    Charging_End_Time, Charging_Duration, Charging_Station,
    Charging_Type, Temperature, Energy_Consumed, Distance_Travelled,
    Charging_Cost, Fleet_ID, Location, Charging_Status, Maintenance_Status
)
FROM @RAW.EV_LANDING_STAGE/ev_fleet_charging_data.csv
FILE_FORMAT = (FORMAT_NAME = RAW.EV_CSV_FORMAT)
ON_ERROR = 'CONTINUE';

SELECT COUNT(*) AS INGESTED_ROW_COUNT FROM RAW.RAW_EV_CHARGING_SESSIONS;
