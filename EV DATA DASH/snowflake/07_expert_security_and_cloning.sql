-- ============================================================================
-- SNOWFLAKE EXPERT STEP 7: DYNAMIC DATA MASKING, ROW-LEVEL SECURITY (RLS),
-- ZERO-COPY CLONING & TIME TRAVEL DISASTER RECOVERY
-- ============================================================================

USE DATABASE EV_FLEET_DB;
USE SCHEMA GOVERNANCE;

-- ----------------------------------------------------------------------------
-- 1. DYNAMIC DATA MASKING POLICIES (PII & DRIVER PROTECTION)
-- ----------------------------------------------------------------------------

-- Mask Driver ID column for Non-Admin Users
CREATE OR REPLACE MASKING POLICY GOVERNANCE.MASK_DRIVER_ID AS (val VARCHAR) RETURNS VARCHAR ->
  CASE 
    WHEN CURRENT_ROLE() IN ('EV_ADMIN', 'ACCOUNTADMIN') THEN val
    ELSE '*** MASKED DRIVER PII ***'
  END;

-- Apply Masking Policy to Raw Data Table
ALTER TABLE RAW.RAW_EV_CHARGING_SESSIONS 
  MODIFY COLUMN Driver_ID SET MASKING POLICY GOVERNANCE.MASK_DRIVER_ID;

-- Mask Cost details for non-financial analysts
CREATE OR REPLACE MASKING POLICY GOVERNANCE.MASK_FINANCIAL_COST AS (val FLOAT) RETURNS FLOAT ->
  CASE 
    WHEN CURRENT_ROLE() IN ('EV_ADMIN', 'EV_ANALYST') THEN val
    ELSE 0.00
  END;

ALTER TABLE CORE.FACT_CHARGING_SESSIONS 
  MODIFY COLUMN Charging_Cost_USD SET MASKING POLICY GOVERNANCE.MASK_FINANCIAL_COST;

-- ----------------------------------------------------------------------------
-- 2. ROW-LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Create RLS Mapping Table
CREATE OR REPLACE TABLE GOVERNANCE.USER_FLEET_MAPPING (
    Username VARCHAR(100),
    Allowed_Fleet_ID VARCHAR(50)
);

-- Populate RLS Mapping
INSERT INTO GOVERNANCE.USER_FLEET_MAPPING (Username, Allowed_Fleet_ID) VALUES
('ANALYST_ALPHA', 'Premium Fleet'),
('ANALYST_BETA', 'Green Mobility'),
('ANALYST_GAMMA', 'Express Logistics'),
('ADMIN_USER', 'ALL');

-- Create Row Access Policy
CREATE OR REPLACE ROW ACCESS POLICY GOVERNANCE.RAP_FLEET_SECURITY AS (fleet_id VARCHAR) RETURNS BOOLEAN ->
  CURRENT_ROLE() IN ('EV_ADMIN', 'ACCOUNTADMIN')
  OR EXISTS (
    SELECT 1 FROM GOVERNANCE.USER_FLEET_MAPPING
    WHERE Username = CURRENT_USER() AND (Allowed_Fleet_ID = fleet_id OR Allowed_Fleet_ID = 'ALL')
  );

-- Apply Row Access Policy to Fact Table
ALTER TABLE CORE.FACT_CHARGING_SESSIONS ADD ROW ACCESS POLICY GOVERNANCE.RAP_FLEET_SECURITY ON (Fleet_ID);

-- ----------------------------------------------------------------------------
-- 3. ZERO-COPY CLONING (PROD TO DEV / STAGING REPLICATION)
-- ----------------------------------------------------------------------------

-- Clone Production Database instantly without data duplication
CREATE DATABASE IF NOT EXISTS EV_FLEET_DB_DEV CLONE EV_FLEET_DB
  COMMENT = 'Zero-copy development environment clone created for staging & testing';

CREATE DATABASE IF NOT EXISTS EV_FLEET_DB_STAGING CLONE EV_FLEET_DB
  COMMENT = 'Zero-copy staging environment clone created for QA automation';

-- ----------------------------------------------------------------------------
-- 4. TIME TRAVEL POINT-IN-TIME RECOVERY
-- ----------------------------------------------------------------------------

-- Query data as it existed 1 hour ago
SELECT * FROM CORE.FACT_CHARGING_SESSIONS AT(OFFSET => -3600);

-- Restore accidentally dropped table via Time Travel UNDROP
-- UNDROP TABLE CORE.FACT_CHARGING_SESSIONS;

SELECT 'Expert Security, RLS, Zero-Copy Cloning, and Time Travel deployed successfully' AS STATUS;
