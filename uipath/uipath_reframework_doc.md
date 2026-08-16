# Enterprise UiPath REFramework (Robotic Enterprise Framework) Architecture

## Overview
The **EV Fleet Enterprise RPA Orchestrator** is built using UiPath's industry-standard **Robotic Enterprise Framework (REFramework)** state machine pattern. It provides enterprise-grade exception handling, automated retry logic, Config.xlsx credential management, and detailed audit logging for mission-critical EV fleet telemetry ingestion.

```
       ┌─────────────────────────────────────────────────────────────┐
       │                        INITIALIZATION                       │
       │  Read Config.xlsx, Get Credentials, Init Snowflake & PBI     │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                    GET TRANSACTION DATA                     │
       │  Poll Internal Stage / Queue for Unprocessed CSV Batches     │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
                         ┌────────────┴────────────┐
                         │ Transaction Available?  │
                         └────────────┬────────────┘
                              YES │       │ NO
                                  │       └──────────────────────────────┐
                                  ▼                                      │
       ┌─────────────────────────────────────────────────────────────┐   │
       │                     PROCESS TRANSACTION                     │   │
       │  1. Ingest Stage CSV to Snowflake RAW                        │   │
       │  2. Execute SP_POPULATE_STAR_SCHEMA()                        │   │
       │  3. Trigger Power BI DirectLake REST API Refresh            │   │
       │  4. Export Executive KPI Excel Workbook                      │   │
       │  5. Dispatch Outlook HTML Email Notification                │   │
       └──────────────────────────────┬──────────────────────────────┘   │
                                      │                                  │
                   ┌──────────────────┴──────────────────┐               │
                   │ System Exception? / Retries < Max   │               │
                   └──────────────────┬──────────────────┘               │
                                  YES │       │ NO                       │
                                      │       └──────────────────────────┼──┐
                                      ▼                                  │  │
       ┌─────────────────────────────────────────────────────────────┐   │  │
       │                       END PROCESS                           │◄──┘  │
       │  Close Connections, Write Audit Logs, Release Queue Lock    │      │
       └─────────────────────────────────────────────────────────────┘      │
                                      ▲                                     │
                                      └─────────────────────────────────────┘
```

---

## State Machine Breakdown

| State | Role & Activities | Exception / Retry Strategy |
|---|---|---|
| **Initialization** | Loads `Config.xlsx`, retrieves Snowflake DSN credentials from UiPath Orchestrator Assets, tests ODBC database connection. | If connection fails, log fatal error and terminate workflow cleanly. |
| **Get Transaction Data** | Reads unprocessed CSV file paths from stage folder `.\data\stage\` into a `QueueItem` array. | If no transaction items remain, transition cleanly to **End Process**. |
| **Process Transaction** | 1. Executes Snowflake `COPY INTO`.<br>2. Invokes `SP_POPULATE_STAR_SCHEMA()`.<br>3. Posts refresh request to Power BI REST API (`POST /refreshes`).<br>4. Generates Excel Report.<br>5. Sends Outlook Email with HTML KPI metrics. | If a `BusinessRuleException` occurs (e.g. invalid SOH value), log error and skip transaction.<br>If a `SystemException` occurs, increment retry count (Max Retries = 3). |
| **End Process** | Closes database connections, updates `GOVERNANCE.AUDIT_LOGS`, and dispatches pipeline summary report. | Always executes cleanup even after critical errors. |
