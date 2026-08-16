-- ============================================================================
-- SNOWFLAKE STEP 1: DATABASE, SCHEMA, WAREHOUSE & ROLE PROVISIONING
-- ============================================================================

-- 1. Create Virtual Warehouses
CREATE WAREHOUSE IF NOT EXISTS EV_ETL_WH
  WITH WAREHOUSE_SIZE = 'MEDIUM'
  AUTO_SUSPEND = 300
  AUTO_RESUME = TRUE
  MIN_CLUSTER_COUNT = 1
  MAX_CLUSTER_COUNT = 3
  SCALING_POLICY = 'STANDARD'
  COMMENT = 'Dedicated warehouse for Alteryx & UiPath ingestion jobs';

CREATE WAREHOUSE IF NOT EXISTS EV_ANALYTICS_WH
  WITH WAREHOUSE_SIZE = 'LARGE'
  AUTO_SUSPEND = 180
  AUTO_RESUME = TRUE
  COMMENT = 'Dedicated warehouse for Power BI, Fabric & AI queries';

-- 2. Create Database
CREATE DATABASE IF NOT EXISTS EV_FLEET_DB
  DATA_RETENTION_TIME_IN_DAYS = 30
  COMMENT = 'Enterprise EV Fleet Charging & Battery Health Data Platform Database';

-- 3. Create Multi-Layered Enterprise Schemas
USE DATABASE EV_FLEET_DB;

CREATE SCHEMA IF NOT EXISTS RAW
  COMMENT = 'Raw landing layer for CSV uploads from Alteryx/UiPath';

CREATE SCHEMA IF NOT EXISTS STAGING
  COMMENT = 'Cleaned & normalized transactional staging data';

CREATE SCHEMA IF NOT EXISTS CORE
  COMMENT = 'Dimensional & Fact Data Warehouse tables (Star Schema)';

CREATE SCHEMA IF NOT EXISTS MART
  COMMENT = 'Business Views & Aggregated Data Marts for Power BI / Fabric';

CREATE SCHEMA IF NOT EXISTS GOVERNANCE
  COMMENT = 'Audit logs, data quality exceptions, and RBAC security policies';

-- 4. Create Functional RBAC Roles
CREATE ROLE IF NOT EXISTS EV_ADMIN;
CREATE ROLE IF NOT EXISTS EV_DATA_ENGINEER;
CREATE ROLE IF NOT EXISTS EV_ANALYST;
CREATE ROLE IF NOT EXISTS EV_MAINTENANCE_TECH;

-- Grant Schema Privileges
GRANT ALL ON DATABASE EV_FLEET_DB TO ROLE EV_ADMIN;
GRANT ALL ON ALL SCHEMAS IN DATABASE EV_FLEET_DB TO ROLE EV_DATA_ENGINEER;
GRANT USAGE ON DATABASE EV_FLEET_DB TO ROLE EV_ANALYST;
GRANT USAGE ON SCHEMA EV_FLEET_DB.MART TO ROLE EV_ANALYST;
GRANT SELECT ON ALL VIEWS IN SCHEMA EV_FLEET_DB.MART TO ROLE EV_ANALYST;

SELECT 'Snowflake setup initialized successfully' AS STATUS;
