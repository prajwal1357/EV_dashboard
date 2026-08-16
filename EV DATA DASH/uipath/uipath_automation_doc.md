# Step 3: UiPath Robotic Process Automation (RPA) Specification

## Automation Goal
Automate the end-to-end operational pipeline: monitor incoming cleaned CSV files, execute Snowflake stage ingestion, trigger Power BI dataset refresh via REST API, render and export daily executive Excel/PDF reports, send email digests to fleet managers via Microsoft Outlook/SMTP, and maintain structured audit logs.

```
                  ┌───────────────────────────────┐
                  │    Trigger / File Watcher     │
                  │   Detect New Cleaned CSV File │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │   Snowflake ODBC Connection   │
                  │  Execute SP_POPULATE_STAR_SCHEMA│
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │   Power BI REST API Call      │
                  │  Post /datasets/{id}/refreshes│
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │ Excel Report Generation Engine│
                  │ Export Daily Executive Metrics│
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │ Send Outlook / SMTP Email     │
                  │ Dispatch KPI Summary & Attach │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │    Audit & Logging System     │
                  │ Log Status to Database & Log  │
                  └───────────────────────────────┘
```

---

## UiPath Sequence Architecture (`Main.xaml`)

### 1. File Watcher & Ingestion
- **Activity**: `File Exists` / `Path Exists` on `.\data\cleaned_ev_fleet_charging_data.csv`.
- **Condition**: If file exists, copy to Snowflake stage archive folder `.\data\archive\EV_Fleet_RAW_%TIMESTAMP%.csv`.

### 2. Snowflake Connection & Procedure Execution
- **Activity**: `Database Connect` (Provider: `System.Data.Odbc`, ConnectionString: `DSN=Snowflake_EV_DB;UID=UIPATH_ROBOT;PWD=*****`).
- **Activity**: `Execute Non-Query` (SQL Command: `CALL EV_FLEET_DB.CORE.SP_POPULATE_STAR_SCHEMA();`).

### 3. Power BI Dataset Refresh Automation
- **Activity**: `HTTP Request` (OAuth2 authentication).
- **Method**: `POST`
- **Endpoint**: `https://api.powerbi.com/v1.0/myorg/groups/{workspace_id}/datasets/{dataset_id}/refreshes`
- **Headers**: `Authorization: Bearer {access_token}`.

### 4. Excel Executive Report Export
- **Activity**: `Execute Query` to fetch `SELECT * FROM MART.VW_FLEET_EXECUTIVE_SUMMARY;`.
- **Activity**: `Write Range Workbook` outputting to `.\reports\EV_Fleet_Executive_Report_%DATE%.xlsx`.

### 5. Email Dispatch Notification
- **Activity**: `Send Outlook Mail Message` / `Send SMTP Mail Message`.
- **To**: `fleet.managers@enterprise.com`, `maintenance@enterprise.com`
- **Subject**: `[AUTOMATED REPORT] Daily EV Fleet Battery Health & Charging Summary - %DATE%`
- **Body HTML**: Includes HTML KPI card table (Total Vehicles, Avg SOH %, Critical Count, Total Cost).
- **Attachments**: `EV_Fleet_Executive_Report_%DATE%.xlsx`.

### 6. Exception Handling & Logging
- Wrapped inside a `Try Catch` block (`System.Exception` handling).
- On Success: Logs execution metrics to `GOVERNANCE.AUDIT_LOGS` with status `'SUCCESS'`.
- On Failure: Captures error traceback, updates log with status `'FAILED'`, and dispatches critical alert email to IT Support.
