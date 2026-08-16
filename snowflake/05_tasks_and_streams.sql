-- ============================================================================
-- SNOWFLAKE STEP 5: CDC STREAMS & AUTOMATED SCHEDULED TASKS
-- ============================================================================

USE DATABASE EV_FLEET_DB;

-- 1. Create Stream on RAW Charging Sessions Table for CDC
CREATE OR REPLACE STREAM RAW.EV_CHARGING_SESSION_STREAM
    ON TABLE RAW.RAW_EV_CHARGING_SESSIONS
    COMMENT = 'Captures newly inserted EV charging session records in real time';

-- 2. Master Automated Ingestion Task (Runs Every 1 Hour if Stream Has Data)
CREATE OR REPLACE TASK CORE.TSK_PROCESS_EV_STREAM
    WAREHOUSE = EV_ETL_WH
    SCHEDULE = '60 MINUTE'
    WHEN SYSTEM$STREAM_HAS_DATA('RAW.EV_CHARGING_SESSION_STREAM')
AS
    CALL CORE.SP_POPULATE_STAR_SCHEMA();

-- 3. Daily Battery Health Audit Task (Runs at 01:00 AM UTC Daily)
CREATE OR REPLACE TASK CORE.TSK_DAILY_BATTERY_HEALTH_AUDIT
    WAREHOUSE = EV_ANALYTICS_WH
    SCHEDULE = 'USING CRON 0 1 * * * UTC'
AS
    CALL CORE.SP_CALCULATE_BATTERY_DEGRADATION();

-- 4. Resume Tasks
ALTER TASK CORE.TSK_PROCESS_EV_STREAM RESUME;
ALTER TASK CORE.TSK_DAILY_BATTERY_HEALTH_AUDIT RESUME;

SHOW TASKS IN DATABASE EV_FLEET_DB;
